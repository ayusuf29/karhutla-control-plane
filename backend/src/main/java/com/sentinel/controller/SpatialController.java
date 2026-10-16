package com.sentinel.controller;

import com.sentinel.dto.GeoJsonDto;
import com.sentinel.service.H3SpatialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/spatial")
public class SpatialController {

    private final H3SpatialService spatialService;

    public SpatialController(H3SpatialService spatialService) {
        this.spatialService = spatialService;
    }

    @GetMapping("/h3-grid")
    public ResponseEntity<GeoJsonDto> getH3Grid(
            @RequestParam(value = "minLon", required = false) Double minLon,
            @RequestParam(value = "minLat", required = false) Double minLat,
            @RequestParam(value = "maxLon", required = false) Double maxLon,
            @RequestParam(value = "maxLat", required = false) Double maxLat,
            @RequestParam(value = "riskCategory", required = false) String riskCategory) {

        GeoJsonDto response = spatialService.getH3GridGeoJson(minLon, minLat, maxLon, maxLat, riskCategory);
        return ResponseEntity.ok(response);
    }
}
