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
        SELECT s.*
        FROM h3_daily_risk_snapshot s
        INNER JOIN peat_h3_grid g ON s.h3_index = g.h3_index
        WHERE s.snapshot_date = (SELECT MAX(snapshot_date) FROM h3_daily_risk_snapshot)
          AND ST_Intersects(g.geom, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))
        ORDER BY s.ignition_risk_score DESC
        """, nativeQuery = true)
    List<H3DailyRiskSnapshot> findLatestWithinBoundingBox(
            @Param("minLon") double minLon,
            @Param("minLat") double minLat,
            @Param("maxLon") double maxLon,
            @Param("maxLat") double maxLat
    );
}
