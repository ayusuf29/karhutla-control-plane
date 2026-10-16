package com.sentinel.grpc;

import com.fasterxml.jackson.annotation.JsonProperty;

public class H3RiskResult {

    @JsonProperty("h3_index")
    private String h3Index;

    @JsonProperty("risk_score")
    private double riskScore;

    @JsonProperty("risk_category")
    private String riskCategory;

    @JsonProperty("sar_anomaly_flag")
    private boolean sarAnomalyFlag;

    public H3RiskResult() {}

    public H3RiskResult(String h3Index, double riskScore, String riskCategory, boolean sarAnomalyFlag) {
        this.h3Index = h3Index;
        this.riskScore = riskScore;
        this.riskCategory = riskCategory;
        this.sarAnomalyFlag = sarAnomalyFlag;
    }

    public String getH3Index() { return h3Index; }
    public void setH3Index(String h3Index) { this.h3Index = h3Index; }

    public double getRiskScore() { return riskScore; }
    public void setRiskScore(double riskScore) { this.riskScore = riskScore; }

    public String getRiskCategory() { return riskCategory; }
    public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }

    public boolean isSarAnomalyFlag() { return sarAnomalyFlag; }
    public void setSarAnomalyFlag(boolean sarAnomalyFlag) { this.sarAnomalyFlag = sarAnomalyFlag; }
}
