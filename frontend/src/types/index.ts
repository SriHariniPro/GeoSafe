export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Accident {
  accident_id: string;
  latitude: number;
  longitude: number;
  road_name: string;
  area: string;
  date: string;
  time: string;
  day_of_week: string;
  weather: string;
  temperature?: number;
  visibility?: number;
  traffic_level: string;
  road_type: string;
  speed_limit: number;
  construction: string;
  accident_severity: string;
  vehicles_involved: number;
  fatalities: number;
  injuries: number;
  risk_score: number;
  risk_label: string;
}

export interface DatasetMetadata {
  severities: string[];
  weather_conditions: string[];
  traffic_levels: string[];
  construction_options: string[];
  areas: string[];
  roads: string[];
}

export interface LocationItem {
  name: string;
  type: string;
  area: string;
  latitude: number;
  longitude: number;
}

export interface ConstructionSite {
  id: number;
  latitude: number;
  longitude: number;
  road_name: string;
  construction_type: string;
  severity: string;
  status: string;
}

export interface Hotspot {
  id: number;
  cluster_id: number;
  latitude: number;
  longitude: number;
  accident_count: number;
  severity_score: number;
  hotspot_score: number;
  risk_level: string;
  status: string;
  dominant_time?: string;
  dominant_weather?: string;
  area_name?: string;
  road_name?: string;
  created_at: string;
}

export interface HotspotEvolution {
  hotspot_id: number;
  cluster_id: number;
  road_name: string;
  area_name: string;
  previous_count: number;
  current_count: number;
  change_pct: number;
  status: 'EMERGING' | 'PERSISTENT' | 'WORSENING' | 'IMPROVING' | 'DISAPPEARING';
  hotspot_score: number;
  latitude: number;
  longitude: number;
}

export interface FeatureAttribution {
  feature: string;
  percentage: number;
  impact: string;
}

export interface RiskPredictionResponse {
  risk_score: number;
  risk_level: string;
  confidence: number;
  resolved_location: string;
  latitude: number;
  longitude: number;
  explanations: FeatureAttribution[];
  why_risky: string[];
  reduction_suggestions: string[];
}

export interface SimulationResponse {
  base_risk_score: number;
  base_risk_level: string;
  sim_risk_score: number;
  sim_risk_level: string;
  risk_delta: number;
  summary_reason: string;
  base_explanations: FeatureAttribution[];
  sim_explanations: FeatureAttribution[];
}

export interface RouteCandidate {
  strategy: 'FASTEST' | 'BALANCED' | 'SAFEST';
  distance_km: number;
  duration_min: number;
  safety_score: number;
  risk_level: string;
  hotspots_crossed: number;
  accidents_near: number;
  construction_near: number;
  risk_exposure_breakdown: Record<string, number>;
  waypoints: [number, number][];
}

export interface RouteResponse {
  origin: string;
  destination: string;
  origin_coords: [number, number];
  destination_coords: [number, number];
  routes: RouteCandidate[];
}

export interface Intervention {
  id: number;
  hotspot_id?: number;
  location_name: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_action: string;
  reason: string;
  expected_impact: string;
  status: string;
}

export interface DashboardSummary {
  total_accidents: number;
  high_risk_accidents: number;
  detected_hotspots: number;
  total_fatalities: number;
  total_injuries: number;
  average_risk_score: number;
  most_dangerous_road: string;
  highest_risk_area: string;
  todays_safety_insight: string;
}

export interface EDASummary {
  accidents_by_month: Record<string, number>;
  accidents_by_hour: Record<string, number>;
  accidents_by_day: Record<string, number>;
  severity_distribution: Record<string, number>;
  weather_distribution: Record<string, number>;
  traffic_distribution: Record<string, number>;
  road_type_distribution: Record<string, number>;
  construction_distribution: Record<string, number>;
  traffic_vs_severity: any[];
  weather_vs_severity: any[];
  observations: string[];
}

export interface ModelPerformance {
  dataset_rows: number;
  test_rows: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  r2_score: number;
  classes: string[];
  confusion_matrix: number[][];
  feature_importances: { feature: string; importance: number }[];
  disclaimer: string;
}
