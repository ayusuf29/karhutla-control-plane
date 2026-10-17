package com.sentinel.repository;

import com.sentinel.entity.ManggalaAgniDaops;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ManggalaAgniDaopsRepository extends JpaRepository<ManggalaAgniDaops, String> {

    Optional<ManggalaAgniDaops> findByShortCode(String shortCode);

    List<ManggalaAgniDaops> findByOperationalStatus(String operationalStatus);

    @Query(value = """
        SELECT * FROM manggala_agni_daops d
        WHERE d.operational_status != 'INACTIVE'
        ORDER BY d.geom <-> ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
        LIMIT 1
        """, nativeQuery = true)
    Optional<ManggalaAgniDaops> findNearestDaops(@Param("lon") double lon, @Param("lat") double lat);

    @Query(value = """
        SELECT * FROM manggala_agni_daops d
        WHERE d.operational_status != 'INACTIVE'
        ORDER BY d.geom <-> ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
        LIMIT :limitCount
        """, nativeQuery = true)
    List<ManggalaAgniDaops> findNearestNDaops(@Param("lon") double lon, @Param("lat") double lat, @Param("limitCount") int limitCount);
}
