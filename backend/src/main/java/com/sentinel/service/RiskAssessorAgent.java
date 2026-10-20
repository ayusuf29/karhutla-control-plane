package com.sentinel.service;

import com.sentinel.dto.AgentDto;
import com.sentinel.entity.H3DailyRiskSnapshot;
import com.sentinel.entity.PeatH3Grid;
import com.sentinel.grpc.BatchRiskRequest;
import com.sentinel.grpc.BatchRiskResponse;
import com.sentinel.grpc.H3FeatureVector;
import com.sentinel.grpc.H3RiskResult;
import com.sentinel.repository.H3DailyRiskSnapshotRepository;
import com.sentinel.repository.PeatH3GridRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RiskAssessorAgent {

    private static final Logger log = LoggerFactory.getLogger(RiskAssessorAgent.class);

    private final PeatH3GridRepository gridRepository;
    private final H3DailyRiskSnapshotRepository snapshotRepository;
    private final PythonInferenceClient pythonInferenceClient;

    private final H3SpatialService spatialService;

    public RiskAssessorAgent(
            PeatH3GridRepository gridRepository,
            H3DailyRiskSnapshotRepository snapshotRepository,
            PythonInferenceClient pythonInferenceClient,
            H3SpatialService spatialService) {
        this.gridRepository = gridRepository;
        this.snapshotRepository = snapshotRepository;
        this.pythonInferenceClient = pythonInferenceClient;
        this.spatialService = spatialService;
    }

    @Transactional(readOnly = true)
    public AgentDto.AssessorSummary evaluateCurrentRiskSummary() {
        H3DailyRiskSnapshotRepository.RiskSummaryProjection agg = snapshotRepository.findLatestRiskSummaryAggregates();
        if (agg == null || agg.getTotalHexagons() == 0) {
            return new AgentDto.AssessorSummary(0, 0, 0, 0, 0, 0.0, 0.0, 0, "No snapshots recorded yet.", "Run initial data ingestion.");
        }

        String narrative = String.format(
                "Pemantauan aktif mencakup %d heksagon gambut nasional. Terdeteksi %d area risiko ekstrem dan %d area risiko tinggi. Rata-rata GWL berada pada %.1f cm.",
                agg.getTotalHexagons(), agg.getExtremeRiskCount(), agg.getHighRiskCount(), agg.getAverageGwlCm()
        );
        String recommendation = agg.getExtremeRiskCount() > 0
                ? "Prioritaskan pembasahan darat dan aktivasi pintu sekat kanal pada heksagon prioritas."
                : "Pertahankan patroli rutin pencegahan.";

        int ext = (int) agg.getExtremeRiskCount();
        int omc = Math.min(25, ext / 4 + (ext > 0 ? 2 : 0));

        return new AgentDto.AssessorSummary(
                (int) agg.getTotalHexagons(),
                ext,
                (int) agg.getHighRiskCount(),
                (int) agg.getMediumRiskCount(),
                (int) agg.getLowRiskCount(),
                Math.round(agg.getAverageGwlCm() * 10.0) / 10.0,
                Math.round(agg.getAverageRiskScore() * 100.0) / 100.0,
                (int) agg.getSarClearingAlertCount(),
                omc,
                narrative,
                recommendation
        );
    }

    public AgentDto.AssessorSummary evaluateRiskSummaryFromSnapshots(List<H3DailyRiskSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) {
            return new AgentDto.AssessorSummary(0, 0, 0, 0, 0, 0.0, 0.0, 0, 0, "No snapshots recorded yet.", "Run initial data ingestion.");
        }

        int extreme = 0;
        int high = 0;
        int medium = 0;
        int low = 0;
        double sumGwl = 0.0;
        double sumScore = 0.0;
        int sarAlerts = 0;

        for (H3DailyRiskSnapshot s : snapshots) {
            sumGwl += s.getGwlCm();
            sumScore += s.getIgnitionRiskScore();
            if (Boolean.TRUE.equals(s.getSarClearingDetected())) {
                sarAlerts++;
            }

            switch (s.getRiskCategory()) {
                case "EXTREME" -> extreme++;
                case "HIGH" -> high++;
                case "MEDIUM" -> medium++;
                default -> low++;
            }
        }

        int total = snapshots.size();
        double avgGwl = Math.round((sumGwl / total) * 100.0) / 100.0;
        double avgScore = Math.round((sumScore / total) * 1000.0) / 1000.0;
        int omc = Math.min(25, extreme / 4 + (extreme > 0 ? 2 : 0));

        String diagnosis = generatePrescriptiveDiagnosis(extreme, high, avgGwl, sarAlerts);
        String strategy = generateOverallStrategy(extreme, sarAlerts);

        return new AgentDto.AssessorSummary(
                total, extreme, high, medium, low,
                avgGwl, avgScore, sarAlerts, omc, diagnosis, strategy
        );
    }

    @Transactional
    public BatchRiskResponse triggerBatchReassessment(String regionId) {
        log.info("Agent 1 (RiskAssessorAgent) triggering batch reassessment for region: {}", regionId);
        List<PeatH3Grid> grids = gridRepository.findAll();
        List<H3DailyRiskSnapshot> latest = snapshotRepository.findLatestSnapshotsForAllHexagons();
        Map<String, H3DailyRiskSnapshot> snapshotMap = latest.stream()
                .collect(Collectors.toMap(H3DailyRiskSnapshot::getH3Index, s -> s, (s1, s2) -> s1));

        List<H3FeatureVector> features = new ArrayList<>();
        for (PeatH3Grid g : grids) {
            H3DailyRiskSnapshot s = snapshotMap.get(g.getH3Index());
            double gwl = s != null ? s.getGwlCm() : -35.0;
            int dwr = s != null ? s.getDaysWithoutRain() : 10;
            double vpd = s != null ? s.getVpdKpa() : 2.5;

            features.add(new H3FeatureVector(
                    g.getH3Index(),
                    g.getPeatDepthMeters() != null ? g.getPeatDepthMeters() : 2.0,
                    gwl,
                    dwr,
                    vpd,
                    g.getDistanceToRoadMeters() != null ? g.getDistanceToRoadMeters() : 1000.0,
                    g.getDistanceToCanalMeters() != null ? g.getDistanceToCanalMeters() : 500.0
            ));
        }

        BatchRiskRequest request = new BatchRiskRequest(regionId != null ? regionId : "ALL_PILOT_AREAS", features);
        BatchRiskResponse response = pythonInferenceClient.evaluateBatch(request);

        // Update database with fresh reassessment results in batch
        List<H3DailyRiskSnapshot> toSave = new ArrayList<>();
        for (H3RiskResult res : response.getResults()) {
            H3DailyRiskSnapshot existing = snapshotMap.get(res.getH3Index());
            if (existing != null) {
                existing.setIgnitionRiskScore(res.getRiskScore());
                existing.setRiskCategory(res.getRiskCategory());
                if (res.isSarAnomalyFlag()) {
                    existing.setSarClearingDetected(true);
                }
                toSave.add(existing);
            }
        }
        if (!toSave.isEmpty()) {
            snapshotRepository.saveAll(toSave);
            spatialService.invalidateCache();
        }

        return response;
    }

    private String generatePrescriptiveDiagnosis(int extreme, int high, double avgGwl, int sarAlerts) {
        if (extreme > 0 || sarAlerts > 0) {
            return String.format(
                    "STATUS DARURAT: Terdeteksi %d heksagon berisiko EXTREME dan %d alert land-clearing SAR. Rata-rata GWL gambut berada di %.1f cm (melampaui ambang kritis PP 57/2016 < -40 cm). Potensi penyalaan api tinggi dalam 7-14 hari.",
                    extreme, sarAlerts, avgGwl
            );
        } else if (high > 5) {
            return String.format(
                    "STATUS WASPADA TINGGI: %d heksagon berstatus HIGH. Tinggi muka air tanah mendekati ambang deplesi (%.1f cm). Diperlukan patroli preventif dan pengecekan sekat kanal.",
                    high, avgGwl
            );
        } else {
            return String.format(
                    "STATUS TERKENDALI: Mayoritas sel heksagon dalam status LOW/MEDIUM. Rata-rata GWL %.1f cm masih dalam batas hidrologis toleransi.",
                    avgGwl
            );
        }
    }

    private String generateOverallStrategy(int extreme, int sarAlerts) {
        if (extreme > 0) {
            return "Luncurkan regu patroli darat Manggala Agni untuk pembasahan kanal segera, dan ajukan koordinat semai awan (OMC) ke BMKG/TNI AU.";
        }
        return "Pertahankan patroli rutin harian dan monitoring berkala sensor GWL.";
    }
}
