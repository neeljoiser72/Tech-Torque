import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Info, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { useAssessments } from '@/lib/hooks';
import { ASSESSMENTS, getSeverity, getSeverityColor } from '@/lib/assessments';
import type { AssessmentType } from '@/lib/types';

export function Assessment() {
  const [selectedType, setSelectedType] = useState<AssessmentType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { addAssessment } = useAssessments();

  const def = selectedType ? ASSESSMENTS[selectedType] : null;

  const startAssessment = (type: AssessmentType) => {
    setSelectedType(type);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setSubmitError(null);
  };

  const selectAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < (def?.questions.length ?? 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const submitAssessment = async () => {
    if (!def) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await addAssessment(def.type, answers);
    setSubmitting(false);
    if (result.success) {
      setShowResults(true);
    } else {
      setSubmitError(result.error || 'Failed to save assessment. Please try again.');
    }
  };

  const reset = () => {
    setSelectedType(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setSubmitError(null);
  };

  if (!def) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Assessments</h1>
          <p className="text-ink-500 mt-1">Choose a validated screening tool to assess your mental health</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.values(ASSESSMENTS).map((a) => (
            <button
              key={a.type}
              onClick={() => startAssessment(a.type)}
              className="card-hover p-6 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 border border-primary-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {a.type === 'phq9' && <span className="text-lg font-bold">PHQ</span>}
                {a.type === 'gad7' && <span className="text-lg font-bold">GAD</span>}
                {a.type === 'pcl5' && <span className="text-lg font-bold">PCL</span>}
              </div>
              <h3 className="font-semibold text-ink-50 mb-1">{a.shortTitle}</h3>
              <p className="text-sm text-ink-400 mb-3">{a.description}</p>
              <div className="flex items-center gap-2 text-xs text-ink-600">
                <span>{a.questions.length} questions</span>
                <span>·</span>
                <span>~{Math.ceil(a.questions.length * 0.5)} min</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-primary-400 font-medium">
                Start assessment
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <div className="card p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-ink-400">
            These screening tools are validated instruments used in clinical settings. They are not a substitute for professional diagnosis.
            Your responses are stored securely and used to track your progress over time.
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = answers.reduce((sum, a) => sum + a, 0);
    const sev = getSeverity(def.type, score);
    const colorClass = getSeverityColor(sev.color);

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 aurora-bg opacity-40" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-400/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-xl font-bold font-display text-ink-50">Assessment Complete</h2>
            <p className="text-sm text-ink-500 mt-1">{def.title}</p>

            <div className="my-8">
              <p className="text-6xl font-bold font-display gradient-text">{score}</p>
              <p className="text-sm text-ink-600 mt-1">out of {def.maxScore}</p>
            </div>

            <div className={`inline-block px-4 py-2 rounded-full border text-sm font-semibold ${colorClass}`}>
              {sev.label}
            </div>

            <div className="mt-6 space-y-2">
              {def.severityRanges.map((range) => {
                const isActive = score >= range.min && score <= range.max;
                return (
                  <div
                    key={range.label}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${
                      isActive ? getSeverityColor(range.color) : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isActive ? '' : 'text-ink-600'}`}>{range.label}</span>
                    <span className={`text-xs ${isActive ? '' : 'text-ink-600'}`}>{range.min}–{range.max}</span>
                  </div>
                );
              })}
            </div>

            {def.type === 'phq9' && answers[8] >= 1 && (
              <div className="mt-6 rounded-xl border border-danger-400/20 bg-danger-500/10 p-4 text-left">
                <p className="text-sm text-danger-300 font-medium">
                  Your responses indicate thoughts of self-harm. Please reach out for immediate support:
                </p>
                <p className="text-sm text-danger-400 mt-2">
                  Call or text <span className="font-bold">988</span> (Suicide & Crisis Lifeline) — available 24/7
                </p>
              </div>
            )}

            <button onClick={reset} className="btn-secondary mt-8">
              <RotateCcw className="w-4 h-4" />
              Take Another Assessment
            </button>
          </div>
        </div>

        <div className="card p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-ink-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-ink-500">{def.info}</p>
        </div>
      </div>
    );
  }

  const question = def.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / def.questions.length) * 100;
  const isAnswered = answers[currentQuestion] !== undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={reset} className="text-sm text-ink-500 hover:text-ink-300 flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Exit
        </button>
        <span className="text-sm text-ink-500">
          Question {currentQuestion + 1} of {def.questions.length}
        </span>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {submitError && (
        <div className="rounded-xl border border-danger-400/20 bg-danger-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-danger-300 font-medium">Failed to save assessment</p>
            <p className="text-sm text-danger-400 mt-1 opacity-80">{submitError}</p>
          </div>
        </div>
      )}

      <div className="card p-8">
        <span className="text-xs font-semibold text-primary-400 uppercase tracking-wide">{def.shortTitle} Assessment</span>
        <h2 className="text-lg font-semibold text-ink-50 mb-6 mt-2 leading-relaxed">
          {question.text}
        </h2>

        <p className="text-sm text-ink-500 mb-4">Over the last 2 weeks, how often have you been bothered by this problem?</p>

        <div className="space-y-2.5">
          {def.options.map((opt) => {
            const isSelected = answers[currentQuestion] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => selectAnswer(opt.value)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-400/50 bg-primary-500/10 text-primary-200'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5 text-ink-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{opt.label}</span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-primary-400" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={nextQuestion}
            disabled={!isAnswered || submitting}
            className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {currentQuestion === def.questions.length - 1 ? 'Submit' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
