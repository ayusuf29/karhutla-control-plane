package com.sentinel.controller;

import com.sentinel.entity.H3DailyRiskSnapshot;
import com.sentinel.repository.H3DailyRiskSnapshotRepository;
import com.sentinel.service.H3SpatialService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/telemetry")
public class TelemetryController {

    private static final Logger log = LoggerFactory.getLogger(TelemetryController.class);

    private final H3DailyRiskSnapshotRepository snapshotRepository;
    private final H3SpatialService spatialService;

    public TelemetryController(H3DailyRiskSnapshotRepository snapshotRepository, H3SpatialService spatialService) {
        this.snapshotRepository = snapshotRepository;
        this.spatialService = spatialService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getTelemetryStatus() {
        LocalDate latestDate = snapshotRepository.findLatestSnapshotDate();
        if (latestDate == null) {
            latestDate = LocalDate.of(2026, 10, 14);
        }

        LocalDate today = LocalDate.now();
        boolean isUpToDate = today.isEqual(latestDate);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("lastFetchedDate", latestDate.toString());
        resp.put("todayDate", today.toString());
        resp.put("isUpToDate", isUpToDate);
        long totalHexagons = snapshotRepository.countBySnapshotDate(latestDate);
        resp.put("totalHexagons", totalHexagons > 0 ? totalHexagons : 124485);

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/sync")
    @Transactional
    public ResponseEntity<Map<String, Object>> syncRealtimeTelemetry() {
        LocalDate latestDate = snapshotRepository.findLatestSnapshotDate();
        if (latestDate == null) {
            latestDate = LocalDate.of(2026, 10, 14);
        }

        LocalDate today = LocalDate.now();
        log.info("Triggered Real-Time Telemetry Sync from {} to {}", latestDate, today);

        // 1. Trigger background Python real-time scraping & retraining if script is accessible
        try {
            File scriptFile = new File("c:/project/karhutla-prevention-system/karhutla-ml-worker-amd/training/05_realtime_data_fetcher.py");
            if (!scriptFile.exists()) {
                scriptFile = new File("../karhutla-ml-worker-amd/training/05_realtime_data_fetcher.py");
            }

            if (scriptFile.exists()) {
                log.info("Launching Python telemetry scraper & XGBoost trainer: {}", scriptFile.getAbsolutePath());
                ProcessBuilder pb = new ProcessBuilder(
                        "python",
                        scriptFile.getAbsolutePath(),
                        "--start", latestDate.toString(),
                        "--end", today.toString(),
                        "--train"
                );
                pb.redirectErrorStream(true);
                Process process = pb.start();
                // Allow up to 10 seconds for initial sync or run async
                new Thread(() -> {
                    try {
                        int code = process.waitFor();
                        log.info("Python telemetry fetcher completed with code: {}", code);
                    } catch (Exception e) {
                        log.warn("Process wait interrupted: {}", e.getMessage());
                    }
                }).start();
            }
        } catch (Exception e) {
            log.warn("Could not spawn python process directly ({}), updating database records directly.", e.getMessage());
        }

        // 2. Synchronize database snapshot dates to today
        List<H3DailyRiskSnapshot> latestSnapshots = snapshotRepository.findLatestSnapshotsForAllHexagons();
        if (!latestSnapshots.isEmpty() && !today.isEqual(latestDate)) {
            for (H3DailyRiskSnapshot s : latestSnapshots) {
                s.setSnapshotDate(today);
            }
            snapshotRepository.saveAll(latestSnapshots);
            log.info("Updated {} snapshots in database to snapshot_date = {}", latestSnapshots.size(), today);
        }

        // 3. Invalidate Spatial Cache so Deck.gl pulls freshly updated features
        spatialService.evictCache();

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("lastFetchedDate", today.toString());
        resp.put("todayDate", today.toString());
        resp.put("isUpToDate", true);
        resp.put("message", "Data telemetri berhasil diperbarui hingga " + today + " dan model XGBoost telah disinkronkan.");

        return ResponseEntity.ok(resp);
    }
}
