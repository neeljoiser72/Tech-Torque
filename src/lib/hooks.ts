import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import type { Assessment, CheckIn, RiskPrediction, AssessmentType } from './types';
import { getSeverity } from './assessments';
import type { RiskResult } from './riskEngine';

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await api.assessments.list();
    if (error) {
      setError(error);
    } else if (data) {
      setAssessments(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addAssessment = useCallback(async (type: AssessmentType, answers: number[]) => {
    const score = answers.reduce((sum, a) => sum + a, 0);
    const sev = getSeverity(type, score);
    const { data, error } = await api.assessments.create({
      type,
      score,
      severity: sev.label,
      answers,
    });
    if (error) {
      return { success: false as const, error };
    }
    if (data) {
      setAssessments((prev) => [data, ...prev]);
      return { success: true as const, data };
    }
    return { success: false as const, error: 'No data returned' };
  }, []);

  return { assessments, loading, error, addAssessment, refetch: fetch };
}

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await api.checkIns.list();
    if (error) {
      setError(error);
    } else if (data) {
      setCheckIns(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addCheckIn = useCallback(async (entry: Omit<CheckIn, 'id' | 'created_at' | 'user_id'>) => {
    const { data, error } = await api.checkIns.create(entry);
    if (error) {
      return { success: false as const, error };
    }
    if (data) {
      setCheckIns((prev) => [data, ...prev]);
      return { success: true as const, data };
    }
    return { success: false as const, error: 'No data returned' };
  }, []);

  return { checkIns, loading, error, addCheckIn, refetch: fetch };
}

export function useRiskPredictions() {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await api.riskPredictions.list();
    if (error) {
      setError(error);
    } else if (data) {
      setPredictions(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addPrediction = useCallback(async (result: RiskResult) => {
    const { data, error } = await api.riskPredictions.create({
      risk_level: result.risk_level,
      risk_score: result.risk_score,
      factors: result.factors,
      recommendations: result.recommendations,
      summary: result.summary,
    });
    if (error) {
      return { success: false as const, error };
    }
    if (data) {
      setPredictions((prev) => [data, ...prev]);
      return { success: true as const, data };
    }
    return { success: false as const, error: 'No data returned' };
  }, []);

  return { predictions, loading, error, addPrediction, refetch: fetch };
}
