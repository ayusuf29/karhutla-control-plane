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
        this.channel = builder.build();
        this.blockingStub = FireRiskInferenceServiceGrpc.newBlockingStub(channel);

        log.info("Initialized PythonInferenceClient targeting gRPC endpoint: {}", endpoint);
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
            double peatDepth = f.getPeatDepthMeters();

            // Heuristic scoring:
            // GWL < -40 cm contributes heavily
            double gwlScore = Math.max(0.0, Math.min(1.0, (-gwl - 15.0) / 45.0)); // -15 to -60 cm
            double rainScore = Math.max(0.0, Math.min(1.0, dwr / 20.0));
            double vpdScore = Math.max(0.0, Math.min(1.0, (vpd - 1.0) / 3.0));
            double depthScore = Math.max(0.0, Math.min(1.0, peatDepth / 5.0));

            double combinedScore = (0.45 * gwlScore) + (0.25 * rainScore) + (0.20 * vpdScore) + (0.10 * depthScore);
            combinedScore = Math.round(combinedScore * 1000.0) / 1000.0;

            String category;
            if (combinedScore >= 0.85) {
                category = "EXTREME";
            } else if (combinedScore >= 0.60) {
                category = "HIGH";
            } else if (combinedScore >= 0.30) {
                category = "MEDIUM";
            } else {
                category = "LOW";
            }

            boolean sarAnomaly = category.equals("EXTREME") && combinedScore > 0.90;
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
