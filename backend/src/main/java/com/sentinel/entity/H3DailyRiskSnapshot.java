package com.sentinel.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "h3_daily_risk_snapshot", uniqueConstraints = {
        @UniqueConstraint(name = "uq_h3_date", columnNames = {"h3_index", "snapshot_date"})
})
public class H3DailyRiskSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "snapshot_id")
    private Long snapshotId;

    @Column(name = "h3_index", length = 15, nullable = false)
    private String h3Index;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "h3_index", referencedColumnName = "h3_index", insertable = false, updatable = false)
    private PeatH3Grid peatGrid;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "gwl_cm", nullable = false)
    private Double gwlCm;

    @Column(name = "days_without_rain", nullable = false)
    private Integer daysWithoutRain;

    @Column(name = "vpd_kpa", nullable = false)
    private Double vpdKpa;

    @Column(name = "sar_clearing_detected")
    private Boolean sarClearingDetected = false;

    @Column(name = "ignition_risk_score", nullable = false)
    private Double ignitionRiskScore;

    @Column(name = "risk_category", length = 16, nullable = false)
    private String riskCategory;

    @Column(name = "recommended_action", length = 32)
    private String recommendedAction;

    @Column(name = "baseline_gwl_cm")
    private Double baselineGwlCm;

    @Column(name = "baseline_days_without_rain")
    private Integer baselineDaysWithoutRain;

    @Column(name = "baseline_vpd_kpa")
    private Double baselineVpdKpa;

    @Column(name = "baseline_ignition_risk_score")
    private Double baselineIgnitionRiskScore;

    @Column(name = "baseline_risk_category", length = 16)
    private String baselineRiskCategory;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public H3DailyRiskSnapshot() {}

    public Long getSnapshotId() { return snapshotId; }
    public void setSnapshotId(Long snapshotId) { this.snapshotId = snapshotId; }

    public String getH3Index() { return h3Index; }
    public void setH3Index(String h3Index) { this.h3Index = h3Index; }

    public PeatH3Grid getPeatGrid() { return peatGrid; }
    public void setPeatGrid(PeatH3Grid peatGrid) { this.peatGrid = peatGrid; }

    public LocalDate getSnapshotDate() { return snapshotDate; }
    public void setSnapshotDate(LocalDate snapshotDate) { this.snapshotDate = snapshotDate; }

    public Double getGwlCm() { return gwlCm; }
    public void setGwlCm(Double gwlCm) { this.gwlCm = gwlCm; }

    public Integer getDaysWithoutRain() { return daysWithoutRain; }
    public void setDaysWithoutRain(Integer daysWithoutRain) { this.daysWithoutRain = daysWithoutRain; }

    public Double getVpdKpa() { return vpdKpa; }
    public void setVpdKpa(Double vpdKpa) { this.vpdKpa = vpdKpa; }

    public Boolean getSarClearingDetected() { return sarClearingDetected; }
    public void setSarClearingDetected(Boolean sarClearingDetected) { this.sarClearingDetected = sarClearingDetected; }

    public Double getIgnitionRiskScore() { return ignitionRiskScore; }
    public void setIgnitionRiskScore(Double ignitionRiskScore) { this.ignitionRiskScore = ignitionRiskScore; }

    public String getRiskCategory() { return riskCategory; }
    public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Double getBaselineGwlCm() { return baselineGwlCm; }
    public void setBaselineGwlCm(Double baselineGwlCm) { this.baselineGwlCm = baselineGwlCm; }

    public Integer getBaselineDaysWithoutRain() { return baselineDaysWithoutRain; }
    public void setBaselineDaysWithoutRain(Integer baselineDaysWithoutRain) { this.baselineDaysWithoutRain = baselineDaysWithoutRain; }

    public Double getBaselineVpdKpa() { return baselineVpdKpa; }
    public void setBaselineVpdKpa(Double baselineVpdKpa) { this.baselineVpdKpa = baselineVpdKpa; }

    public Double getBaselineIgnitionRiskScore() { return baselineIgnitionRiskScore; }
    public void setBaselineIgnitionRiskScore(Double baselineIgnitionRiskScore) { this.baselineIgnitionRiskScore = baselineIgnitionRiskScore; }

    public String getBaselineRiskCategory() { return baselineRiskCategory; }
    public void setBaselineRiskCategory(String baselineRiskCategory) { this.baselineRiskCategory = baselineRiskCategory; }
}
