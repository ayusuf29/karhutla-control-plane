package com.sentinel.entity;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;

import java.time.Instant;

@Entity
@Table(name = "manggala_agni_daops")
public class ManggalaAgniDaops {

    @Id
    @Column(name = "daops_id", length = 32, nullable = false)
    private String daopsId;

    @Column(name = "name", length = 128, nullable = false)
    private String name;

    @Column(name = "short_code", length = 32, nullable = false)
    private String shortCode;

    @Column(name = "province_name", length = 64, nullable = false)
    private String provinceName;

    @Column(name = "regency_name", length = 64, nullable = false)
    private String regencyName;

    @Column(name = "district_name", length = 64)
    private String districtName;

    @Column(name = "geom", columnDefinition = "geometry(Point,4326)", nullable = false)
    private Point geom;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "commander_name", length = 128)
    private String commanderName;

    @Column(name = "radio_frequency", length = 32)
    private String radioFrequency;

    @Column(name = "personnel_count")
    private Integer personnelCount = 30;

    @Column(name = "operational_status", length = 32)
    private String operationalStatus = "ACTIVE";

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public ManggalaAgniDaops() {}

    public ManggalaAgniDaops(String daopsId, String name, String shortCode, String provinceName,
                             String regencyName, String districtName, Point geom, Double latitude,
                             Double longitude, String commanderName, String radioFrequency,
                             Integer personnelCount, String operationalStatus) {
        this.daopsId = daopsId;
        this.name = name;
        this.shortCode = shortCode;
        this.provinceName = provinceName;
        this.regencyName = regencyName;
        this.districtName = districtName;
        this.geom = geom;
        this.latitude = latitude;
        this.longitude = longitude;
        this.commanderName = commanderName;
        this.radioFrequency = radioFrequency;
        this.personnelCount = personnelCount != null ? personnelCount : 30;
        this.operationalStatus = operationalStatus != null ? operationalStatus : "ACTIVE";
        this.createdAt = Instant.now();
    }

    public String getDaopsId() { return daopsId; }
    public void setDaopsId(String daopsId) { this.daopsId = daopsId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getShortCode() { return shortCode; }
    public void setShortCode(String shortCode) { this.shortCode = shortCode; }

    public String getProvinceName() { return provinceName; }
    public void setProvinceName(String provinceName) { this.provinceName = provinceName; }

    public String getRegencyName() { return regencyName; }
    public void setRegencyName(String regencyName) { this.regencyName = regencyName; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public Point getGeom() { return geom; }
    public void setGeom(Point geom) { this.geom = geom; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getCommanderName() { return commanderName; }
    public void setCommanderName(String commanderName) { this.commanderName = commanderName; }

    public String getRadioFrequency() { return radioFrequency; }
    public void setRadioFrequency(String radioFrequency) { this.radioFrequency = radioFrequency; }

    public Integer getPersonnelCount() { return personnelCount; }
    public void setPersonnelCount(Integer personnelCount) { this.personnelCount = personnelCount; }

    public String getOperationalStatus() { return operationalStatus; }
    public void setOperationalStatus(String operationalStatus) { this.operationalStatus = operationalStatus; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
