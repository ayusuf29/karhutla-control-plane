package com.sentinel.repository;

import com.sentinel.entity.PeatH3Grid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PeatH3GridRepository extends JpaRepository<PeatH3Grid, String> {

    @Query(value = """
        SELECT * FROM peat_h3_grid g
        WHERE ST_Intersects(g.geom, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))
        """, nativeQuery = true)
    List<PeatH3Grid> findWithinBoundingBox(
            @Param("minLon") double minLon,
            @Param("minLat") double minLat,
            @Param("maxLon") double maxLon,
            @Param("maxLat") double maxLat
    );

    @Query(value = """
        SELECT g.* FROM peat_h3_grid g
        INNER JOIN h3_daily_risk_snapshot s ON g.h3_index = s.h3_index
        WHERE s.risk_category = :riskCategory
        ORDER BY s.ignition_risk_score DESC
        """, nativeQuery = true)
    List<PeatH3Grid> findByRiskCategory(@Param("riskCategory") String riskCategory);
}
