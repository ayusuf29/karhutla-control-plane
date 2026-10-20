package com.sentinel.dto;

import java.time.Instant;
import java.util.List;

public class SimulationDto {

    public record RunRequest(
            String scenarioName,
            Integer dwrDelta,
            Double gwlDelta,
            Double vpdDelta,
            Boolean sarBoost
    ) {}

    public record SimulationStats(
            int totalHexagons,
            int extremeCount,
            int highCount,
            int mediumCount,
            int lowCount,
            double avgGwlCm,
            double avgRiskScore,
            int sarAlerts,
            int omcTargets
    ) {}

    public record SimulationDeltas(
            int extremeDiff,
            int highDiff,
            double avgGwlDiff,
            double avgRiskScoreDiff,
            int sarAlertsDiff,
            int omcTargetsDiff
    ) {}

    public record RunResult(
            Long simulationId,
            String scenarioName,
            long executionTimeMs,
            SimulationStats before,
            SimulationStats after,
            SimulationDeltas deltas,
            boolean isActive
    ) {}

    public record HistoryItem(
            Long id,
            String scenarioName,
            int dwrDelta,
            double gwlDelta,
            double vpdDelta,
            boolean sarBoost,
            int totalHexagons,
            int extremeCount,
            int highCount,
            int mediumCount,
            int lowCount,
            double avgGwlCm,
            double avgRiskScore,
            int sarAlerts,
            int omcTargets,
            long executionTimeMs,
            boolean isActive,
            Instant createdAt
    ) {}
}
