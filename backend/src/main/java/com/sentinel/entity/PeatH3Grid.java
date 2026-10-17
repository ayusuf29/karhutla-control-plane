package com.sentinel.entity;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;

import java.time.Instant;

@Entity
@Table(name = "peat_h3_grid")
public class PeatH3Grid {

    @Id
    @Column(name = "h3_index", length = 15, nullable = false)
    private String h3Index;

    @Column(name = "resolution", nullable = false)
    private Integer resolution = 8;

    @Column(name = "geom", columnDefinition = "geometry(Polygon,4326)", nullable = false)
    private Polygon geom;

    @Column(name = "centroid", columnDefinition = "geometry(Point,4326)", nullable = false)
    private Point centroid;

    @Column(name = "peat_depth_meters")
    private Double peatDepthMeters;

    @Column(name = "distance_to_canal_meters")
    private Double distanceToCanalMeters;

    @Column(name = "distance_to_road_meters")
    private Double distanceToRoadMeters;

    @Column(name = "concession_id", length = 64)
    private String concessionId;

    @Column(name = "province_name", length = 64)
    private String provinceName;

    @Column(name = "regency_name", length = 64)
    private String regencyName;

    @Column(name = "district_name", length = 64)
    private String districtName;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public PeatH3Grid() {}

    public PeatH3Grid(String h3Index, Integer resolution, Polygon geom, Point centroid, Double peatDepthMeters, Double distanceToCanalMeters, Double distanceToRoadMeters, String concessionId) {
        this.h3Index = h3Index;
        this.resolution = resolution != null ? resolution : 8;
        this.geom = geom;
        this.centroid = centroid;
        this.peatDepthMeters = peatDepthMeters;
        this.distanceToCanalMeters = distanceToCanalMeters;
        this.distanceToRoadMeters = distanceToRoadMeters;
        this.concessionId = concessionId;
        this.createdAt = Instant.now();
    }

    public String getH3Index() { return h3Index; }
    public void setH3Index(String h3Index) { this.h3Index = h3Index; }

    public Integer getResolution() { return resolution; }
    public void setResolution(Integer resolution) { this.resolution = resolution; }

    public Polygon getGeom() { return geom; }
    public void setGeom(Polygon geom) { this.geom = geom; }

    public Point getCentroid() { return centroid; }
    public void setCentroid(Point centroid) { this.centroid = centroid; }

    public Double getPeatDepthMeters() { return peatDepthMeters; }
    public void setPeatDepthMeters(Double peatDepthMeters) { this.peatDepthMeters = peatDepthMeters; }

    public Double getDistanceToCanalMeters() { return distanceToCanalMeters; }
    public void setDistanceToCanalMeters(Double distanceToCanalMeters) { this.distanceToCanalMeters = distanceToCanalMeters; }

    public Double getDistanceToRoadMeters() { return distanceToRoadMeters; }
    public void setDistanceToRoadMeters(Double distanceToRoadMeters) { this.distanceToRoadMeters = distanceToRoadMeters; }

    public String getConcessionId() { return concessionId; }
    public void setConcessionId(String concessionId) { this.concessionId = concessionId; }

    public String getProvinceName() { return provinceName; }
    public void setProvinceName(String provinceName) { this.provinceName = provinceName; }

    public String getRegencyName() { return regencyName; }
    public void setRegencyName(String regencyName) { this.regencyName = regencyName; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
