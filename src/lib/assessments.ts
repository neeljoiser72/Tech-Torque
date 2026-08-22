import type { AssessmentType } from './types';

export interface Question {
  id: number;
  text: string;
}

export interface AssessmentDefinition {
  type: AssessmentType;
  title: string;
  shortTitle: string;
  description: string;
  questions: Question[];
  options: { label: string; value: number }[];
  maxScore: number;
  severityRanges: { min: number; max: number; label: string; color: string }[];
  info: string;
}

const standardOptions = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

const pcl5Options = [
  { label: 'Not at all', value: 0 },
  { label: 'A little bit', value: 1 },
  { label: 'Moderately', value: 2 },
  { label: 'Quite a bit', value: 3 },
  { label: 'Extremely', value: 4 },
];

export const ASSESSMENTS: Record<AssessmentType, AssessmentDefinition> = {
  phq9: {
    type: 'phq9',
    title: 'Patient Health Questionnaire (PHQ-9)',
    shortTitle: 'Depression',
    description: 'A 9-item screening tool for depression severity.',
    info: 'The PHQ-9 is the most widely used depression screening tool in clinical practice. It assesses depressive symptoms over the past 2 weeks.',
    questions: [
      { id: 1, text: 'Little interest or pleasure in doing things' },
      { id: 2, text: 'Feeling down, depressed, or hopeless' },
      { id: 3, text: 'Trouble falling/staying asleep, or sleeping too much' },
      { id: 4, text: 'Feeling tired or having little energy' },
      { id: 5, text: 'Poor appetite or overeating' },
      { id: 6, text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down' },
      { id: 7, text: 'Trouble concentrating on things, such as reading or watching television' },
      { id: 8, text: 'Moving or speaking so slowly that other people could have noticed — or the opposite, being so fidgety or restless that you have been moving around a lot more than usual' },
      { id: 9, text: 'Thoughts that you would be better off dead, or of hurting yourself in some way' },
    ],
    options: standardOptions,
    maxScore: 27,
    severityRanges: [
      { min: 0, max: 4, label: 'Minimal', color: 'success' },
      { min: 5, max: 9, label: 'Mild', color: 'primary' },
      { min: 10, max: 14, label: 'Moderate', color: 'warning' },
      { min: 15, max: 19, label: 'Moderately Severe', color: 'accent' },
      { min: 20, max: 27, label: 'Severe', color: 'danger' },
    ],
  },
  gad7: {
    type: 'gad7',
    title: 'Generalized Anxiety Disorder (GAD-7)',
    shortTitle: 'Anxiety',
    description: 'A 7-item screening tool for anxiety severity.',
    info: 'The GAD-7 is a validated tool for screening for Generalized Anxiety Disorder. It assesses anxiety symptoms over the past 2 weeks.',
    questions: [
      { id: 1, text: 'Feeling nervous, anxious, or on edge' },
      { id: 2, text: 'Not being able to stop or control worrying' },
      { id: 3, text: 'Worrying too much about different things' },
      { id: 4, text: 'Trouble relaxing' },
      { id: 5, text: 'Being so restless that it is hard to sit still' },
      { id: 6, text: 'Becoming easily annoyed or irritable' },
      { id: 7, text: 'Feeling afraid as if something awful might happen' },
    ],
    options: standardOptions,
    maxScore: 21,
    severityRanges: [
      { min: 0, max: 4, label: 'Minimal', color: 'success' },
      { min: 5, max: 9, label: 'Mild', color: 'primary' },
      { min: 10, max: 14, label: 'Moderate', color: 'warning' },
      { min: 15, max: 21, label: 'Severe', color: 'danger' },
    ],
  },
  pcl5: {
    type: 'pcl5',
    title: 'PTSD Checklist (PCL-5)',
    shortTitle: 'PTSD',
    description: 'A 20-item screening tool for post-traumatic stress disorder.',
    info: 'The PCL-5 is a 20-item self-report measure that assesses the 20 DSM-5 symptoms of PTSD. It is especially relevant for survivors of atrocities and trauma.',
    questions: [
      { id: 1, text: 'Repeatedly disturbing memories of the stressful experience' },
      { id: 2, text: 'Repeatedly disturbing dreams of the stressful experience' },
      { id: 3, text: 'Suddenly acting or feeling as if the stressful experience were happening again' },
      { id: 4, text: 'Feeling very upset when something reminded you of the stressful experience' },
      { id: 5, text: 'Having strong physical reactions when something reminded you of the stressful experience' },
      { id: 6, text: 'Avoiding memories, thoughts, or feelings related to the stressful experience' },
      { id: 7, text: 'Avoiding external reminders of the stressful experience' },
      { id: 8, text: 'Trouble remembering important parts of the stressful experience' },
      { id: 9, text: 'Having strong negative beliefs about yourself, other people, or the world' },
      { id: 10, text: 'Blaming yourself or someone else for the stressful experience or what happened after it' },
      { id: 11, text: 'Having strong negative feelings such as fear, horror, anger, guilt, or shame' },
      { id: 12, text: 'Loss of interest in activities that you used to enjoy' },
      { id: 13, text: 'Feeling distant or cut off from other people' },
      { id: 14, text: 'Trouble experiencing positive feelings' },
      { id: 15, text: 'Irritable behavior, angry outbursts, or acting aggressively' },
      { id: 16, text: 'Taking too many risks or doing things that could cause harm' },
      { id: 17, text: 'Being "superalert" or watchful or on guard' },
      { id: 18, text: 'Feeling jumpy or easily startled' },
      { id: 19, text: 'Having difficulty concentrating' },
      { id: 20, text: 'Trouble falling or staying asleep' },
    ],
    options: pcl5Options,
    maxScore: 80,
    severityRanges: [
      { min: 0, max: 10, label: 'Minimal', color: 'success' },
      { min: 11, max: 20, label: 'Mild', color: 'primary' },
      { min: 21, max: 35, label: 'Moderate', color: 'warning' },
      { min: 36, max: 55, label: 'High', color: 'accent' },
      { min: 56, max: 80, label: 'Severe', color: 'danger' },
    ],
  },
};

export function getSeverity(assessmentType: AssessmentType, score: number) {
  const def = ASSESSMENTS[assessmentType];
  return def.severityRanges.find((r) => score >= r.min && score <= r.max) ?? def.severityRanges[0];
}

export function getSeverityColor(color: string): string {
  const map: Record<string, string> = {
    success: 'text-success-400 bg-success-500/10 border-success-400/20',
    primary: 'text-primary-400 bg-primary-500/10 border-primary-400/20',
    warning: 'text-warning-400 bg-warning-500/10 border-warning-400/20',
    accent: 'text-accent-400 bg-accent-500/10 border-accent-400/20',
    danger: 'text-danger-400 bg-danger-500/10 border-danger-400/20',
  };
  return map[color] ?? map.primary;
}

export function getSeverityBarColor(color: string): string {
  const map: Record<string, string> = {
    success: 'bg-success-400',
    primary: 'bg-primary-400',
    warning: 'bg-warning-400',
    accent: 'bg-accent-400',
    danger: 'bg-danger-400',
  };
  return map[color] ?? map.primary;
}
