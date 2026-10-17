package com.sentinel.service;

import com.sentinel.dto.GeoJsonDto;
import com.sentinel.entity.H3DailyRiskSnapshot;
import com.sentinel.entity.PeatH3Grid;
import com.sentinel.repository.H3DailyRiskSnapshotRepository;
import com.sentinel.repository.PeatH3GridRepository;
import com.uber.h3core.H3Core;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Polygon;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class H3SpatialService {

    private static final Logger log = LoggerFactory.getLogger(H3SpatialService.class);

    private final PeatH3GridRepository gridRepository;
    private final H3DailyRiskSnapshotRepository snapshotRepository;
    private final H3Core h3;

    private volatile GeoJsonDto cachedAllGeoJson = null;
    private volatile long cacheTimestamp = 0;
    private static final long CACHE_TTL_MS = 60_000;

    public synchronized void invalidateCache() {
        cachedAllGeoJson = null;
        cacheTimestamp = 0;
        log.info("H3 Spatial GeoJSON cache invalidated.");
    }

    public H3SpatialService(PeatH3GridRepository gridRepository, H3DailyRiskSnapshotRepository snapshotRepository) {
        this.gridRepository = gridRepository;
        this.snapshotRepository = snapshotRepository;
        try {
            this.h3 = H3Core.newInstance();
            log.info("Initialized Uber H3Core Java engine successfully.");
        } catch (IOException e) {
            throw new IllegalStateException("Failed to initialize Uber H3Core: " + e.getMessage(), e);
        }
    }

    public H3Core getH3Core() {
        return h3;
    }

    @Transactional(readOnly = true)
    public GeoJsonDto getH3GridGeoJson(Double minLon, Double minLat, Double maxLon, Double maxLat, String riskCategory) {
        boolean isUnfiltered = (minLon == null && minLat == null && maxLon == null && maxLat == null && (riskCategory == null || riskCategory.isBlank()));
        if (isUnfiltered && cachedAllGeoJson != null && (System.currentTimeMillis() - cacheTimestamp) < CACHE_TTL_MS) {
            return cachedAllGeoJson;
        }

        List<PeatH3Grid> grids;

        if (minLon != null && minLat != null && maxLon != null && maxLat != null) {
            grids = gridRepository.findWithinBoundingBox(minLon, minLat, maxLon, maxLat);
        } else if (riskCategory != null && !riskCategory.isBlank()) {
            grids = gridRepository.findByRiskCategory(riskCategory.toUpperCase());
        } else {
            grids = gridRepository.findAll();
        }

        List<H3DailyRiskSnapshot> latestSnapshots = snapshotRepository.findLatestSnapshotsForAllHexagons();
        Map<String, H3DailyRiskSnapshot> snapshotMap = latestSnapshots.stream()
                .collect(Collectors.toMap(H3DailyRiskSnapshot::getH3Index, s -> s, (s1, s2) -> s1));

        List<GeoJsonDto.Feature> features = new ArrayList<>();

        for (PeatH3Grid grid : grids) {
            H3DailyRiskSnapshot snap = snapshotMap.get(grid.getH3Index());

            if (riskCategory != null && !riskCategory.isBlank()) {
                if (snap == null || !riskCategory.equalsIgnoreCase(snap.getRiskCategory())) {
                    continue;
                }
            }

            GeoJsonDto.Geometry geometry = convertJtsPolygonToGeoJson(grid.getGeom());

            Map<String, Object> props = new LinkedHashMap<>();
            props.put("h3Index", grid.getH3Index());
            props.put("resolution", grid.getResolution());
            props.put("peatDepthMeters", grid.getPeatDepthMeters());
            props.put("distanceToCanalMeters", grid.getDistanceToCanalMeters());
            props.put("distanceToRoadMeters", grid.getDistanceToRoadMeters());
            props.put("concessionId", grid.getConcessionId());
            props.put("province", grid.getProvinceName() != null ? grid.getProvinceName() : "");
            props.put("regency", grid.getRegencyName() != null ? grid.getRegencyName() : "");
            props.put("district", grid.getDistrictName() != null ? grid.getDistrictName() : "");

            if (grid.getCentroid() != null) {
                props.put("centroidLon", grid.getCentroid().getX());
                props.put("centroidLat", grid.getCentroid().getY());
            }

            if (snap != null) {
                props.put("riskCategory", snap.getRiskCategory());
                props.put("riskScore", snap.getIgnitionRiskScore());
                props.put("gwlCm", snap.getGwlCm());
                props.put("daysWithoutRain", snap.getDaysWithoutRain());
                props.put("vpdKpa", snap.getVpdKpa());
                props.put("sarClearingDetected", snap.getSarClearingDetected());
                props.put("recommendedAction", snap.getRecommendedAction());
                props.put("snapshotDate", snap.getSnapshotDate().toString());
            } else {
                props.put("riskCategory", "UNKNOWN");
                props.put("riskScore", 0.0);
            }

            features.add(new GeoJsonDto.Feature(grid.getH3Index(), geometry, props));
        }

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("totalFeatures", features.size());
        metadata.put("h3Resolution", 8);
        GeoJsonDto result = new GeoJsonDto(features, metadata);
        if (isUnfiltered) {
            this.cachedAllGeoJson = result;
            this.cacheTimestamp = System.currentTimeMillis();
            log.info("Cached full H3 Spatial GeoJSON ({} features).", features.size());
        }

        return result;
    }

    private GeoJsonDto.Geometry convertJtsPolygonToGeoJson(Polygon polygon) {
        if (polygon == null) {
            return new GeoJsonDto.Geometry("Polygon", Collections.emptyList());
        }

        Coordinate[] coords = polygon.getExteriorRing().getCoordinates();
        List<List<Double>> ring = new ArrayList<>();
        for (Coordinate c : coords) {
            ring.add(List.of(c.x, c.y));
        }

        List<List<List<Double>>> coordinates = List.of(ring);
        return new GeoJsonDto.Geometry("Polygon", coordinates);
    }
}
