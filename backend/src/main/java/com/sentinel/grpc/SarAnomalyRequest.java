package com.sentinel.grpc;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SarAnomalyRequest {

    @JsonProperty("h3_index")
    private String h3Index;

    @JsonProperty("pre_event_sar_tile")
    private byte[] preEventSarTile;

    @JsonProperty("post_event_sar_tile")
    private byte[] postEventSarTile;

    public SarAnomalyRequest() {}

    public SarAnomalyRequest(String h3Index, byte[] preEventSarTile, byte[] postEventSarTile) {
        this.h3Index = h3Index;
        this.preEventSarTile = preEventSarTile;
        this.postEventSarTile = postEventSarTile;
    }

    public String getH3Index() { return h3Index; }
    public void setH3Index(String h3Index) { this.h3Index = h3Index; }

    public byte[] getPreEventSarTile() { return preEventSarTile; }
    public void setPreEventSarTile(byte[] preEventSarTile) { this.preEventSarTile = preEventSarTile; }

    public byte[] getPostEventSarTile() { return postEventSarTile; }
    public void setPostEventSarTile(byte[] postEventSarTile) { this.postEventSarTile = postEventSarTile; }
}
