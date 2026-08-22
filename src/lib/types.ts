export interface User {
  id: string;
  email: string;
  isGuest?: boolean;
  createdAt?: string;
}

export type AssessmentType = 'phq9' | 'gad7' | 'pcl5';

export interface Assessment {
  id: string;
  user_id: string;
  type: AssessmentType;
  score: number;
  severity: string;
  answers: number[];
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  mood: number;
  sleep_hours: number;
  anxiety_level: number;
  distress_level: number;
  notes: string | null;
  created_at: string;
}

export interface RiskPrediction {
  id: string;
  user_id: string;
  risk_level: 'low' | 'moderate' | 'high' | 'severe';
  risk_score: number;
  factors: string[];
  recommendations: string[];
  summary: string;
  created_at: string;
}
