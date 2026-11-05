package com.sentinel.service;

import com.sentinel.grpc.*;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class PythonInferenceClient {

    private static final Logger log = LoggerFactory.getLogger(PythonInferenceClient.class);

    private final ManagedChannel channel;
    private final FireRiskInferenceServiceGrpc.FireRiskInferenceServiceBlockingStub blockingStub;
    private final boolean mockFallbackEnabled;
    private final long timeoutMs;

    public PythonInferenceClient(
            @Value("${sentinel.ml-service.target-endpoint:localhost:50051}") String endpoint,
            @Value("${sentinel.ml-service.use-tls:false}") boolean useTls,
            @Value("${sentinel.ml-service.timeout-ms:30000}") long timeoutMs,
            @Value("${sentinel.ml-service.mock-fallback-enabled:true}") boolean mockFallbackEnabled) {

        this.timeoutMs = timeoutMs;
        this.mockFallbackEnabled = mockFallbackEnabled;

        ManagedChannelBuilder<?> builder = ManagedChannelBuilder.forTarget(endpoint);
        if (!useTls) {
            builder.usePlaintext();
        }
        builder.maxInboundMessageSize(100 * 1024 * 1024); // 100 MB buffer for 124k H3 nationwide vectors
        this.channel = builder.build();
        this.blockingStub = FireRiskInferenceServiceGrpc.newBlockingStub(channel);

        log.info("Initialized PythonInferenceClient targeting gRPC endpoint: {} with 100MB inbound message size", endpoint);
    }

    public BatchRiskResponse evaluateBatch(BatchRiskRequest request) {
        try {
            return blockingStub
                    .withDeadlineAfter(timeoutMs, TimeUnit.MILLISECONDS)
                    .batchPredictIgnitionRisk(request);
        } catch (Exception e) {
            log.warn("gRPC call to Python ML Service failed ({}). Fallback active: {}", e.getMessage(), mockFallbackEnabled);
            if (mockFallbackEnabled) {
                return executeLocalHeuristicFallback(request);
            }
            throw new RuntimeException("Python ML Service unavailable: " + e.getMessage(), e);
        }
    }

    public SarAnomalyResponse analyzeSarClearing(SarAnomalyRequest request) {
        try {
            return blockingStub
                    .withDeadlineAfter(timeoutMs, TimeUnit.MILLISECONDS)
                    .analyzeSarClearingAnomaly(request);
        } catch (Exception e) {
            log.warn("gRPC call to Python SAR analysis failed ({}). Using simulated fallback.", e.getMessage());
            return new SarAnomalyResponse(request.getH3Index(), false, 0.25);
        }
    }

    private BatchRiskResponse executeLocalHeuristicFallback(BatchRiskRequest request) {
        long start = System.currentTimeMillis();
        List<H3RiskResult> results = new ArrayList<>();

        for (H3FeatureVector f : request.getFeatures()) {
            double gwl = f.getGroundWaterLevelCm();
            int dwr = f.getDaysWithoutRain();
            double vpd = f.getVaporPressureDeficit();
            double depth = f.getPeatDepthMeters();
            double distRoad = f.getDistanceToRoadMeters();
            double distCanal = f.getDistanceToCanalMeters();

            // Deterministic empirical model aligned with PP 57/2016 and Python PeatFireRiskModel
            // 1. GWL factor (negative cm: -18cm is wet, -40cm is threshold, -65cm is severely dried)
            double fGwl = Math.max(0.0, Math.min(1.0, (-gwl - 18.0) / 42.0));

            // 2. Drought factor: Days without rain (0 to 20 days)
            double fRain = Math.max(0.0, Math.min(1.0, dwr / 20.0));

            // 3. Atmospheric drying: VPD (1.2 to 4.0 kPa)
            double fVpd = Math.max(0.0, Math.min(1.0, (vpd - 1.2) / 2.8));

            // 4. Drainage canal proximity (closer canal = increased drained dome subsidence)
            double fCanal = Math.max(0.0, Math.min(1.0, (1800.0 - distCanal) / 1800.0));

            // 5. Road proximity (anthropogenic human access / slash-and-burn)
            double fRoad = Math.max(0.0, Math.min(1.0, (3000.0 - distRoad) / 3000.0));

            // 6. Peat depth (deep peat domes store higher combustible fuel load)
            double fDepth = Math.max(0.0, Math.min(1.0, depth / 4.5));

            // Core weighted combination
            double combinedScore = (0.42 * fGwl) + (0.22 * fRain) + (0.18 * fVpd) +
                                   (0.08 * fCanal) + (0.06 * fRoad) + (0.04 * fDepth);

            // Non-linear synergy: when GWL drops beyond critical PP 57/2016 threshold (< -40cm) AND dwr >= 12 days
            if (gwl < -40.0 && dwr >= 12) {
                combinedScore = Math.min(1.0, combinedScore * 1.15);
            }

            combinedScore = Math.max(0.010, Math.min(0.995, Math.round(combinedScore * 1000.0) / 1000.0));

            String category;
            if (combinedScore >= 0.750) {
                category = "EXTREME";
            } else if (combinedScore >= 0.550) {
                category = "HIGH";
            } else if (combinedScore >= 0.300) {
                category = "MEDIUM";
            } else {
                category = "LOW";
            }

            boolean sarAnomaly = (category.equals("EXTREME") || category.equals("HIGH")) && (combinedScore >= 0.70 || gwl < -45.0);
            results.add(new H3RiskResult(f.getH3Index(), combinedScore, category, sarAnomaly));
        }

        long elapsed = System.currentTimeMillis() - start;
        return new BatchRiskResponse(results, elapsed, "JAVA_LOCAL_HEURISTIC_FALLBACK");
    }

    @PreDestroy
    public void shutdown() {
        try {
            channel.shutdown().awaitTermination(3, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
