import type { Assessment, CheckIn, RiskPrediction } from './types';
import { getSeverity, ASSESSMENTS } from './assessments';

export interface RiskInput {
  assessments: Assessment[];
  checkIns: CheckIn[];
}

export interface RiskResult {
  risk_level: RiskPrediction['risk_level'];
  risk_score: number;
  factors: string[];
  recommendations: string[];
  summary: string;
}

const ASSESSMENT_LABELS: Record<string, string> = {
  phq9: 'depression',
  gad7: 'anxiety',
  pcl5: 'PTSD',
};

const PHQ9_CUTOFFS = [
  { max: 4, risk: 8 },
  { max: 9, risk: 22 },
  { max: 14, risk: 45 },
  { max: 19, risk: 68 },
  { max: 27, risk: 90 },
];

const GAD7_CUTOFFS = [
  { max: 4, risk: 8 },
  { max: 9, risk: 25 },
  { max: 14, risk: 50 },
  { max: 21, risk: 82 },
];

const PCL5_CUTOFFS = [
  { max: 10, risk: 6 },
  { max: 20, risk: 20 },
  { max: 35, risk: 42 },
  { max: 55, risk: 68 },
  { max: 80, risk: 92 },
];

const ASSESSMENT_CUTOFFS: Record<string, { max: number; risk: number }[]> = {
  phq9: PHQ9_CUTOFFS,
  gad7: GAD7_CUTOFFS,
  pcl5: PCL5_CUTOFFS,
};

const ASSESSMENT_WEIGHTS: Record<string, number> = {
  phq9: 0.40,
  gad7: 0.30,
  pcl5: 0.30,
};

const CHECKIN_WEIGHT = 0.35;
const ASSESSMENT_WEIGHT_TOTAL = 0.65;

export function predictRisk(input: RiskInput): RiskResult {
  const factors: string[] = [];
  const recommendations: string[] = [];

  const { score: assessmentScore, hasCriticalFlag } = computeAssessmentRisk(input.assessments, factors, recommendations);
  const checkInScore = computeCheckInRisk(input.checkIns, factors);

  const hasAssessmentData = assessmentScore !== null;
  const hasCheckInData = checkInScore !== null;

  let finalScore: number;

  if (hasAssessmentData && hasCheckInData) {
    finalScore = assessmentScore! * ASSESSMENT_WEIGHT_TOTAL + checkInScore! * CHECKIN_WEIGHT;
  } else if (hasAssessmentData) {
    finalScore = assessmentScore!;
  } else if (hasCheckInData) {
    finalScore = checkInScore!;
  } else {
    finalScore = 0;
  }

  if (hasCriticalFlag) {
    finalScore = Math.max(finalScore, 88);
  }

  finalScore = Math.min(100, Math.max(0, Math.round(finalScore)));

  let riskLevel: RiskPrediction['risk_level'];
  if (finalScore >= 75) riskLevel = 'severe';
  else if (finalScore >= 50) riskLevel = 'high';
  else if (finalScore >= 25) riskLevel = 'moderate';
  else riskLevel = 'low';

  generateRecommendations(riskLevel, factors, recommendations);

  const summary = generateSummary(riskLevel, finalScore, factors, hasAssessmentData, hasCheckInData);

  return {
    risk_level: riskLevel,
    risk_score: finalScore,
    factors: factors.slice(0, 8),
    recommendations: recommendations.slice(0, 8),
    summary,
  };
}

function computeAssessmentRisk(
  assessments: Assessment[],
  factors: string[],
  recommendations: string[]
): { score: number | null; hasCriticalFlag: boolean } {
  const byType: Record<string, Assessment> = {};
  for (const a of assessments) {
    if (!byType[a.type]) {
      byType[a.type] = a;
    }
  }

  const types = Object.keys(byType);
  if (types.length === 0) return { score: null, hasCriticalFlag: false };

  let weightedSum = 0;
  let totalWeight = 0;
  let hasCriticalFlag = false;

  for (const type of types) {
    const a = byType[type];
    const def = ASSESSMENTS[type as keyof typeof ASSESSMENTS];
    if (!def) continue;

    const cutoffs = ASSESSMENT_CUTOFFS[type];
    if (!cutoffs) continue;

    const sev = getSeverity(type as any, a.score);

    let baseRisk = 0;
    let lowerBound = 0;
    for (const c of cutoffs) {
      if (a.score <= c.max) {
        const range = c.max - lowerBound;
        const position = range > 0 ? (a.score - lowerBound) / range : 0;
        const prevRisk = lowerBound === 0 ? 0 : cutoffs[cutoffs.indexOf(c) - 1].risk;
        baseRisk = prevRisk + (c.risk - prevRisk) * position;
        break;
      }
      lowerBound = c.max;
    }

    const weight = ASSESSMENT_WEIGHTS[type] ?? 0.33;
    weightedSum += baseRisk * weight;
    totalWeight += weight;

    if (sev.color === 'danger' || sev.color === 'accent') {
      factors.push(
        `${type.toUpperCase()} score of ${a.score}/${def.maxScore} indicates ${sev.label.toLowerCase()} ${ASSESSMENT_LABELS[type]} symptoms`
      );
    } else if (sev.color === 'warning') {
      factors.push(
        `${type.toUpperCase()} score of ${a.score}/${def.maxScore} shows moderate ${ASSESSMENT_LABELS[type]} indicators`
      );
    } else if (sev.color === 'primary') {
      factors.push(
        `${type.toUpperCase()} score of ${a.score}/${def.maxScore} shows mild ${ASSESSMENT_LABELS[type]} indicators`
      );
    }

    if (type === 'phq9' && a.answers && a.answers[8] >= 1) {
      factors.push('Self-harm ideation detected in PHQ-9 assessment (item 9)');
      hasCriticalFlag = true;
      recommendations.unshift(
        'Immediate professional support recommended — contact a crisis helpline or mental health professional'
      );
    }
  }

  return { score: totalWeight > 0 ? weightedSum / totalWeight : null, hasCriticalFlag };
}

function computeCheckInRisk(checkIns: CheckIn[], factors: string[]): number | null {
  if (checkIns.length === 0) return null;

  const recent = checkIns.slice(0, 14);
  const n = recent.length;

  const avgMood = recent.reduce((s, c) => s + c.mood, 0) / n;
  const avgAnxiety = recent.reduce((s, c) => s + c.anxiety_level, 0) / n;
  const avgDistress = recent.reduce((s, c) => s + c.distress_level, 0) / n;
  const avgSleep = recent.reduce((s, c) => s + c.sleep_hours, 0) / n;

  const moodRisk = ((5 - avgMood) / 4) * 100;
  const anxietyRisk = ((avgAnxiety - 1) / 4) * 100;
  const distressRisk = ((avgDistress - 1) / 4) * 100;

  let sleepRisk: number;
  if (avgSleep < 4) {
    sleepRisk = 90;
  } else if (avgSleep < 5) {
    sleepRisk = 70;
  } else if (avgSleep < 6) {
    sleepRisk = 40;
  } else if (avgSleep > 11) {
    sleepRisk = 60;
  } else if (avgSleep > 10) {
    sleepRisk = 35;
  } else {
    sleepRisk = 0;
  }

  let trendRisk = 0;
  let trendDirection = 0;
  if (n >= 4) {
    const half = Math.floor(n / 2);
    const older = recent.slice(half).reduce((s, c) => s + c.distress_level, 0) / (n - half);
    const newer = recent.slice(0, half).reduce((s, c) => s + c.distress_level, 0) / half;
    trendDirection = newer - older;
    if (trendDirection > 0.5) {
      trendRisk = Math.min(25, trendDirection * 15);
    } else if (trendDirection < -0.5) {
      trendRisk = -8;
    }
  }

  let consistencyRisk = 0;
  if (n >= 3) {
    const moodStd = Math.sqrt(recent.reduce((s, c) => s + Math.pow(c.mood - avgMood, 2), 0) / n);
    const distressStd = Math.sqrt(recent.reduce((s, c) => s + Math.pow(c.distress_level - avgDistress, 2), 0) / n);
    const combinedStd = moodStd + distressStd;
    if (combinedStd > 1.5) {
      consistencyRisk = Math.min(20, (combinedStd - 1.5) * 12);
    }
  }

  const recencyMood = computeRecencyWeighted(recent.map((c) => c.mood));
  const recencyDistress = computeRecencyWeighted(recent.map((c) => c.distress_level));
  const recencyMoodRisk = ((5 - recencyMood) / 4) * 100;
  const recencyDistressRisk = ((recencyDistress - 1) / 4) * 100;

  const blendedMoodRisk = moodRisk * 0.35 + recencyMoodRisk * 0.65;
  const blendedDistressRisk = distressRisk * 0.35 + recencyDistressRisk * 0.65;

  const totalRisk = Math.min(
    100,
    Math.max(
      0,
      blendedMoodRisk * 0.28 +
        anxietyRisk * 0.22 +
        blendedDistressRisk * 0.28 +
        sleepRisk * 0.12 +
        Math.max(0, trendRisk) * 0.07 +
        consistencyRisk * 0.03
    )
  );

  if (avgMood <= 2) {
    factors.push(`Persistently low mood over recent check-ins (avg ${avgMood.toFixed(1)}/5)`);
  }
  if (avgAnxiety >= 4) {
    factors.push(`Elevated anxiety levels in daily check-ins (avg ${avgAnxiety.toFixed(1)}/5)`);
  }
  if (avgDistress >= 4) {
    factors.push(`High distress reported in recent check-ins (avg ${avgDistress.toFixed(1)}/5)`);
  }
  if (avgSleep < 5) {
    factors.push(`Insufficient sleep pattern detected (avg ${avgSleep.toFixed(1)} hours)`);
  }
  if (avgSleep > 10) {
    factors.push(`Oversleeping pattern detected (avg ${avgSleep.toFixed(1)} hours) — possible depression indicator`);
  }
  if (trendDirection > 0.8) {
    factors.push('Distress levels are trending upward in recent days');
  } else if (trendDirection < -0.8) {
    factors.push('Distress levels are trending downward — positive improvement');
  }
  if (consistencyRisk > 10) {
    factors.push('High variability in daily wellness metrics — emotional instability detected');
  }

  return totalRisk;
}

function computeRecencyWeighted(values: number[]): number {
  if (values.length === 0) return 0;
  let weightedSum = 0;
  let weightSum = 0;
  for (let i = 0; i < values.length; i++) {
    const weight = Math.pow(0.82, i);
    weightedSum += values[i] * weight;
    weightSum += weight;
  }
  return weightedSum / weightSum;
}

function generateRecommendations(
  riskLevel: string,
  factors: string[],
  recommendations: string[]
): void {
  if (riskLevel === 'severe') {
    recommendations.push('Seek immediate professional mental health support');
    recommendations.push('Contact a crisis helpline: Call or text 988 (Suicide & Crisis Lifeline)');
    recommendations.push('Reach out to a trusted person — you do not have to face this alone');
    recommendations.push('Consider in-person counseling with a trauma-informed therapist');
  } else if (riskLevel === 'high') {
    recommendations.push('Schedule an appointment with a mental health professional');
    recommendations.push('Practice grounding techniques: 5-4-3-2-1 sensory awareness exercise');
    recommendations.push('Maintain a consistent sleep schedule');
    recommendations.push('Connect with a support group for survivors');
  } else if (riskLevel === 'moderate') {
    recommendations.push('Continue regular self-monitoring through daily check-ins');
    recommendations.push('Practice deep breathing exercises: 4-7-8 breathing technique');
    recommendations.push('Engage in light physical activity or mindful walking');
    recommendations.push('Journal your thoughts and feelings regularly');
  } else {
    recommendations.push('Continue your positive mental health practices');
    recommendations.push('Maintain social connections and community engagement');
    recommendations.push('Keep up with regular assessments to track your progress');
    recommendations.push('Practice gratitude and mindfulness daily');
  }

  if (factors.some((f) => f.includes('sleep'))) {
    recommendations.push('Improve sleep hygiene: limit screens before bed, create a calm evening routine');
  }
  if (factors.some((f) => f.includes('anxiety') || f.includes('Anxiety'))) {
    recommendations.push('Try progressive muscle relaxation for anxiety management');
  }
}

function generateSummary(
  level: string,
  score: number,
  factors: string[],
  hasAssessmentData: boolean,
  hasCheckInData: boolean
): string {
  const levelText: Record<string, string> = {
    low: 'Your overall distress risk is currently low. This suggests your mental health indicators are relatively stable.',
    moderate: 'Your distress risk is moderate. Some indicators suggest you may be experiencing emotional challenges that warrant attention.',
    high: 'Your distress risk is high. Multiple indicators suggest significant emotional distress that should be addressed with professional support.',
    severe: 'Your distress risk is severe. Immediate professional support is strongly recommended to ensure your safety and wellbeing.',
  };

  let summary = levelText[level] ?? levelText.low;

  if (!hasAssessmentData && !hasCheckInData) {
    return 'No data available yet. Complete an assessment or log a daily check-in to generate a distress prediction.';
  }

  if (!hasAssessmentData && hasCheckInData) {
    summary += ' Note: This prediction is based solely on daily check-in data. Completing clinical assessments will improve accuracy.';
  } else if (hasAssessmentData && !hasCheckInData) {
    summary += ' Note: This prediction is based solely on assessment data. Daily check-ins will provide a more complete picture.';
  }

  if (factors.length > 0) {
    summary += ` Key contributing factors include: ${factors.slice(0, 3).join('; ').toLowerCase()}.`;
  }

  return summary;
}

export interface RiskColorSet {
  bg: string;
  text: string;
  border: string;
  borderClass: string;
  gradient: string;
  gradientFrom: string;
  gradientTo: string;
  bar: string;
}

export function getRiskColor(level: string): RiskColorSet {
  const map: Record<string, RiskColorSet> = {
    low: {
      bg: 'bg-success-500/10',
      text: 'text-success-400',
      border: 'border-success-400/20',
      borderClass: 'border-success-400/20',
      gradient: 'from-success-400 to-success-600',
      gradientFrom: '#4ade80',
      gradientTo: '#16a34a',
      bar: 'bg-success-400',
    },
    moderate: {
      bg: 'bg-warning-500/10',
      text: 'text-warning-400',
      border: 'border-warning-400/20',
      borderClass: 'border-warning-400/20',
      gradient: 'from-warning-400 to-warning-600',
      gradientFrom: '#fbbf24',
      gradientTo: '#d97706',
      bar: 'bg-warning-400',
    },
    high: {
      bg: 'bg-accent-500/10',
      text: 'text-accent-400',
      border: 'border-accent-400/20',
      borderClass: 'border-accent-400/20',
      gradient: 'from-accent-400 to-accent-600',
      gradientFrom: '#fb923c',
      gradientTo: '#ea580c',
      bar: 'bg-accent-400',
    },
    severe: {
      bg: 'bg-danger-500/10',
      text: 'text-danger-400',
      border: 'border-danger-400/20',
      borderClass: 'border-danger-400/20',
      gradient: 'from-danger-400 to-danger-600',
      gradientFrom: '#f87171',
      gradientTo: '#dc2626',
      bar: 'bg-danger-400',
    },
  };
  return map[level] ?? map.low;
}

export function getRiskLabel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}
