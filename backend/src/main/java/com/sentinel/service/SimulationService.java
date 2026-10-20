package com.sentinel.service;

import com.sentinel.dto.AgentDto;
import com.sentinel.dto.SimulationDto;
import com.sentinel.entity.H3DailyRiskSnapshot;
import com.sentinel.entity.PeatH3Grid;
import com.sentinel.entity.SimulationRun;
import com.sentinel.grpc.BatchRiskRequest;
import com.sentinel.grpc.BatchRiskResponse;
import com.sentinel.grpc.H3FeatureVector;
import com.sentinel.grpc.H3RiskResult;
import com.sentinel.repository.H3DailyRiskSnapshotRepository;
import com.sentinel.repository.PeatH3GridRepository;
import com.sentinel.repository.SimulationRunRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SimulationService {

    private static final Logger log = LoggerFactory.getLogger(SimulationService.class);

    private final PeatH3GridRepository gridRepository;
    private final H3DailyRiskSnapshotRepository snapshotRepository;
    private final SimulationRunRepository simulationRunRepository;
    private final PythonInferenceClient pythonInferenceClient;
    private final H3SpatialService spatialService;
    private final PatrolOptimizerAgent patrolOptimizerAgent;

    public SimulationService(
            PeatH3GridRepository gridRepository,
            H3DailyRiskSnapshotRepository snapshotRepository,
            SimulationRunRepository simulationRunRepository,
            PythonInferenceClient pythonInferenceClient,
            H3SpatialService spatialService,
            PatrolOptimizerAgent patrolOptimizerAgent) {
        this.gridRepository = gridRepository;
        this.snapshotRepository = snapshotRepository;
        this.simulationRunRepository = simulationRunRepository;
        this.pythonInferenceClient = pythonInferenceClient;
        this.spatialService = spatialService;
        this.patrolOptimizerAgent = patrolOptimizerAgent;
    }

    @Transactional
    public SimulationDto.RunResult runSimulation(SimulationDto.RunRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("Starting Climate Crisis Simulation: '{}' with HTH Δ={}, GWL Δ={}, VPD Δ={}, SAR Boost={}",
                request.scenarioName(), request.dwrDelta(), request.gwlDelta(), request.vpdDelta(), request.sarBoost());

        // 1. Ensure baseline values exist before modifying
        snapshotRepository.initializeBaselinesIfEmpty();

        // 2. Capture 'before' stats
        SimulationDto.SimulationStats beforeStats = captureCurrentStats();

        // 3. Load all peat grids & current snapshots
        List<PeatH3Grid> grids = gridRepository.findAll();
        List<H3DailyRiskSnapshot> snapshots = snapshotRepository.findLatestSnapshotsForAllHexagons();
        Map<String, H3DailyRiskSnapshot> snapshotMap = snapshots.stream()
                .collect(Collectors.toMap(H3DailyRiskSnapshot::getH3Index, s -> s, (s1, s2) -> s1));

        int dwrDelta = request.dwrDelta() != null ? request.dwrDelta() : 0;
        double gwlDelta = request.gwlDelta() != null ? request.gwlDelta() : 0.0;
        double vpdDelta = request.vpdDelta() != null ? request.vpdDelta() : 0.0;
        boolean sarBoost = Boolean.TRUE.equals(request.sarBoost());

        // 4. Construct simulated features based on baseline
        List<H3FeatureVector> featureVectors = new ArrayList<>();
        for (PeatH3Grid g : grids) {
            H3DailyRiskSnapshot s = snapshotMap.get(g.getH3Index());

            double baseGwl = (s != null && s.getBaselineGwlCm() != null) ? s.getBaselineGwlCm() : (s != null ? s.getGwlCm() : -35.0);
            int baseDwr = (s != null && s.getBaselineDaysWithoutRain() != null) ? s.getBaselineDaysWithoutRain() : (s != null ? s.getDaysWithoutRain() : 5);
            double baseVpd = (s != null && s.getBaselineVpdKpa() != null) ? s.getBaselineVpdKpa() : (s != null ? s.getVpdKpa() : 1.5);

            double simGwl = Math.round((baseGwl + gwlDelta) * 100.0) / 100.0;
            int simDwr = Math.max(0, baseDwr + dwrDelta);
            double simVpd = Math.max(0.2, Math.round((baseVpd + vpdDelta) * 100.0) / 100.0);

            featureVectors.add(new H3FeatureVector(
                    g.getH3Index(),
                    g.getPeatDepthMeters() != null ? g.getPeatDepthMeters() : 2.0,
                    simGwl,
                    simDwr,
                    simVpd,
                    g.getDistanceToRoadMeters() != null ? g.getDistanceToRoadMeters() : 1000.0,
                    g.getDistanceToCanalMeters() != null ? g.getDistanceToCanalMeters() : 500.0
            ));
        }

        // 5. Evaluate batch through XGBoost inference engine
        BatchRiskRequest batchReq = new BatchRiskRequest("ALL_PILOT_AREAS", featureVectors);
        BatchRiskResponse response = pythonInferenceClient.evaluateBatch(batchReq);

        // 6. Update snapshots in database with simulated results
        List<H3DailyRiskSnapshot> updatedSnapshots = new ArrayList<>();
        Map<String, H3RiskResult> resultMap = response.getResults().stream()
                .collect(Collectors.toMap(H3RiskResult::getH3Index, r -> r, (r1, r2) -> r1));

        int extremeCount = 0;
        int highCount = 0;
        int mediumCount = 0;
        int lowCount = 0;
        double sumGwl = 0.0;
        double sumScore = 0.0;
        int sarAlertCount = 0;

        for (H3FeatureVector f : featureVectors) {
            H3DailyRiskSnapshot snap = snapshotMap.get(f.getH3Index());
            H3RiskResult res = resultMap.get(f.getH3Index());

            if (snap != null && res != null) {
                snap.setGwlCm(f.getGroundWaterLevelCm());
                snap.setDaysWithoutRain(f.getDaysWithoutRain());
                snap.setVpdKpa(f.getVaporPressureDeficit());
                snap.setIgnitionRiskScore(res.getRiskScore());
                snap.setRiskCategory(res.getRiskCategory());

                boolean sarDetected = res.isSarAnomalyFlag();
                if (sarBoost && (res.getRiskCategory().equals("EXTREME") || res.getRiskScore() >= 0.70)) {
                    sarDetected = true;
                }
                snap.setSarClearingDetected(sarDetected);

                String action = switch (res.getRiskCategory()) {
                    case "EXTREME" -> "IMMEDIATE_PATROL_DISPATCH";
                    case "HIGH" -> "WATER_SATURATION";
                    case "MEDIUM" -> "CANAL_BLOCK_CHECK";
                    default -> "ROUTINE_MONITORING";
                };
                snap.setRecommendedAction(action);

                // Stats calculation
                sumGwl += snap.getGwlCm();
                sumScore += snap.getIgnitionRiskScore();
                if (sarDetected) sarAlertCount++;
                switch (snap.getRiskCategory()) {
                    case "EXTREME" -> extremeCount++;
                    case "HIGH" -> highCount++;
                    case "MEDIUM" -> mediumCount++;
                    default -> lowCount++;
                }

                updatedSnapshots.add(snap);
            }
        }

        snapshotRepository.saveAll(updatedSnapshots);

        // Invalidate spatial & agent caches
        spatialService.invalidateCache();
        patrolOptimizerAgent.invalidateCache();

        long execTimeMs = System.currentTimeMillis() - startTime;

        // 7. Save to simulation_run table
        // Mark previous runs as inactive
        List<SimulationRun> previousRuns = simulationRunRepository.findAll();
        for (SimulationRun prev : previousRuns) {
            prev.setIsActive(false);
        }
        simulationRunRepository.saveAll(previousRuns);

        int totalHex = updatedSnapshots.size();
        double avgGwl = totalHex > 0 ? Math.round((sumGwl / totalHex) * 100.0) / 100.0 : 0.0;
        double avgScore = totalHex > 0 ? Math.round((sumScore / totalHex) * 1000.0) / 1000.0 : 0.0;
        int omcTargets = Math.min(25, extremeCount / 4 + 2);

        SimulationRun run = new SimulationRun();
        run.setScenarioName(request.scenarioName() != null && !request.scenarioName().isBlank()
                ? request.scenarioName()
                : "Simulasi Kemarau +" + dwrDelta + "d (" + gwlDelta + "cm)");
        run.setDwrDelta(dwrDelta);
        run.setGwlDelta(gwlDelta);
        run.setVpdDelta(vpdDelta);
        run.setSarBoost(sarBoost);
        run.setTotalHexagons(totalHex);
        run.setExtremeCount(extremeCount);
        run.setHighCount(highCount);
        run.setMediumCount(mediumCount);
        run.setLowCount(lowCount);
        run.setAvgGwlCm(avgGwl);
        run.setAvgRiskScore(avgScore);
        run.setSarAlerts(sarAlertCount);
        run.setOmcTargets(omcTargets);
        run.setExecutionTimeMs(execTimeMs);
        run.setIsActive(true);
        run.setCreatedAt(Instant.now());

        SimulationRun savedRun = simulationRunRepository.save(run);

        // 8. Construct After and Deltas
        SimulationDto.SimulationStats afterStats = new SimulationDto.SimulationStats(
                totalHex, extremeCount, highCount, mediumCount, lowCount, avgGwl, avgScore, sarAlertCount, omcTargets
        );

        SimulationDto.SimulationDeltas deltas = new SimulationDto.SimulationDeltas(
                afterStats.extremeCount() - beforeStats.extremeCount(),
                afterStats.highCount() - beforeStats.highCount(),
                Math.round((afterStats.avgGwlCm() - beforeStats.avgGwlCm()) * 10.0) / 10.0,
                Math.round((afterStats.avgRiskScore() - beforeStats.avgRiskScore()) * 1000.0) / 1000.0,
                afterStats.sarAlerts() - beforeStats.sarAlerts(),
                afterStats.omcTargets() - beforeStats.omcTargets()
        );

        log.info("Simulation '{}' completed in {}ms. Extreme: {} -> {} (Δ={})",
                savedRun.getScenarioName(), execTimeMs, beforeStats.extremeCount(), afterStats.extremeCount(), deltas.extremeDiff());

        return new SimulationDto.RunResult(
                savedRun.getId(),
                savedRun.getScenarioName(),
                execTimeMs,
                beforeStats,
                afterStats,
                deltas,
                true
        );
    }

    @Transactional
    public SimulationDto.SimulationStats resetToBaseline() {
        log.info("Resetting all 35,216 hexagons to actual baseline telemetry...");
        snapshotRepository.restoreBaseline();

        // Deactivate all simulation runs
        List<SimulationRun> runs = simulationRunRepository.findAll();
        for (SimulationRun r : runs) {
            r.setIsActive(false);
        }
        simulationRunRepository.saveAll(runs);

        spatialService.invalidateCache();
        patrolOptimizerAgent.invalidateCache();

        return captureCurrentStats();
    }

    @Transactional(readOnly = true)
    public List<SimulationDto.HistoryItem> getHistory() {
        return simulationRunRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(r -> new SimulationDto.HistoryItem(
                        r.getId(),
                        r.getScenarioName(),
                        r.getDwrDelta(),
                        r.getGwlDelta(),
                        r.getVpdDelta(),
                        Boolean.TRUE.equals(r.getSarBoost()),
                        r.getTotalHexagons() != null ? r.getTotalHexagons() : 0,
                        r.getExtremeCount() != null ? r.getExtremeCount() : 0,
                        r.getHighCount() != null ? r.getHighCount() : 0,
                        r.getMediumCount() != null ? r.getMediumCount() : 0,
                        r.getLowCount() != null ? r.getLowCount() : 0,
                        r.getAvgGwlCm() != null ? r.getAvgGwlCm() : 0.0,
                        r.getAvgRiskScore() != null ? r.getAvgRiskScore() : 0.0,
                        r.getSarAlerts() != null ? r.getSarAlerts() : 0,
                        r.getOmcTargets() != null ? r.getOmcTargets() : 0,
                        r.getExecutionTimeMs() != null ? r.getExecutionTimeMs() : 0L,
                        Boolean.TRUE.equals(r.getIsActive()),
                        r.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public SimulationDto.RunResult applyHistory(Long simulationId) {
        SimulationRun run = simulationRunRepository.findById(simulationId)
                .orElseThrow(() -> new IllegalArgumentException("Simulation run not found with ID: " + simulationId));

        log.info("Re-applying simulation from history: ID={}, Name='{}'", run.getId(), run.getScenarioName());

        SimulationDto.RunRequest req = new SimulationDto.RunRequest(
                run.getScenarioName(),
                run.getDwrDelta(),
                run.getGwlDelta(),
                run.getVpdDelta(),
                run.getSarBoost()
        );

        return runSimulation(req);
    }

    @Transactional
    public void deleteHistory(Long simulationId) {
        simulationRunRepository.deleteById(simulationId);
    }

    @Transactional(readOnly = true)
    public Optional<SimulationDto.HistoryItem> getActiveSimulation() {
        return simulationRunRepository.findFirstByIsActiveTrueOrderByCreatedAtDesc()
                .map(r -> new SimulationDto.HistoryItem(
                        r.getId(),
                        r.getScenarioName(),
                        r.getDwrDelta(),
                        r.getGwlDelta(),
                        r.getVpdDelta(),
                        Boolean.TRUE.equals(r.getSarBoost()),
                        r.getTotalHexagons() != null ? r.getTotalHexagons() : 0,
                        r.getExtremeCount() != null ? r.getExtremeCount() : 0,
                        r.getHighCount() != null ? r.getHighCount() : 0,
                        r.getMediumCount() != null ? r.getMediumCount() : 0,
                        r.getLowCount() != null ? r.getLowCount() : 0,
                        r.getAvgGwlCm() != null ? r.getAvgGwlCm() : 0.0,
                        r.getAvgRiskScore() != null ? r.getAvgRiskScore() : 0.0,
                        r.getSarAlerts() != null ? r.getSarAlerts() : 0,
                        r.getOmcTargets() != null ? r.getOmcTargets() : 0,
                        r.getExecutionTimeMs() != null ? r.getExecutionTimeMs() : 0L,
                        Boolean.TRUE.equals(r.getIsActive()),
                        r.getCreatedAt()
                ));
    }

    private SimulationDto.SimulationStats captureCurrentStats() {
        H3DailyRiskSnapshotRepository.RiskSummaryProjection agg = snapshotRepository.findLatestRiskSummaryAggregates();
        if (agg == null) {
            return new SimulationDto.SimulationStats(0, 0, 0, 0, 0, 0.0, 0.0, 0, 0);
        }
        int ext = (int) agg.getExtremeRiskCount();
        int omc = Math.min(25, ext / 4 + (ext > 0 ? 2 : 0));
        return new SimulationDto.SimulationStats(
                (int) agg.getTotalHexagons(),
                ext,
                (int) agg.getHighRiskCount(),
                (int) agg.getMediumRiskCount(),
                (int) agg.getLowRiskCount(),
                Math.round(agg.getAverageGwlCm() * 10.0) / 10.0,
                Math.round(agg.getAverageRiskScore() * 1000.0) / 1000.0,
                (int) agg.getSarClearingAlertCount(),
                omc
        );
    }
}
