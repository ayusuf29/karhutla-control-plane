export type RiskCategory = "LOW" | "MEDIUM" | "HIGH" | "EXTREME" | "UNKNOWN";

export interface H3CellProperties {
  h3Index: string;
  resolution: number;
  peatDepthMeters: number;
  distanceToCanalMeters: number;
  distanceToRoadMeters: number;
  concessionId: string;
  centroidLon?: number;
  centroidLat?: number;
  riskCategory: RiskCategory;
  riskScore: number;
  gwlCm?: number;
  daysWithoutRain?: number;
  vpdKpa?: number;
  sarClearingDetected?: boolean;
  recommendedAction?: string;
  snapshotDate?: string;
}

export interface GeoJsonGeometry {
  type: "Polygon" | "Point";
  coordinates: number[][][] | number[];
}

export interface GeoJsonFeature {
  type: "Feature";
  id: string;
  geometry: GeoJsonGeometry;
  properties: H3CellProperties;
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
  metadata?: {
    totalFeatures: number;
    h3Resolution: number;
    retrievedAt: string;
  };
}

export interface AssessorSummary {
  totalMonitoredHexagons: number;
  extremeRiskCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageGwlCm: number;
  averageRiskScore: number;
  sarClearingAlerts: number;
  hazardDiagnosis: string;
  suggestedOverallStrategy: string;
}

export interface Waypoint {
  sequence: number;
  h3Index: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskCategory: RiskCategory;
  gwlCm: number;
  peatDepthMeters: number;
  distanceToRoadMeters: number;
  distanceToCanalMeters: number;
  concessionId: string;
  estimatedArrival: string;
  prescribedAction: string;
  accessNote: string;
}

export interface PatrolCard {
  squadId: string;
  squadName: string;
  regionName: string;
  status: string;
  totalWaypoints: number;
  estimatedTotalDistanceKm: number;
  estimatedDurationHours: number;
  primaryObjective: string;
  recommendedEquipment: string[];
  waypoints: Waypoint[];
}

export interface OmcTarget {
  h3Index: string;
  latitude: number;
  longitude: number;
  gwlCm: number;
  riskScore: number;
  cloudTargetType: string;
  saltAgentPayload: string;
  priority: string;
  reason: string;
}

export interface SarAlert {
  alertId: string;
  h3Index: string;
  latitude: number;
  longitude: number;
  detectedAt: string;
  radarConfidence: number;
  anomalyType: string;
  concessionId: string;
  recommendedInvestigation: string;
}

export interface TacticalActionPlan {
  planId: string;
  generatedAt: string;
  aiEngine: string;
  targetH3Index: string;
  regionName: string;
  situationAssessment: string;
  threatLevel: string;
  recommendedPersonnel: string;
  specificEquipment: string[];
  fireBreakStrategy: string;
  waterSourceRecommendation: string;
  meteorologicalWatch: string;
  executiveSummary: string;
}

export interface RecommendationOverview {
  timestamp: string;
  systemStatus: string;
  assessorSummary: AssessorSummary;
  patrolCards: PatrolCard[];
  omcTargets: OmcTarget[];
  sarAlerts: SarAlert[];
  tacticalActionPlan?: TacticalActionPlan;
}

export interface DispatchResponse {
  dispatchId: string;
  squadId: string;
  status: string;
  assignedWaypoints: number;
  approvedBy: string;
  approvedAt: string;
  operationalStatus: string;
  message: string;
  targetWaypoints?: string[];
}

