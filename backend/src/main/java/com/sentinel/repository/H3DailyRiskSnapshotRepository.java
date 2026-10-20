package com.sentinel.repository;

import com.sentinel.entity.H3DailyRiskSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface H3DailyRiskSnapshotRepository extends JpaRepository<H3DailyRiskSnapshot, Long> {

    Optional<H3DailyRiskSnapshot> findTopByH3IndexOrderBySnapshotDateDesc(String h3Index);

    List<H3DailyRiskSnapshot> findBySnapshotDate(LocalDate snapshotDate);

    @Query(value = """
        SELECT *
        FROM h3_daily_risk_snapshot
        WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM h3_daily_risk_snapshot)
        """, nativeQuery = true)
    List<H3DailyRiskSnapshot> findLatestSnapshotsForAllHexagons();

    @Query(value = """
        SELECT *
        FROM h3_daily_risk_snapshot
        WHERE risk_category = 'EXTREME'
          AND snapshot_date = (SELECT MAX(snapshot_date) FROM h3_daily_risk_snapshot)
        ORDER BY ignition_risk_score DESC
        """, nativeQuery = true)
    List<H3DailyRiskSnapshot> findExtremeRiskSnapshots();

    @Query(value = """
        SELECT *
        FROM h3_daily_risk_snapshot
        WHERE (risk_category = 'EXTREME' OR risk_category = 'HIGH')
          AND snapshot_date = (SELECT MAX(snapshot_date) FROM h3_daily_risk_snapshot)
        ORDER BY ignition_risk_score DESC
        LIMIT 300
        """, nativeQuery = true)
    List<H3DailyRiskSnapshot> findTopCriticalSnapshots();

    @Query(value = """
        SELECT *
        FROM h3_daily_risk_snapshot
        WHERE gwl_cm < -45.0
          AND snapshot_date = (SELECT MAX(snapshot_date) FROM h3_daily_risk_snapshot)
        ORDER BY gwl_cm ASC
        LIMIT 50
        """, nativeQuery = true)
    List<H3DailyRiskSnapshot> findTopDryingSnapshots();

    @Query(value = """
        SELECT *
        FROM h3_daily_risk_snapshot
        WHERE sar_clearing_detected = true
          AND snapshot_date = (SELECT MAX(snapshot_date) FROM h3_daily_risk_snapshot)
        ORDER BY ignition_risk_score DESC
        LIMIT 100
        """, nativeQuery = true)
    List<H3DailyRiskSnapshot> findTopSarAlerts();

    @Query(value = """
        SELECT 
            COUNT(*) as totalHexagons,
            COUNT(CASE WHEN risk_category = 'EXTREME' THEN 1 END) as extremeRiskCount,
            COUNT(CASE WHEN risk_category = 'HIGH' THEN 1 END) as highRiskCount,
            COUNT(CASE WHEN risk_category = 'MEDIUM' THEN 1 END) as mediumRiskCount,
            COUNT(CASE WHEN risk_category = 'LOW' THEN 1 END) as lowRiskCount,
            COALESCE(AVG(gwl_cm), 0.0) as averageGwlCm,
            COALESCE(AVG(ignition_risk_score), 0.0) as averageRiskScore,
            COUNT(CASE WHEN sar_clearing_detected = true THEN 1 END) as sarClearingAlertCount
        FROM h3_daily_risk_snapshot
        WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM h3_daily_risk_snapshot)
        """, nativeQuery = true)
    RiskSummaryProjection findLatestRiskSummaryAggregates();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = """
        UPDATE h3_daily_risk_snapshot
        SET 
            baseline_gwl_cm = COALESCE(baseline_gwl_cm, gwl_cm),
            baseline_days_without_rain = COALESCE(baseline_days_without_rain, days_without_rain),
            baseline_vpd_kpa = COALESCE(baseline_vpd_kpa, vpd_kpa),
            baseline_ignition_risk_score = COALESCE(baseline_ignition_risk_score, ignition_risk_score),
            baseline_risk_category = COALESCE(baseline_risk_category, risk_category)
        WHERE baseline_gwl_cm IS NULL
        """, nativeQuery = true)
    void initializeBaselinesIfEmpty();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = """
        UPDATE h3_daily_risk_snapshot
        SET 
            gwl_cm = COALESCE(baseline_gwl_cm, gwl_cm),
            days_without_rain = COALESCE(baseline_days_without_rain, days_without_rain),
            vpd_kpa = COALESCE(baseline_vpd_kpa, vpd_kpa),
            ignition_risk_score = COALESCE(baseline_ignition_risk_score, ignition_risk_score),
            risk_category = COALESCE(baseline_risk_category, risk_category),
            sar_clearing_detected = false
        """, nativeQuery = true)
    void restoreBaseline();

    interface RiskSummaryProjection {
        long getTotalHexagons();
        long getExtremeRiskCount();
        long getHighRiskCount();
        long getMediumRiskCount();
        long getLowRiskCount();
        double getAverageGwlCm();
        double getAverageRiskScore();
        long getSarClearingAlertCount();
    }
}
