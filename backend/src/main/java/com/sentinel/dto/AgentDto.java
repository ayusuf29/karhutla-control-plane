package com.sentinel.dto;

import java.time.Instant;
import java.util.List;

public class AgentDto {

    public static class RecommendationOverview {
        private Instant timestamp = Instant.now();
        private String systemStatus = "ACTIVE_MONITORING";
        private AssessorSummary assessorSummary;
        private List<PatrolCard> patrolCards;
        private List<OmcTarget> omcTargets;
        private List<SarAlert> sarAlerts;
        private TacticalActionPlan tacticalActionPlan;

        public RecommendationOverview() {}

        public RecommendationOverview(Instant timestamp, String systemStatus, AssessorSummary assessorSummary, List<PatrolCard> patrolCards, List<OmcTarget> omcTargets, List<SarAlert> sarAlerts) {
            this.timestamp = timestamp;
            this.systemStatus = systemStatus;
            this.assessorSummary = assessorSummary;
            this.patrolCards = patrolCards;
            this.omcTargets = omcTargets;
            this.sarAlerts = sarAlerts;
        }

        public RecommendationOverview(Instant timestamp, String systemStatus, AssessorSummary assessorSummary, List<PatrolCard> patrolCards, List<OmcTarget> omcTargets, List<SarAlert> sarAlerts, TacticalActionPlan tacticalActionPlan) {
            this.timestamp = timestamp;
            this.systemStatus = systemStatus;
            this.assessorSummary = assessorSummary;
            this.patrolCards = patrolCards;
            this.omcTargets = omcTargets;
            this.sarAlerts = sarAlerts;
            this.tacticalActionPlan = tacticalActionPlan;
        }

        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

        public String getSystemStatus() { return systemStatus; }
        public void setSystemStatus(String systemStatus) { this.systemStatus = systemStatus; }

        public AssessorSummary getAssessorSummary() { return assessorSummary; }
        public void setAssessorSummary(AssessorSummary assessorSummary) { this.assessorSummary = assessorSummary; }

        public List<PatrolCard> getPatrolCards() { return patrolCards; }
        public void setPatrolCards(List<PatrolCard> patrolCards) { this.patrolCards = patrolCards; }

        public List<OmcTarget> getOmcTargets() { return omcTargets; }
        public void setOmcTargets(List<OmcTarget> omcTargets) { this.omcTargets = omcTargets; }

        public List<SarAlert> getSarAlerts() { return sarAlerts; }
        public void setSarAlerts(List<SarAlert> sarAlerts) { this.sarAlerts = sarAlerts; }

        public TacticalActionPlan getTacticalActionPlan() { return tacticalActionPlan; }
        public void setTacticalActionPlan(TacticalActionPlan tacticalActionPlan) { this.tacticalActionPlan = tacticalActionPlan; }
    }

    public static class AssessorSummary {
        private int totalMonitoredHexagons;
        private int extremeRiskCount;
        private int highRiskCount;
        private int mediumRiskCount;
        private int lowRiskCount;
        private double averageGwlCm;
        private double averageRiskScore;
        private int sarClearingAlerts;
        private int omcTargetCount;
        private String hazardDiagnosis;
        private String suggestedOverallStrategy;

        public AssessorSummary() {}

        public AssessorSummary(int totalMonitoredHexagons, int extremeRiskCount, int highRiskCount, int mediumRiskCount, int lowRiskCount, double averageGwlCm, double averageRiskScore, int sarClearingAlerts, String hazardDiagnosis, String suggestedOverallStrategy) {
            this(totalMonitoredHexagons, extremeRiskCount, highRiskCount, mediumRiskCount, lowRiskCount, averageGwlCm, averageRiskScore, sarClearingAlerts, Math.min(25, extremeRiskCount / 4 + (extremeRiskCount > 0 ? 2 : 0)), hazardDiagnosis, suggestedOverallStrategy);
        }

        public AssessorSummary(int totalMonitoredHexagons, int extremeRiskCount, int highRiskCount, int mediumRiskCount, int lowRiskCount, double averageGwlCm, double averageRiskScore, int sarClearingAlerts, int omcTargetCount, String hazardDiagnosis, String suggestedOverallStrategy) {
            this.totalMonitoredHexagons = totalMonitoredHexagons;
            this.extremeRiskCount = extremeRiskCount;
            this.highRiskCount = highRiskCount;
            this.mediumRiskCount = mediumRiskCount;
            this.lowRiskCount = lowRiskCount;
            this.averageGwlCm = averageGwlCm;
            this.averageRiskScore = averageRiskScore;
            this.sarClearingAlerts = sarClearingAlerts;
            this.omcTargetCount = omcTargetCount;
            this.hazardDiagnosis = hazardDiagnosis;
            this.suggestedOverallStrategy = suggestedOverallStrategy;
        }

        public int getTotalMonitoredHexagons() { return totalMonitoredHexagons; }
        public void setTotalMonitoredHexagons(int totalMonitoredHexagons) { this.totalMonitoredHexagons = totalMonitoredHexagons; }

        public int getExtremeRiskCount() { return extremeRiskCount; }
        public void setExtremeRiskCount(int extremeRiskCount) { this.extremeRiskCount = extremeRiskCount; }

        public int getHighRiskCount() { return highRiskCount; }
        public void setHighRiskCount(int highRiskCount) { this.highRiskCount = highRiskCount; }

        public int getMediumRiskCount() { return mediumRiskCount; }
        public void setMediumRiskCount(int mediumRiskCount) { this.mediumRiskCount = mediumRiskCount; }

        public int getLowRiskCount() { return lowRiskCount; }
        public void setLowRiskCount(int lowRiskCount) { this.lowRiskCount = lowRiskCount; }

        public double getAverageGwlCm() { return averageGwlCm; }
        public void setAverageGwlCm(double averageGwlCm) { this.averageGwlCm = averageGwlCm; }

        public double getAverageRiskScore() { return averageRiskScore; }
        public void setAverageRiskScore(double averageRiskScore) { this.averageRiskScore = averageRiskScore; }

        public int getSarClearingAlerts() { return sarClearingAlerts; }
        public void setSarClearingAlerts(int sarClearingAlerts) { this.sarClearingAlerts = sarClearingAlerts; }

        public int getOmcTargetCount() { return omcTargetCount; }
        public void setOmcTargetCount(int omcTargetCount) { this.omcTargetCount = omcTargetCount; }

        public String getHazardDiagnosis() { return hazardDiagnosis; }
        public void setHazardDiagnosis(String hazardDiagnosis) { this.hazardDiagnosis = hazardDiagnosis; }

        public String getSuggestedOverallStrategy() { return suggestedOverallStrategy; }
        public void setSuggestedOverallStrategy(String suggestedOverallStrategy) { this.suggestedOverallStrategy = suggestedOverallStrategy; }
    }

    public static class PatrolCard {
        private String squadId;
        private String squadName;
        private String regionName;
        private String status;
        private int totalWaypoints;
        private double estimatedTotalDistanceKm;
        private double estimatedDurationHours;
        private String primaryObjective;
        private List<String> recommendedEquipment;
        private List<Waypoint> waypoints;
        private TacticalActionPlan tacticalActionPlan;

        // Base Daops Station Metadata
        private String daopsId;
        private String daopsName;
        private String commanderName;
        private String radioFrequency;
        private int personnelCount = 30;
        private double depotLatitude;
        private double depotLongitude;

        public PatrolCard() {}

        public PatrolCard(String squadId, String squadName, String regionName, String status, int totalWaypoints, double estimatedTotalDistanceKm, double estimatedDurationHours, String primaryObjective, List<String> recommendedEquipment, List<Waypoint> waypoints) {
            this.squadId = squadId;
            this.squadName = squadName;
            this.regionName = regionName;
            this.status = status;
            this.totalWaypoints = totalWaypoints;
            this.estimatedTotalDistanceKm = estimatedTotalDistanceKm;
            this.estimatedDurationHours = estimatedDurationHours;
            this.primaryObjective = primaryObjective;
            this.recommendedEquipment = recommendedEquipment;
            this.waypoints = waypoints;
        }

        public String getSquadId() { return squadId; }
        public void setSquadId(String squadId) { this.squadId = squadId; }

        public String getSquadName() { return squadName; }
        public void setSquadName(String squadName) { this.squadName = squadName; }

        public String getRegionName() { return regionName; }
        public void setRegionName(String regionName) { this.regionName = regionName; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getTotalWaypoints() { return totalWaypoints; }
        public void setTotalWaypoints(int totalWaypoints) { this.totalWaypoints = totalWaypoints; }

        public double getEstimatedTotalDistanceKm() { return estimatedTotalDistanceKm; }
        public void setEstimatedTotalDistanceKm(double estimatedTotalDistanceKm) { this.estimatedTotalDistanceKm = estimatedTotalDistanceKm; }

        public double getEstimatedDurationHours() { return estimatedDurationHours; }
        public void setEstimatedDurationHours(double estimatedDurationHours) { this.estimatedDurationHours = estimatedDurationHours; }

        public String getPrimaryObjective() { return primaryObjective; }
        public void setPrimaryObjective(String primaryObjective) { this.primaryObjective = primaryObjective; }

        public List<String> getRecommendedEquipment() { return recommendedEquipment; }
        public void setRecommendedEquipment(List<String> recommendedEquipment) { this.recommendedEquipment = recommendedEquipment; }

        public List<Waypoint> getWaypoints() { return waypoints; }
        public void setWaypoints(List<Waypoint> waypoints) { this.waypoints = waypoints; }

        public TacticalActionPlan getTacticalActionPlan() { return tacticalActionPlan; }
        public void setTacticalActionPlan(TacticalActionPlan tacticalActionPlan) { this.tacticalActionPlan = tacticalActionPlan; }

        public String getDaopsId() { return daopsId; }
        public void setDaopsId(String daopsId) { this.daopsId = daopsId; }

        public String getDaopsName() { return daopsName; }
        public void setDaopsName(String daopsName) { this.daopsName = daopsName; }

        public String getCommanderName() { return commanderName; }
        public void setCommanderName(String commanderName) { this.commanderName = commanderName; }

        public String getRadioFrequency() { return radioFrequency; }
        public void setRadioFrequency(String radioFrequency) { this.radioFrequency = radioFrequency; }

        public int getPersonnelCount() { return personnelCount; }
        public void setPersonnelCount(int personnelCount) { this.personnelCount = personnelCount; }

        public double getDepotLatitude() { return depotLatitude; }
        public void setDepotLatitude(double depotLatitude) { this.depotLatitude = depotLatitude; }

        public double getDepotLongitude() { return depotLongitude; }
        public void setDepotLongitude(double depotLongitude) { this.depotLongitude = depotLongitude; }
    }

    public static class DaopsStationDto {
        private String daopsId;
        private String name;
        private String shortCode;
        private String provinceName;
        private String regencyName;
        private String districtName;
        private double latitude;
        private double longitude;
        private String commanderName;
        private String radioFrequency;
        private int personnelCount;
        private String operationalStatus;
        private double distanceKm;

        public DaopsStationDto() {}

        public DaopsStationDto(String daopsId, String name, String shortCode, String provinceName, String regencyName, String districtName, double latitude, double longitude, String commanderName, String radioFrequency, int personnelCount, String operationalStatus, double distanceKm) {
            this.daopsId = daopsId;
            this.name = name;
            this.shortCode = shortCode;
            this.provinceName = provinceName;
            this.regencyName = regencyName;
            this.districtName = districtName;
            this.latitude = latitude;
            this.longitude = longitude;
            this.commanderName = commanderName;
            this.radioFrequency = radioFrequency;
            this.personnelCount = personnelCount;
            this.operationalStatus = operationalStatus;
            this.distanceKm = distanceKm;
        }

        public String getDaopsId() { return daopsId; }
        public void setDaopsId(String daopsId) { this.daopsId = daopsId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getShortCode() { return shortCode; }
        public void setShortCode(String shortCode) { this.shortCode = shortCode; }

        public String getProvinceName() { return provinceName; }
        public void setProvinceName(String provinceName) { this.provinceName = provinceName; }

        public String getRegencyName() { return regencyName; }
        public void setRegencyName(String regencyName) { this.regencyName = regencyName; }

        public String getDistrictName() { return districtName; }
        public void setDistrictName(String districtName) { this.districtName = districtName; }

        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }

        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }

        public String getCommanderName() { return commanderName; }
        public void setCommanderName(String commanderName) { this.commanderName = commanderName; }

        public String getRadioFrequency() { return radioFrequency; }
        public void setRadioFrequency(String radioFrequency) { this.radioFrequency = radioFrequency; }

        public int getPersonnelCount() { return personnelCount; }
        public void setPersonnelCount(int personnelCount) { this.personnelCount = personnelCount; }

        public String getOperationalStatus() { return operationalStatus; }
        public void setOperationalStatus(String operationalStatus) { this.operationalStatus = operationalStatus; }

        public double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
    }

    public static class Waypoint {
        private int sequence;
        private String h3Index;
        private double latitude;
        private double longitude;
        private double riskScore;
        private String riskCategory;
        private double gwlCm;
        private double peatDepthMeters;
        private double distanceToRoadMeters;
        private double distanceToCanalMeters;
        private String concessionId;
        private String estimatedArrival;
        private String prescribedAction;
        private String accessNote;

        public Waypoint() {}

        public Waypoint(int sequence, String h3Index, double latitude, double longitude, double riskScore, String riskCategory, double gwlCm, double peatDepthMeters, double distanceToRoadMeters, double distanceToCanalMeters, String concessionId, String estimatedArrival, String prescribedAction, String accessNote) {
            this.sequence = sequence;
            this.h3Index = h3Index;
            this.latitude = latitude;
            this.longitude = longitude;
            this.riskScore = riskScore;
            this.riskCategory = riskCategory;
            this.gwlCm = gwlCm;
            this.peatDepthMeters = peatDepthMeters;
            this.distanceToRoadMeters = distanceToRoadMeters;
            this.distanceToCanalMeters = distanceToCanalMeters;
            this.concessionId = concessionId;
            this.estimatedArrival = estimatedArrival;
            this.prescribedAction = prescribedAction;
            this.accessNote = accessNote;
        }

        public int getSequence() { return sequence; }
        public void setSequence(int sequence) { this.sequence = sequence; }

        public String getH3Index() { return h3Index; }
        public void setH3Index(String h3Index) { this.h3Index = h3Index; }

        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }

        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }

        public double getRiskScore() { return riskScore; }
        public void setRiskScore(double riskScore) { this.riskScore = riskScore; }

        public String getRiskCategory() { return riskCategory; }
        public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }

        public double getGwlCm() { return gwlCm; }
        public void setGwlCm(double gwlCm) { this.gwlCm = gwlCm; }

        public double getPeatDepthMeters() { return peatDepthMeters; }
        public void setPeatDepthMeters(Double peatDepthMeters) { this.peatDepthMeters = peatDepthMeters != null ? peatDepthMeters : 0.0; }

        public double getDistanceToRoadMeters() { return distanceToRoadMeters; }
        public void setDistanceToRoadMeters(Double distanceToRoadMeters) { this.distanceToRoadMeters = distanceToRoadMeters != null ? distanceToRoadMeters : 0.0; }

        public double getDistanceToCanalMeters() { return distanceToCanalMeters; }
        public void setDistanceToCanalMeters(Double distanceToCanalMeters) { this.distanceToCanalMeters = distanceToCanalMeters != null ? distanceToCanalMeters : 0.0; }

        public String getConcessionId() { return concessionId; }
        public void setConcessionId(String concessionId) { this.concessionId = concessionId; }

        public String getEstimatedArrival() { return estimatedArrival; }
        public void setEstimatedArrival(String estimatedArrival) { this.estimatedArrival = estimatedArrival; }

        public String getPrescribedAction() { return prescribedAction; }
        public void setPrescribedAction(String prescribedAction) { this.prescribedAction = prescribedAction; }

        public String getAccessNote() { return accessNote; }
        public void setAccessNote(String accessNote) { this.accessNote = accessNote; }
    }

    public static class OmcTarget {
        private String h3Index;
        private double latitude;
        private double longitude;
        private double gwlCm;
        private double riskScore;
        private String cloudTargetType;
        private String saltAgentPayload;
        private String priority;
        private String reason;

        public OmcTarget() {}

        public OmcTarget(String h3Index, double latitude, double longitude, double gwlCm, double riskScore, String cloudTargetType, String saltAgentPayload, String priority, String reason) {
            this.h3Index = h3Index;
            this.latitude = latitude;
            this.longitude = longitude;
            this.gwlCm = gwlCm;
            this.riskScore = riskScore;
            this.cloudTargetType = cloudTargetType;
            this.saltAgentPayload = saltAgentPayload;
            this.priority = priority;
            this.reason = reason;
        }

        public String getH3Index() { return h3Index; }
        public void setH3Index(String h3Index) { this.h3Index = h3Index; }

        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }

        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }

        public double getGwlCm() { return gwlCm; }
        public void setGwlCm(double gwlCm) { this.gwlCm = gwlCm; }

        public double getRiskScore() { return riskScore; }
        public void setRiskScore(double riskScore) { this.riskScore = riskScore; }

        public String getCloudTargetType() { return cloudTargetType; }
        public void setCloudTargetType(String cloudTargetType) { this.cloudTargetType = cloudTargetType; }

        public String getSaltAgentPayload() { return saltAgentPayload; }
        public void setSaltAgentPayload(String saltAgentPayload) { this.saltAgentPayload = saltAgentPayload; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class SarAlert {
        private String alertId;
        private String h3Index;
        private double latitude;
        private double longitude;
        private String detectedAt;
        private double radarConfidence;
        private String anomalyType;
        private String concessionId;
        private String recommendedInvestigation;

        public SarAlert() {}

        public SarAlert(String alertId, String h3Index, double latitude, double longitude, String detectedAt, double radarConfidence, String anomalyType, String concessionId, String recommendedInvestigation) {
            this.alertId = alertId;
            this.h3Index = h3Index;
            this.latitude = latitude;
            this.longitude = longitude;
            this.detectedAt = detectedAt;
            this.radarConfidence = radarConfidence;
            this.anomalyType = anomalyType;
            this.concessionId = concessionId;
            this.recommendedInvestigation = recommendedInvestigation;
        }

        public String getAlertId() { return alertId; }
        public void setAlertId(String alertId) { this.alertId = alertId; }

        public String getH3Index() { return h3Index; }
        public void setH3Index(String h3Index) { this.h3Index = h3Index; }

        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }

        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }

        public String getDetectedAt() { return detectedAt; }
        public void setDetectedAt(String detectedAt) { this.detectedAt = detectedAt; }

        public double getRadarConfidence() { return radarConfidence; }
        public void setRadarConfidence(double radarConfidence) { this.radarConfidence = radarConfidence; }

        public String getAnomalyType() { return anomalyType; }
        public void setAnomalyType(String anomalyType) { this.anomalyType = anomalyType; }

        public String getConcessionId() { return concessionId; }
        public void setConcessionId(String concessionId) { this.concessionId = concessionId; }

        public String getRecommendedInvestigation() { return recommendedInvestigation; }
        public void setRecommendedInvestigation(String recommendedInvestigation) { this.recommendedInvestigation = recommendedInvestigation; }
    }

    public static class TacticalActionPlan {
        private String planId;
        private Instant generatedAt = Instant.now();
        private String aiEngine;
        private String targetH3Index;
        private String regionName;
        private String situationAssessment;
        private String threatLevel;
        private String recommendedPersonnel;
        private List<String> specificEquipment;
        private String fireBreakStrategy;
        private String waterSourceRecommendation;
        private String meteorologicalWatch;
        private String executiveSummary;

        public TacticalActionPlan() {}

        public TacticalActionPlan(
                String planId,
                Instant generatedAt,
                String aiEngine,
                String targetH3Index,
                String regionName,
                String situationAssessment,
                String threatLevel,
                String recommendedPersonnel,
                List<String> specificEquipment,
                String fireBreakStrategy,
                String waterSourceRecommendation,
                String meteorologicalWatch,
                String executiveSummary) {
            this.planId = planId;
            this.generatedAt = generatedAt != null ? generatedAt : Instant.now();
            this.aiEngine = aiEngine;
            this.targetH3Index = targetH3Index;
            this.regionName = regionName;
            this.situationAssessment = situationAssessment;
            this.threatLevel = threatLevel;
            this.recommendedPersonnel = recommendedPersonnel;
            this.specificEquipment = specificEquipment;
            this.fireBreakStrategy = fireBreakStrategy;
            this.waterSourceRecommendation = waterSourceRecommendation;
            this.meteorologicalWatch = meteorologicalWatch;
            this.executiveSummary = executiveSummary;
        }

        public String getPlanId() { return planId; }
        public void setPlanId(String planId) { this.planId = planId; }

        public Instant getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }

        public String getAiEngine() { return aiEngine; }
        public void setAiEngine(String aiEngine) { this.aiEngine = aiEngine; }

        public String getTargetH3Index() { return targetH3Index; }
        public void setTargetH3Index(String targetH3Index) { this.targetH3Index = targetH3Index; }

        public String getRegionName() { return regionName; }
        public void setRegionName(String regionName) { this.regionName = regionName; }

        public String getSituationAssessment() { return situationAssessment; }
        public void setSituationAssessment(String situationAssessment) { this.situationAssessment = situationAssessment; }

        public String getThreatLevel() { return threatLevel; }
        public void setThreatLevel(String threatLevel) { this.threatLevel = threatLevel; }

        public String getRecommendedPersonnel() { return recommendedPersonnel; }
        public void setRecommendedPersonnel(String recommendedPersonnel) { this.recommendedPersonnel = recommendedPersonnel; }

        public List<String> getSpecificEquipment() { return specificEquipment; }
        public void setSpecificEquipment(List<String> specificEquipment) { this.specificEquipment = specificEquipment; }

        public String getFireBreakStrategy() { return fireBreakStrategy; }
        public void setFireBreakStrategy(String fireBreakStrategy) { this.fireBreakStrategy = fireBreakStrategy; }

        public String getWaterSourceRecommendation() { return waterSourceRecommendation; }
        public void setWaterSourceRecommendation(String waterSourceRecommendation) { this.waterSourceRecommendation = waterSourceRecommendation; }

        public String getMeteorologicalWatch() { return meteorologicalWatch; }
        public void setMeteorologicalWatch(String meteorologicalWatch) { this.meteorologicalWatch = meteorologicalWatch; }

        public String getExecutiveSummary() { return executiveSummary; }
        public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }
    }
}
