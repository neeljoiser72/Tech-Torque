import { useState } from 'react';
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, Activity, Loader2, AlertCircle } from 'lucide-react';
import { useAssessments, useCheckIns, useRiskPredictions } from '@/lib/hooks';
import { predictRisk, getRiskColor, getRiskLabel } from '@/lib/riskEngine';
import { CircularProgress } from '@/components/CircularProgress';

export function RiskPrediction() {
  const { assessments } = useAssessments();
  const { checkIns } = useCheckIns();
  const { predictions, addPrediction } = useRiskPredictions();
  const [analyzing, setAnalyzing] = useState(false);
  const [latestResult, setLatestResult] = useState(predictions[0] ?? null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    await new Promise((r) => setTimeout(r, 1500));
    const result = predictRisk({ assessments, checkIns });
    const saved = await addPrediction(result);
    setAnalyzing(false);
    if (saved.success) {
      setLatestResult(saved.data);
    } else {
      setLatestResult({ ...result, id: '', created_at: new Date().toISOString() } as any);
      setAnalysisError(saved.error || 'Failed to save analysis to database');
    }
  };

  const riskColors = latestResult ? getRiskColor(latestResult.risk_level) : null;
  const hasData = assessments.length > 0 || checkIns.length > 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-50">AI Distress Prediction</h1>
        <p className="text-ink-500 mt-1">
          Advanced analysis combining assessment scores and daily patterns to predict distress risk
        </p>
      </div>

      {/* How it works */}
      <div className="card p-5 relative overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-40" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-500/10 text-primary-400 border border-primary-400/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-100">How the AI Engine Works</h3>
            <p className="text-sm text-ink-400 mt-1">
              Our prediction engine analyzes your assessment scores (PHQ-9, GAD-7, PCL-5) alongside daily check-in patterns
              including mood, sleep quality, anxiety, and distress levels. It identifies trends, detects critical indicators,
              and generates a composite risk score with personalized recommendations.
            </p>
          </div>
        </div>
      </div>

      {!hasData && !latestResult && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-ink-600" />
          </div>
          <h3 className="font-semibold text-ink-100 mb-2">No Data Available Yet</h3>
          <p className="text-sm text-ink-500 mb-6 max-w-md mx-auto">
            To generate a distress prediction, you need at least one assessment or daily check-in.
            Start by completing an assessment or logging how you feel today.
          </p>
        </div>
      )}

      {hasData && (
        <div className="flex justify-center">
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="btn-primary text-base px-8 py-3"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing patterns...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {latestResult ? 'Re-run AI Analysis' : 'Run AI Analysis'}
              </>
            )}
          </button>
        </div>
      )}

      {analysisError && (
        <div className="rounded-xl border border-warning-400/20 bg-warning-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-warning-300 font-medium">Analysis saved locally but not to database</p>
            <p className="text-sm text-warning-400 mt-1 opacity-80">{analysisError}</p>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="card p-8">
          <div className="space-y-3">
            {[
              'Loading assessment data...',
              'Analyzing check-in patterns...',
              'Detecting risk indicators...',
              'Computing composite risk score...',
              'Generating recommendations...',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 animate-slide-in-right" style={{ animationDelay: `${i * 200}ms` }}>
                <div className="w-6 h-6 rounded-full bg-primary-500/10 border border-primary-400/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                </div>
                <span className="text-sm text-ink-400">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {latestResult && !analyzing && (
        <div className="space-y-4 animate-slide-up">
          {/* Risk Score */}
          <div className={`card p-8 ${riskColors!.bg} ${riskColors!.borderClass} relative overflow-hidden`}>
            <div className="absolute inset-0 aurora-bg opacity-30" />
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <CircularProgress
                value={latestResult.risk_score}
                gradientFrom={riskColors!.gradientFrom}
                gradientTo={riskColors!.gradientTo}
                size={200}
                label="Risk Score"
                sublabel={getRiskLabel(latestResult.risk_level)}
              />
              <div className="flex-1">
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold border ${riskColors!.bg} ${riskColors!.text} ${riskColors!.borderClass} mb-4`}>
                  {getRiskLabel(latestResult.risk_level)} Risk Level
                </div>
                <p className="text-sm text-ink-300 leading-relaxed">
                  {latestResult.summary}
                </p>
                <p className="text-xs text-ink-600 mt-3">
                  Analysis performed on {new Date(latestResult.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Contributing Factors */}
          {latestResult.factors.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning-400" />
                <h3 className="font-semibold text-ink-100">Contributing Risk Factors</h3>
              </div>
              <div className="space-y-2">
                {latestResult.factors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="w-6 h-6 rounded-lg bg-warning-500/10 text-warning-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-ink-300">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary-400" />
              <h3 className="font-semibold text-ink-100">Personalized Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {latestResult.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-primary-500/5 border border-primary-400/10">
                  <TrendingUp className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-ink-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Crisis banner */}
          {(latestResult.risk_level === 'severe' || latestResult.risk_level === 'high') && (
            <div className="rounded-2xl border-2 border-danger-400/30 bg-danger-500/10 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-danger-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-danger-300">Important: Please Read</h3>
                  <p className="text-sm text-danger-400 mt-1 opacity-90">
                    Your results indicate significant distress. You deserve support. Please consider reaching out to a
                    mental health professional or contacting a crisis helpline. You are not alone.
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-danger-400">
                    <p><span className="font-bold">988</span> — Suicide & Crisis Lifeline (call or text, 24/7)</p>
                    <p><span className="font-bold">1-800-662-4357</span> — SAMHSA Helpline</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Previous predictions */}
      {predictions.length > 1 && (
        <div className="card p-5">
          <h3 className="font-semibold text-ink-100 mb-4">Previous Analyses</h3>
          <div className="space-y-2">
            {predictions.slice(1, 6).map((p) => {
              const colors = getRiskColor(p.risk_level);
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${colors.gradient}`} />
                    <span className="text-sm text-ink-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-ink-200">{p.risk_score}/100</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                      {getRiskLabel(p.risk_level)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
