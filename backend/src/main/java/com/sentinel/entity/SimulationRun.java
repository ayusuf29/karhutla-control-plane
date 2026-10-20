package com.sentinel.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "simulation_run")
public class SimulationRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "scenario_name", length = 128, nullable = false)
    private String scenarioName;

    @Column(name = "dwr_delta", nullable = false)
    private Integer dwrDelta = 0;

    @Column(name = "gwl_delta", nullable = false)
    private Double gwlDelta = 0.0;

    @Column(name = "vpd_delta", nullable = false)
    private Double vpdDelta = 0.0;

    @Column(name = "sar_boost")
    private Boolean sarBoost = false;

    @Column(name = "total_hexagons")
    private Integer totalHexagons = 0;

    @Column(name = "extreme_count")
    private Integer extremeCount = 0;

    @Column(name = "high_count")
    private Integer highCount = 0;

    @Column(name = "medium_count")
    private Integer mediumCount = 0;

    @Column(name = "low_count")
    private Integer lowCount = 0;

    @Column(name = "avg_gwl_cm")
    private Double avgGwlCm = 0.0;

    @Column(name = "avg_risk_score")
    private Double avgRiskScore = 0.0;

    @Column(name = "sar_alerts")
    private Integer sarAlerts = 0;

    @Column(name = "omc_targets")
    private Integer omcTargets = 0;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs = 0L;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public SimulationRun() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getScenarioName() { return scenarioName; }
    public void setScenarioName(String scenarioName) { this.scenarioName = scenarioName; }

    public Integer getDwrDelta() { return dwrDelta; }
    public void setDwrDelta(Integer dwrDelta) { this.dwrDelta = dwrDelta; }

    public Double getGwlDelta() { return gwlDelta; }
    public void setGwlDelta(Double gwlDelta) { this.gwlDelta = gwlDelta; }

    public Double getVpdDelta() { return vpdDelta; }
    public void setVpdDelta(Double vpdDelta) { this.vpdDelta = vpdDelta; }

    public Boolean getSarBoost() { return sarBoost; }
    public void setSarBoost(Boolean sarBoost) { this.sarBoost = sarBoost; }

    public Integer getTotalHexagons() { return totalHexagons; }
    public void setTotalHexagons(Integer totalHexagons) { this.totalHexagons = totalHexagons; }

    public Integer getExtremeCount() { return extremeCount; }
    public void setExtremeCount(Integer extremeCount) { this.extremeCount = extremeCount; }

    public Integer getHighCount() { return highCount; }
    public void setHighCount(Integer highCount) { this.highCount = highCount; }

    public Integer getMediumCount() { return mediumCount; }
    public void setMediumCount(Integer mediumCount) { this.mediumCount = mediumCount; }

    public Integer getLowCount() { return lowCount; }
    public void setLowCount(Integer lowCount) { this.lowCount = lowCount; }

    public Double getAvgGwlCm() { return avgGwlCm; }
    public void setAvgGwlCm(Double avgGwlCm) { this.avgGwlCm = avgGwlCm; }

    public Double getAvgRiskScore() { return avgRiskScore; }
    public void setAvgRiskScore(Double avgRiskScore) { this.avgRiskScore = avgRiskScore; }

    public Integer getSarAlerts() { return sarAlerts; }
    public void setSarAlerts(Integer sarAlerts) { this.sarAlerts = sarAlerts; }

    public Integer getOmcTargets() { return omcTargets; }
    public void setOmcTargets(Integer omcTargets) { this.omcTargets = omcTargets; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
