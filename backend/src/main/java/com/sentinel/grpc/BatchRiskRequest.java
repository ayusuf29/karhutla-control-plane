package com.sentinel.grpc;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class BatchRiskRequest {

    @JsonProperty("region_id")
    private String regionId;

    @JsonProperty("features")
    private List<H3FeatureVector> features = new ArrayList<>();

    public BatchRiskRequest() {}

    public BatchRiskRequest(String regionId, List<H3FeatureVector> features) {
        this.regionId = regionId;
        this.features = features != null ? features : new ArrayList<>();
    }

    public String getRegionId() { return regionId; }
    public void setRegionId(String regionId) { this.regionId = regionId; }

    public List<H3FeatureVector> getFeatures() { return features; }
    public void setFeatures(List<H3FeatureVector> features) { this.features = features; }
}
