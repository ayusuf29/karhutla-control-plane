package com.sentinel.controller;

import com.sentinel.dto.DispatchDto;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patrol")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class PatrolController {

    private static final Logger log = LoggerFactory.getLogger(PatrolController.class);

    @PostMapping("/dispatch")
    public ResponseEntity<DispatchDto.ApprovalResponse> approveDispatch(
            @Valid @RequestBody DispatchDto.ApprovalRequest request) {

        log.info("Approving patrol dispatch: squadId={}, approvedBy={}, notes={}",
                request.getSquadId(), request.getApprovedBy(), request.getNotes());

        String dispatchId = "DSP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        int waypointsCount = request.getWaypointH3Indices() != null ? request.getWaypointH3Indices().size() : 4;

        DispatchDto.ApprovalResponse response = new DispatchDto.ApprovalResponse(
                dispatchId,
                request.getSquadId(),
                "APPROVED_AND_DISPATCHED",
                waypointsCount,
                request.getApprovedBy(),
                Instant.now(),
                "EN_ROUTE_TO_WAYPOINT_1",
                String.format("Instruksi patroli preskriptif untuk %s berhasil diterbitkan. Regu bergerak menuju titik kritis.", request.getSquadId()),
                request.getWaypointH3Indices()
        );

        return ResponseEntity.ok(response);
    }
}
