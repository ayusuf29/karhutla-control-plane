package com.sentinel.controller;

import com.sentinel.dto.AgentDto;
import com.sentinel.dto.GeoJsonDto;
import com.sentinel.entity.ManggalaAgniDaops;
import com.sentinel.repository.ManggalaAgniDaopsRepository;
import com.sentinel.service.H3SpatialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/spatial")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class SpatialController {

    private final H3SpatialService spatialService;
    private final ManggalaAgniDaopsRepository daopsRepository;

    public SpatialController(H3SpatialService spatialService, ManggalaAgniDaopsRepository daopsRepository) {
        this.spatialService = spatialService;
        this.daopsRepository = daopsRepository;
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

    @GetMapping("/daops")
    public ResponseEntity<List<AgentDto.DaopsStationDto>> getAllDaops() {
        List<ManggalaAgniDaops> stations = daopsRepository.findAll();
        List<AgentDto.DaopsStationDto> dtos = stations.stream().map(d -> new AgentDto.DaopsStationDto(
                d.getDaopsId(),
                d.getName(),
                d.getShortCode(),
                d.getProvinceName(),
                d.getRegencyName(),
                d.getDistrictName(),
                d.getLatitude(),
                d.getLongitude(),
                d.getCommanderName(),
                d.getRadioFrequency(),
                d.getPersonnelCount(),
                d.getOperationalStatus(),
                0.0
        )).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/daops/nearest")
    public ResponseEntity<AgentDto.DaopsStationDto> getNearestDaops(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon) {

        return daopsRepository.findNearestDaops(lon, lat)
                .map(d -> {
                    double distKm = haversineKm(lat, lon, d.getLatitude(), d.getLongitude());
                    AgentDto.DaopsStationDto dto = new AgentDto.DaopsStationDto(
                            d.getDaopsId(),
                            d.getName(),
                            d.getShortCode(),
                            d.getProvinceName(),
                            d.getRegencyName(),
                            d.getDistrictName(),
                            d.getLatitude(),
                            d.getLongitude(),
                            d.getCommanderName(),
                            d.getRadioFrequency(),
                            d.getPersonnelCount(),
                            d.getOperationalStatus(),
                            Math.round(distKm * 10.0) / 10.0
                    );
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371.0 * c;
    }
}
