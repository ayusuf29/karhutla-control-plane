package com.sentinel.grpc;

import com.fasterxml.jackson.annotation.JsonProperty;

public class H3FeatureVector {

    @JsonProperty("h3_index")
    private String h3Index;

    @JsonProperty("peat_depth_meters")
    private double peatDepthMeters;

    @JsonProperty("ground_water_level_cm")
    private double groundWaterLevelCm;

    @JsonProperty("days_without_rain")
    private int daysWithoutRain;

    @JsonProperty("vapor_pressure_deficit")
    private double vaporPressureDeficit;

    @JsonProperty("distance_to_road_meters")
    private double distanceToRoadMeters;

    @JsonProperty("distance_to_canal_meters")
    private double distanceToCanalMeters;

    public H3FeatureVector() {}

    public H3FeatureVector(String h3Index, double peatDepthMeters, double groundWaterLevelCm, int daysWithoutRain, double vaporPressureDeficit, double distanceToRoadMeters, double distanceToCanalMeters) {
        this.h3Index = h3Index;
        this.peatDepthMeters = peatDepthMeters;
        this.groundWaterLevelCm = groundWaterLevelCm;
        this.daysWithoutRain = daysWithoutRain;
        this.vaporPressureDeficit = vaporPressureDeficit;
        this.distanceToRoadMeters = distanceToRoadMeters;
        this.distanceToCanalMeters = distanceToCanalMeters;
    }

    public String getH3Index() { return h3Index; }
    public void setH3Index(String h3Index) { this.h3Index = h3Index; }

    public double getPeatDepthMeters() { return peatDepthMeters; }
    public void setPeatDepthMeters(double peatDepthMeters) { this.peatDepthMeters = peatDepthMeters; }

    public double getGroundWaterLevelCm() { return groundWaterLevelCm; }
    public void setGroundWaterLevelCm(double groundWaterLevelCm) { this.groundWaterLevelCm = groundWaterLevelCm; }

    public int getDaysWithoutRain() { return daysWithoutRain; }
    public void setDaysWithoutRain(int daysWithoutRain) { this.daysWithoutRain = daysWithoutRain; }

    public double getVaporPressureDeficit() { return vaporPressureDeficit; }
    public void setVaporPressureDeficit(double vaporPressureDeficit) { this.vaporPressureDeficit = vaporPressureDeficit; }

    public double getDistanceToRoadMeters() { return distanceToRoadMeters; }
    public void setDistanceToRoadMeters(double distanceToRoadMeters) { this.distanceToRoadMeters = distanceToRoadMeters; }

    public double getDistanceToCanalMeters() { return distanceToCanalMeters; }
    public void setDistanceToCanalMeters(double distanceToCanalMeters) { this.distanceToCanalMeters = distanceToCanalMeters; }
}
