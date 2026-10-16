package com.sentinel.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;

public class DispatchDto {

    public static class ApprovalRequest {
        @NotBlank(message = "squadId is required")
        private String squadId;

        @NotBlank(message = "approvedBy is required")
        private String approvedBy;

        private String notes;
        private List<String> waypointH3Indices;

        public ApprovalRequest() {}

        public ApprovalRequest(String squadId, String approvedBy, String notes, List<String> waypointH3Indices) {
            this.squadId = squadId;
            this.approvedBy = approvedBy;
            this.notes = notes;
            this.waypointH3Indices = waypointH3Indices;
        }

        public String getSquadId() { return squadId; }
        public void setSquadId(String squadId) { this.squadId = squadId; }

        public String getApprovedBy() { return approvedBy; }
        public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public List<String> getWaypointH3Indices() { return waypointH3Indices; }
        public void setWaypointH3Indices(List<String> waypointH3Indices) { this.waypointH3Indices = waypointH3Indices; }
    }

    public static class ApprovalResponse {
        private String dispatchId;
        private String squadId;
        private String status;
        private int assignedWaypoints;
        private String approvedBy;
        private Instant approvedAt = Instant.now();
        private String operationalStatus;
        private String message;
        private List<String> targetWaypoints;

        public ApprovalResponse() {}

        public ApprovalResponse(String dispatchId, String squadId, String status, int assignedWaypoints, String approvedBy, Instant approvedAt, String operationalStatus, String message, List<String> targetWaypoints) {
            this.dispatchId = dispatchId;
            this.squadId = squadId;
            this.status = status;
            this.assignedWaypoints = assignedWaypoints;
            this.approvedBy = approvedBy;
            this.approvedAt = approvedAt != null ? approvedAt : Instant.now();
            this.operationalStatus = operationalStatus;
            this.message = message;
            this.targetWaypoints = targetWaypoints;
        }

        public String getDispatchId() { return dispatchId; }
        public void setDispatchId(String dispatchId) { this.dispatchId = dispatchId; }

        public String getSquadId() { return squadId; }
        public void setSquadId(String squadId) { this.squadId = squadId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getAssignedWaypoints() { return assignedWaypoints; }
        public void setAssignedWaypoints(int assignedWaypoints) { this.assignedWaypoints = assignedWaypoints; }

        public String getApprovedBy() { return approvedBy; }
        public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

        public Instant getApprovedAt() { return approvedAt; }
        public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }

        public String getOperationalStatus() { return operationalStatus; }
        public void setOperationalStatus(String operationalStatus) { this.operationalStatus = operationalStatus; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public List<String> getTargetWaypoints() { return targetWaypoints; }
        public void setTargetWaypoints(List<String> targetWaypoints) { this.targetWaypoints = targetWaypoints; }
    }
}
