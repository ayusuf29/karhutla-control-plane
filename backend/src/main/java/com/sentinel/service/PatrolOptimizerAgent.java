package com.sentinel.service;

import com.sentinel.dto.AgentDto;
import com.sentinel.entity.H3DailyRiskSnapshot;
import com.sentinel.entity.PeatH3Grid;
import com.sentinel.repository.H3DailyRiskSnapshotRepository;
import com.sentinel.repository.PeatH3GridRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatrolOptimizerAgent {

    private static final Logger log = LoggerFactory.getLogger(PatrolOptimizerAgent.class);

    private final PeatH3GridRepository gridRepository;
    private final H3DailyRiskSnapshotRepository snapshotRepository;
    private final RiskAssessorAgent riskAssessorAgent;
    private final DeepMindSupervisorAgent deepMindSupervisorAgent;
    private final com.sentinel.repository.ManggalaAgniDaopsRepository daopsRepository;

    public PatrolOptimizerAgent(
            PeatH3GridRepository gridRepository,
            H3DailyRiskSnapshotRepository snapshotRepository,
            RiskAssessorAgent riskAssessorAgent,
            DeepMindSupervisorAgent deepMindSupervisorAgent,
            com.sentinel.repository.ManggalaAgniDaopsRepository daopsRepository) {
        this.gridRepository = gridRepository;
        this.snapshotRepository = snapshotRepository;
        this.riskAssessorAgent = riskAssessorAgent;
        this.deepMindSupervisorAgent = deepMindSupervisorAgent;
        this.daopsRepository = daopsRepository;
    }

    private volatile AgentDto.RecommendationOverview cachedRecommendations = null;
    private volatile long cacheTimestamp = 0;
    private static final long CACHE_TTL_MS = 60_000;

    public synchronized void invalidateCache() {
        this.cachedRecommendations = null;
        this.cacheTimestamp = 0;
        log.info("PatrolOptimizerAgent recommendation cache invalidated.");
    }

    public com.sentinel.entity.ManggalaAgniDaops findNearestDaops(double lat, double lon) {
        return daopsRepository.findNearestDaops(lon, lat).orElse(null);
    }

    public List<com.sentinel.entity.ManggalaAgniDaops> getAllDaops() {
        return daopsRepository.findAll();
    }

    @Transactional(readOnly = true)
    public AgentDto.RecommendationOverview generateFullRecommendations() {
        if (cachedRecommendations != null && (System.currentTimeMillis() - cacheTimestamp) < CACHE_TTL_MS) {
            return cachedRecommendations;
        }

        AgentDto.AssessorSummary assessorSummary = riskAssessorAgent.evaluateCurrentRiskSummary();

        List<H3DailyRiskSnapshot> criticalCells = snapshotRepository.findTopCriticalSnapshots();
        List<H3DailyRiskSnapshot> dryingCells = snapshotRepository.findTopDryingSnapshots();
        List<H3DailyRiskSnapshot> sarHits = snapshotRepository.findTopSarAlerts();

        // Extract H3 indices needed for these records
        Set<String> neededHexIds = new HashSet<>();
        criticalCells.forEach(c -> neededHexIds.add(c.getH3Index()));
        dryingCells.forEach(c -> neededHexIds.add(c.getH3Index()));
        sarHits.forEach(c -> neededHexIds.add(c.getH3Index()));

        List<PeatH3Grid> grids = gridRepository.findAllById(neededHexIds);
        Map<String, PeatH3Grid> gridMap = grids.stream()
                .collect(Collectors.toMap(PeatH3Grid::getH3Index, g -> g, (g1, g2) -> g1));

        // Partition by region (Kalimantan vs Sumatera)
        List<H3DailyRiskSnapshot> kubuCritical = new ArrayList<>();
        List<H3DailyRiskSnapshot> pulangCritical = new ArrayList<>();
        List<H3DailyRiskSnapshot> sumateraCritical = new ArrayList<>();

        for (H3DailyRiskSnapshot s : criticalCells) {
            PeatH3Grid g = gridMap.get(s.getH3Index());
            if (g != null && g.getCentroid() != null) {
                double lon = g.getCentroid().getX();
                if (lon < 108.0) {
                    sumateraCritical.add(s);
                } else if (lon < 112.0) {
                    kubuCritical.add(s);
                } else {
                    pulangCritical.add(s);
                }
            }
        }

        // Fetch Daops stations from PostgreSQL PostGIS database
        com.sentinel.entity.ManggalaAgniDaops daopsKubu = daopsRepository.findByShortCode("KUBU_RAYA")
                .orElseGet(() -> daopsRepository.findNearestDaops(109.34, -0.25).orElse(null));
        com.sentinel.entity.ManggalaAgniDaops daopsPulang = daopsRepository.findByShortCode("PULANG_PISAU")
                .orElseGet(() -> daopsRepository.findNearestDaops(114.24, -2.74).orElse(null));
        com.sentinel.entity.ManggalaAgniDaops daopsSumatera = daopsRepository.findByShortCode("SIAK")
                .orElseGet(() -> daopsRepository.findNearestDaops(102.10, 0.55).orElse(null));
        com.sentinel.entity.ManggalaAgniDaops daopsRapid = daopsRepository.findByShortCode("RAPID_RESPONSE")
                .orElseGet(() -> daopsRepository.findNearestDaops(109.36, -0.28).orElse(null));

        List<AgentDto.PatrolCard> patrolCards = new ArrayList<>();

        // 1. Squad Alpha - Daops Kubu Raya
        patrolCards.add(buildSquadRoute(
                "DAOP-KBR-ALPHA",
                "Regu Alpha Daops Manggala Agni Kubu Raya",
                "Kab. Kubu Raya",
                daopsKubu,
                kubuCritical, gridMap, 4, "08:30 WIB"
        ));

        // 2. Squad Beta - Daops Pulang Pisau (Sebangau / Blok C)
        patrolCards.add(buildSquadRoute(
                "DAOP-PLP-BETA",
                "Regu Beta Daops Manggala Agni Pulang Pisau",
                "Kab. Pulang Pisau",
                daopsPulang,
                pulangCritical, gridMap, 4, "08:45 WIB"
        ));

        // 3. Squad Delta - Daops Riau & Jambi (Sumatera Peatlands)
        patrolCards.add(buildSquadRoute(
                "DAOP-RIAU-DELTA",
                "Regu Delta Daops Manggala Agni Riau & Jambi",
                "Kubah Gambut Sumatera",
                daopsSumatera,
                sumateraCritical, gridMap, 4, "08:30 WIB"
        ));

        // 4. Squad Charlie - Cadangan Khusus Patroli Cepat (Rapid Response)
        List<H3DailyRiskSnapshot> remainingCritical = new ArrayList<>(criticalCells);
        patrolCards.add(buildSquadRoute(
                "DAOP-RAPID-CHARLIE",
                "Regu Charlie Quick-Response (Water Saturation Squad)",
                "Lintas Wilayah Prioritas",
                daopsRapid,
                remainingCritical, gridMap, 3, "09:15 WIB"
        ));

        // Generate OMC Targets
        List<AgentDto.OmcTarget> omcTargets = buildOmcTargets(dryingCells, gridMap);

        // Generate SAR Alerts
        List<AgentDto.SarAlert> sarAlerts = buildSarAlerts(sarHits, gridMap);

        // Generate DeepMind Tactical Action Plan from critical cells
        AgentDto.TacticalActionPlan tacticalActionPlan = deepMindSupervisorAgent.generateTacticalActionPlan(
                criticalCells, gridMap, "Kubah Gambut Nasional (Kalimantan & Sumatera)"
        );

        AgentDto.RecommendationOverview overview = new AgentDto.RecommendationOverview(
                Instant.now(),
                "ACTIVE_MONITORING",
                assessorSummary,
                patrolCards,
                omcTargets,
                sarAlerts,
                tacticalActionPlan
        );

        this.cachedRecommendations = overview;
        this.cacheTimestamp = System.currentTimeMillis();
        return overview;
    }

    private AgentDto.PatrolCard buildSquadRoute(
            String squadId,
            String squadName,
            String regionName,
            com.sentinel.entity.ManggalaAgniDaops daops,
            List<H3DailyRiskSnapshot> candidateSnapshots,
            Map<String, PeatH3Grid> gridMap,
            int maxPoints,
            String startHour) {

        double baseLat = daops != null ? daops.getLatitude() : -0.25;
        double baseLon = daops != null ? daops.getLongitude() : 109.34;

        List<AgentDto.Waypoint> waypoints = new ArrayList<>();
        double totalDistanceKm = 0.0;
        double currentLat = baseLat;
        double currentLon = baseLon;

        List<H3DailyRiskSnapshot> selected = candidateSnapshots.stream()
                .limit(maxPoints)
                .toList();

        int seq = 1;
        int currentHourOffset = 0;

        for (H3DailyRiskSnapshot s : selected) {
            PeatH3Grid g = gridMap.get(s.getH3Index());
            if (g == null || g.getCentroid() == null) continue;

            double lat = g.getCentroid().getY();
            double lon = g.getCentroid().getX();

            double distKm = calculateDistanceKm(currentLat, currentLon, lat, lon);
            totalDistanceKm += distKm;
            currentLat = lat;
            currentLon = lon;

            int arrivalMin = 30 + (seq * 35);
            int hr = 8 + (arrivalMin / 60);
            int min = arrivalMin % 60;
            String arrivalStr = String.format("%02d:%02d WIB", hr, min);

            String action = s.getRecommendedAction() != null ? s.getRecommendedAction() : "WATER_SATURATION";
            String accessNote = String.format("Akses jalan: %.0fm, Akses kanal: %.0fm (Gambut: %.1fm)",
                    g.getDistanceToRoadMeters() != null ? g.getDistanceToRoadMeters() : 0.0,
                    g.getDistanceToCanalMeters() != null ? g.getDistanceToCanalMeters() : 0.0,
                    g.getPeatDepthMeters() != null ? g.getPeatDepthMeters() : 0.0
            );

            waypoints.add(new AgentDto.Waypoint(
                    seq++,
                    s.getH3Index(),
                    lat, lon,
                    s.getIgnitionRiskScore(),
                    s.getRiskCategory(),
                    s.getGwlCm(),
                    g.getPeatDepthMeters(),
                    g.getDistanceToRoadMeters(),
                    g.getDistanceToCanalMeters(),
                    g.getConcessionId(),
                    arrivalStr,
                    action,
                    accessNote
            ));
        }

        double estDurationHours = Math.round((2.0 + (waypoints.size() * 1.2)) * 10.0) / 10.0;
        totalDistanceKm = Math.round(totalDistanceKm * 10.0) / 10.0;

        List<String> equipment = List.of(
                "Pompa Apung Honda WT20X (High Head)",
                "Selang Semprot Karhutla 1.5 inch (300 meter)",
                "Drone Pemantau Thermal DJI Matrice 300",
                "Alat Ukur Muka Air Gambut Manual (Peat Ruler)"
        );

        AgentDto.PatrolCard card = new AgentDto.PatrolCard(
                squadId, squadName, regionName,
                "READY_FOR_DISPATCH",
                waypoints.size(),
                totalDistanceKm,
                estDurationHours,
                "Inspeksi kubah gambut kritis, aktivasi pembasahan sekat kanal & penindakan dini",
                equipment,
                waypoints
        );

        if (daops != null) {
            card.setDaopsId(daops.getDaopsId());
            card.setDaopsName(daops.getName());
            card.setCommanderName(daops.getCommanderName());
            card.setRadioFrequency(daops.getRadioFrequency());
            card.setPersonnelCount(daops.getPersonnelCount());
            card.setDepotLatitude(daops.getLatitude());
            card.setDepotLongitude(daops.getLongitude());
        }

        // Generate squad-specific DeepMind / Edge AI Tactical Action Plan
        AgentDto.TacticalActionPlan squadTacticalPlan = deepMindSupervisorAgent.generateTacticalActionPlan(
                selected, gridMap, regionName
        );
        card.setTacticalActionPlan(squadTacticalPlan);

        return card;
    }

    private List<AgentDto.OmcTarget> buildOmcTargets(List<H3DailyRiskSnapshot> snapshots, Map<String, PeatH3Grid> gridMap) {
        List<AgentDto.OmcTarget> targets = new ArrayList<>();

        List<H3DailyRiskSnapshot> extremeGwl = snapshots.stream()
                .filter(s -> s.getGwlCm() < -45.0)
                .sorted(Comparator.comparingDouble(H3DailyRiskSnapshot::getGwlCm))
                .limit(5)
                .toList();

        for (H3DailyRiskSnapshot s : extremeGwl) {
            PeatH3Grid g = gridMap.get(s.getH3Index());
            if (g == null || g.getCentroid() == null) continue;

            targets.add(new AgentDto.OmcTarget(
                    s.getH3Index(),
                    g.getCentroid().getY(),
                    g.getCentroid().getX(),
                    s.getGwlCm(),
                    s.getIgnitionRiskScore(),
                    "Cumulus Mediocris / Congestus (Altitude 3.000 - 5.000 ft)",
                    "800 kg NaCl Mikronis",
                    "URGENT",
                    "Kubah gambut mengalami kekeringan ekstrem melampaui -45 cm. Perlu pembasahan presipitasi segera."
            ));
        }

        return targets;
    }

    private List<AgentDto.SarAlert> buildSarAlerts(List<H3DailyRiskSnapshot> snapshots, Map<String, PeatH3Grid> gridMap) {
        List<AgentDto.SarAlert> alerts = new ArrayList<>();
        int count = 1;

        List<H3DailyRiskSnapshot> sarHits = snapshots.stream()
                .filter(s -> Boolean.TRUE.equals(s.getSarClearingDetected()))
                .sorted((a, b) -> Double.compare(b.getIgnitionRiskScore(), a.getIgnitionRiskScore()))
                .limit(50)
                .toList();

        for (H3DailyRiskSnapshot s : sarHits) {
            PeatH3Grid g = gridMap.get(s.getH3Index());
            if (g == null || g.getCentroid() == null) continue;

            alerts.add(new AgentDto.SarAlert(
                    "SAR-ALERT-2026-" + String.format("%03d", count++),
                    s.getH3Index(),
                    g.getCentroid().getY(),
                    g.getCentroid().getX(),
                    "1 jam yang lalu (Sentinel-1 C-Band Overpass)",
                    0.92,
                    "Anomali Penurunan Backscatter C-Band (Indikasi Land-Clearing / Tebas Bakar)",
                    g.getConcessionId(),
                    "Kirim patroli darat untuk verifikasi pembukaan lahan fisik sebelum penyalaan api."
            ));
        }

        return alerts;
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius bumi dalam km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
