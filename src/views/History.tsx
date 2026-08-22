import { useMemo } from 'react';
import { Calendar, Brain, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { useAssessments, useCheckIns, useRiskPredictions } from '@/lib/hooks';
import { ASSESSMENTS, getSeverity, getSeverityColor } from '@/lib/assessments';
import { getRiskColor, getRiskLabel } from '@/lib/riskEngine';

export function History() {
  const { assessments, loading: assessmentsLoading } = useAssessments();
  const { checkIns, loading: checkInsLoading } = useCheckIns();
  const { predictions, loading: predictionsLoading } = useRiskPredictions();

  const loading = assessmentsLoading || checkInsLoading || predictionsLoading;

  const timeline = useMemo(() => {
    type Entry = { date: string; type: 'assessment' | 'checkin' | 'prediction'; data: any };
    const entries: Entry[] = [
      ...assessments.map((a) => ({ date: a.created_at, type: 'assessment' as const, data: a })),
      ...checkIns.map((c) => ({ date: c.created_at, type: 'checkin' as const, data: c })),
      ...predictions.map((p) => ({ date: p.created_at, type: 'prediction' as const, data: p })),
    ];
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [assessments, checkIns, predictions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-50">History</h1>
        <p className="text-ink-500 mt-1">Complete timeline of your assessments, check-ins, and AI analyses</p>
      </div>

      {timeline.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-ink-600" />
          </div>
          <h3 className="font-semibold text-ink-100 mb-2">No History Yet</h3>
          <p className="text-sm text-ink-500">
            Your activity will appear here once you complete assessments, log check-ins, or run AI analyses.
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary-400" />
                <span className="text-xs text-ink-500">Assessments</span>
              </div>
              <p className="text-2xl font-bold font-display text-ink-50">{assessments.length}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-accent-400" />
                <span className="text-xs text-ink-500">Check-ins</span>
              </div>
              <p className="text-2xl font-bold font-display text-ink-50">{checkIns.length}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-warning-400" />
                <span className="text-xs text-ink-500">AI Analyses</span>
              </div>
              <p className="text-2xl font-bold font-display text-ink-50">{predictions.length}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-6">
            <h3 className="font-semibold text-ink-100 mb-4">Activity Timeline</h3>
            <div className="space-y-3">
              {timeline.map((entry, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      entry.type === 'assessment' ? 'bg-primary-500/10 text-primary-400 border-primary-400/20' :
                      entry.type === 'checkin' ? 'bg-accent-500/10 text-accent-400 border-accent-400/20' :
                      'bg-warning-500/10 text-warning-400 border-warning-400/20'
                    }`}>
                      {entry.type === 'assessment' && <Brain className="w-5 h-5" />}
                      {entry.type === 'checkin' && <Heart className="w-5 h-5" />}
                      {entry.type === 'prediction' && <AlertCircle className="w-5 h-5" />}
                    </div>
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-white/5 mt-1" />}
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-ink-200">
                        {entry.type === 'assessment' && `Assessment: ${ASSESSMENTS[entry.data.type as keyof typeof ASSESSMENTS]?.shortTitle}`}
                        {entry.type === 'checkin' && 'Daily Check-in'}
                        {entry.type === 'prediction' && 'AI Distress Analysis'}
                      </span>
                      <span className="text-xs text-ink-600">
                        {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {entry.type === 'assessment' && (
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-ink-400">
                          Score: <span className="font-semibold text-ink-200">{entry.data.score}</span> / {ASSESSMENTS[entry.data.type as keyof typeof ASSESSMENTS]?.maxScore}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(getSeverity(entry.data.type, entry.data.score).color)}`}>
                          {entry.data.severity}
                        </span>
                      </div>
                    )}

                    {entry.type === 'checkin' && (
                      <div className="grid grid-cols-4 gap-2 mt-2 max-w-md">
                        <HistoryMini label="Mood" value={`${entry.data.mood}/5`} />
                        <HistoryMini label="Sleep" value={`${entry.data.sleep_hours}h`} />
                        <HistoryMini label="Anxiety" value={`${entry.data.anxiety_level}/5`} />
                        <HistoryMini label="Distress" value={`${entry.data.distress_level}/5`} />
                      </div>
                    )}

                    {entry.type === 'prediction' && (
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-ink-400">
                          Risk Score: <span className="font-semibold text-ink-200">{entry.data.risk_score}/100</span>
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(entry.data.risk_level).bg} ${getRiskColor(entry.data.risk_level).text}`}>
                          {getRiskLabel(entry.data.risk_level)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function HistoryMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
      <p className="text-sm font-semibold text-ink-200">{value}</p>
      <p className="text-xs text-ink-600">{label}</p>
    </div>
  );
}
