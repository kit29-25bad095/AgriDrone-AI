export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type UserRole = 'farmer' | 'official' | 'researcher';

export interface Field {
  id: number;
  name: string;
  farmer_id: string;
  lat: number;
  lng: number;
  boundary: string;
  crop_type: string;
}

export interface Flight {
  id: number;
  field_id: number;
  field_name?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  start_time: string;
  end_time?: string;
}

export interface AnalysisResult {
  id: number;
  flight_id: number;
  field_name?: string;
  image_url: string;
  analysis_json: string; // Parsed as AnalysisData
  severity: Severity;
  is_anomaly: number;
  timestamp: string;
}

export interface AnalysisData {
  health_score: number;
  issue: string;
  recommendation: string;
  detected_patterns: string[];
}

export interface Alert {
  id: number;
  field_id: number;
  field_name?: string;
  severity: Severity;
  message: string;
  is_read: boolean;
  timestamp: string;
}
