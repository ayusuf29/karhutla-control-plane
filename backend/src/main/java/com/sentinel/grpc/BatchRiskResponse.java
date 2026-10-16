package com.sentinel.grpc;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class BatchRiskResponse {

    @JsonProperty("results")
    private List<H3RiskResult> results = new ArrayList<>();

    @JsonProperty("compute_time_ms")
    private long computeTimeMs;

    @JsonProperty("accelerator_hardware")
    private String acceleratorHardware = "CPU_OR_ACCELERATOR";

    public BatchRiskResponse() {}

    public BatchRiskResponse(List<H3RiskResult> results, long computeTimeMs, String acceleratorHardware) {
        this.results = results != null ? results : new ArrayList<>();
        this.computeTimeMs = computeTimeMs;
        this.acceleratorHardware = acceleratorHardware != null ? acceleratorHardware : "CPU_OR_ACCELERATOR";
    }

    public List<H3RiskResult> getResults() { return results; }
    public void setResults(List<H3RiskResult> results) { this.results = results; }

    public long getComputeTimeMs() { return computeTimeMs; }
    public void setComputeTimeMs(long computeTimeMs) { this.computeTimeMs = computeTimeMs; }

    public String getAcceleratorHardware() { return acceleratorHardware; }
    public void setAcceleratorHardware(String acceleratorHardware) { this.acceleratorHardware = acceleratorHardware; }
}
