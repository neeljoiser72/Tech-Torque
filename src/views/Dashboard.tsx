import { useMemo } from 'react';
import { Activity, TrendingDown, TrendingUp, Heart, Brain, Moon, AlertTriangle, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { useAssessments, useCheckIns, useRiskPredictions } from '@/lib/hooks';
import { getSeverity, getSeverityColor, getSeverityBarColor, ASSESSMENTS } from '@/lib/assessments';
import { getRiskColor, getRiskLabel } from '@/lib/riskEngine';
import { CircularProgress } from '@/components/CircularProgress';
import { LineChart, BarChart } from '@/components/Charts';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { assessments, loading: assessmentsLoading } = useAssessments();
  const { checkIns, loading: checkInsLoading } = useCheckIns();
  const { predictions, loading: predictionsLoading } = useRiskPredictions();

  const loading = assessmentsLoading || checkInsLoading || predictionsLoading;

  const latestPrediction = predictions[0];
  const latestCheckIn = checkIns[0];

  const recentAssessments = useMemo(() => {
    const byType: Record<string, typeof assessments> = {};
    for (const a of assessments) {
      if (!byType[a.type]) byType[a.type] = [];
      byType[a.type].push(a);
    }
    return byType;
  }, [assessments]);

  const checkInChartData = useMemo(() => {
    return checkIns.slice(0, 14).reverse().map((c) => ({
      label: new Date(c.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: c.mood,
    }));
  }, [checkIns]);

  const distressChartData = useMemo(() => {
    return checkIns.slice(0, 14).reverse().map((c) => ({
      label: new Date(c.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: c.distress_level,
    }));
  }, [checkIns]);

  const avgSleep = useMemo(() => {
    if (checkIns.length === 0) return 0;
    return checkIns.slice(0, 7).reduce((s, c) => s + c.sleep_hours, 0) / Math.min(checkIns.length, 7);
  }, [checkIns]);

  const avgMood = useMemo(() => {
    if (checkIns.length === 0) return 0;
    return checkIns.slice(0, 7).reduce((s, c) => s + c.mood, 0) / Math.min(checkIns.length, 7);
  }, [checkIns]);

  const riskColors = latestPrediction ? getRiskColor(latestPrediction.risk_level) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-50">Dashboard</h1>
          <p className="text-ink-500 mt-1">Your mental health overview at a glance</p>
        </div>
        <button onClick={() => onNavigate('checkin')} className="btn-primary text-sm">
          <Heart className="w-4 h-4" />
          Quick Check-in
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Risk Score - Large */}
        <div className="col-span-12 lg:col-span-5 card p-6 flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden">
          <div className="absolute inset-0 aurora-bg opacity-50" />
          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wide">Current Risk Level</h2>
            </div>
            {latestPrediction ? (
              <>
                <CircularProgress
                  value={latestPrediction.risk_score}
                  gradientFrom={riskColors!.gradientFrom}
                  gradientTo={riskColors!.gradientTo}
                  size={180}
                  label="Risk Score"
                  sublabel={getRiskLabel(latestPrediction.risk_level)}
                />
                <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-semibold border ${riskColors!.bg} ${riskColors!.text} ${riskColors!.borderClass}`}>
                  {getRiskLabel(latestPrediction.risk_level)} Risk
                </div>
                <p className="text-xs text-ink-600 mt-3 text-center">
                  Last analyzed {new Date(latestPrediction.created_at).toLocaleDateString()}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center py-8">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Activity className="w-10 h-10 text-ink-600" />
                </div>
                <p className="text-sm text-ink-400 text-center mb-4">No risk analysis yet</p>
                <button onClick={() => onNavigate('prediction')} className="btn-primary text-sm">
                  <Sparkles className="w-4 h-4" />
                  Run AI Analysis
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metrics - Right side */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4">
          <MetricCard
            icon={<Heart className="w-5 h-5" />}
            label="Avg Mood (7 days)"
            value={avgMood > 0 ? `${avgMood.toFixed(1)}/5` : '—'}
            color="primary"
            trend={checkIns.length > 1 ? (checkIns[0].mood > checkIns[1]?.mood ? 'up' : 'down') : null}
          />
          <MetricCard
            icon={<Moon className="w-5 h-5" />}
            label="Avg Sleep (7 days)"
            value={avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : '—'}
            color="accent"
          />
          <MetricCard
            icon={<Brain className="w-5 h-5" />}
            label="Assessments Done"
            value={assessments.length.toString()}
            color="warning"
          />
          <MetricCard
            icon={<Calendar className="w-5 h-5" />}
            label="Check-ins Logged"
            value={checkIns.length.toString()}
            color="success"
          />
        </div>

        {/* Mood Trend Chart */}
        <div className="col-span-12 lg:col-span-7 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-100">Mood Trend</h3>
            <span className="text-xs text-ink-600">Last 14 check-ins</span>
          </div>
          {checkInChartData.length > 1 ? (
            <LineChart data={checkInChartData} color="#34d399" max={5} min={0} />
          ) : (
            <EmptyChart onAction={() => onNavigate('checkin')} actionLabel="Log your first check-in" />
          )}
        </div>

        {/* Distress Chart */}
        <div className="col-span-12 lg:col-span-5 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-100">Distress Level</h3>
            <span className="text-xs text-ink-600">Last 14 check-ins</span>
          </div>
          {distressChartData.length > 1 ? (
            <BarChart data={distressChartData} color="#fb923c" />
          ) : (
            <EmptyChart onAction={() => onNavigate('checkin')} actionLabel="Log your first check-in" />
          )}
        </div>

        {/* Latest Assessment Scores */}
        <div className="col-span-12 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-100">Latest Assessment Scores</h3>
            <button onClick={() => onNavigate('assessment')} className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors">
              Take new assessment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['phq9', 'gad7', 'pcl5'] as const).map((type) => {
              const latest = recentAssessments[type]?.[0];
              const def = ASSESSMENTS[type];
              const sev = latest ? getSeverity(type, latest.score) : null;
              return (
                <div key={type} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ink-300">{def.shortTitle}</span>
                    {latest && sev && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(sev.color)}`}>
                        {sev.label}
                      </span>
                    )}
                  </div>
                  {latest && sev ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold font-display text-ink-50">{latest.score}</span>
                        <span className="text-sm text-ink-600">/ {def.maxScore}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getSeverityBarColor(sev.color)}`}
                          style={{ width: `${(latest.score / def.maxScore) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-ink-600 mt-2">
                        {new Date(latest.created_at).toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-ink-600 py-2">Not yet assessed</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest check-in */}
        {latestCheckIn && (
          <div className="col-span-12 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-100">Latest Check-in</h3>
              <span className="text-xs text-ink-600">
                {new Date(latestCheckIn.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniMetric label="Mood" value={`${latestCheckIn.mood}/5`} />
              <MiniMetric label="Sleep" value={`${latestCheckIn.sleep_hours}h`} />
              <MiniMetric label="Anxiety" value={`${latestCheckIn.anxiety_level}/5`} />
              <MiniMetric label="Distress" value={`${latestCheckIn.distress_level}/5`} />
            </div>
            {latestCheckIn.notes && (
              <p className="mt-4 text-sm text-ink-400 italic border-l-2 border-primary-400/30 pl-3">
                "{latestCheckIn.notes}"
              </p>
            )}
          </div>
        )}

        {/* Alert banner if high risk */}
        {latestPrediction && (latestPrediction.risk_level === 'high' || latestPrediction.risk_level === 'severe') && (
          <div className={`col-span-12 rounded-2xl border p-5 ${riskColors!.bg} ${riskColors!.borderClass}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${riskColors!.text}`} />
              <div>
                <h3 className={`font-semibold ${riskColors!.text}`}>
                  {latestPrediction.risk_level === 'severe' ? 'Immediate Support Recommended' : 'Professional Support Recommended'}
                </h3>
                <p className={`text-sm mt-1 ${riskColors!.text} opacity-80`}>
                  {latestPrediction.summary}
                </p>
                <button onClick={() => onNavigate('resources')} className={`mt-3 text-sm font-medium underline ${riskColors!.text}`}>
                  View support resources →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  trend?: 'up' | 'down' | null;
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-500/10 text-primary-400 border-primary-400/20',
    accent: 'bg-accent-500/10 text-accent-400 border-accent-400/20',
    warning: 'bg-warning-500/10 text-warning-400 border-warning-400/20',
    success: 'bg-success-500/10 text-success-400 border-success-400/20',
  };
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-success-400' : 'text-danger-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold font-display text-ink-50">{value}</p>
      <p className="text-xs text-ink-500 mt-1">{label}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <p className="text-lg font-bold font-display text-ink-50">{value}</p>
      <p className="text-xs text-ink-500 mt-0.5">{label}</p>
    </div>
  );
}

function EmptyChart({ onAction, actionLabel }: { onAction: () => void; actionLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="text-sm text-ink-600 mb-3">Not enough data yet</p>
      <button onClick={onAction} className="text-sm text-primary-400 hover:text-primary-300 font-medium">
        {actionLabel} →
      </button>
    </div>
  );
}
