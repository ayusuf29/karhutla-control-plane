package com.sentinel.grpc;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SarAnomalyResponse {

    @JsonProperty("h3_index")
    private String h3Index;

    @JsonProperty("clearing_detected")
    private boolean clearingDetected;

    @JsonProperty("confidence")
    private double confidence;

    public SarAnomalyResponse() {}

    public SarAnomalyResponse(String h3Index, boolean clearingDetected, double confidence) {
        this.h3Index = h3Index;
        this.clearingDetected = clearingDetected;
        this.confidence = confidence;
    }

    public String getH3Index() { return h3Index; }
    public void setH3Index(String h3Index) { this.h3Index = h3Index; }

    public boolean isClearingDetected() { return clearingDetected; }
    public void setClearingDetected(boolean clearingDetected) { this.clearingDetected = clearingDetected; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
}
