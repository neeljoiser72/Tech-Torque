import { Brain, Activity, Heart, Shield, ArrowRight, Sparkles, LineChart, Users, Zap } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 grid-pattern opacity-30" />
      <div className="fixed top-[-10%] left-[10%] w-[600px] h-[600px] bg-primary-500/15 rounded-full blur-[140px] animate-aurora" />
      <div className="fixed bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[140px] animate-aurora-delayed" />
      <div className="fixed top-[40%] left-[60%] w-[400px] h-[400px] bg-primary-400/8 rounded-full blur-[120px] animate-float" />

      <div className="relative z-10">
        {/* Nav bar */}
        <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Brain className="w-5 h-5 text-ink-950" />
            </div>
            <span className="font-bold font-display text-lg text-ink-50">MindGuard AI</span>
          </div>
          <button onClick={onEnter} className="btn-secondary text-sm">
            Enter Platform
            <ArrowRight className="w-4 h-4" />
          </button>
        </nav>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-400/20 text-sm text-primary-300 font-medium mb-8 animate-slide-up">
              <Sparkles className="w-4 h-4" />
              AI-Powered Mental Health Monitoring
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display text-ink-50 leading-[1.05] text-balance animate-slide-up" style={{ animationDelay: '0.05s' }}>
              Dynamic Mental Health
              <br />
              Monitoring &{' '}
              <span className="gradient-text">Distress Prediction</span>
              <br />
              for Victims of Atrocities
            </h1>

            <p className="text-lg text-ink-400 mt-8 leading-relaxed max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              A compassionate, AI-driven platform that continuously monitors psychological wellbeing,
              detects early signs of distress, and provides timely support for survivors of trauma and atrocities.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-10 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <button onClick={onEnter} className="btn-primary text-base px-8 py-3.5 text-base">
                Enter the Platform
                <ArrowRight className="w-5 h-5" />
              </button>
              <a href="#features" className="btn-secondary text-base px-8 py-3.5 text-base">
                Explore Features
              </a>
            </div>
          </div>

          {/* Floating preview cards */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <PreviewCard icon={<Activity className="w-5 h-5" />} label="Real-time Risk Score" value="AI-driven" color="primary" />
            <PreviewCard icon={<Heart className="w-5 h-5" />} label="Daily Check-ins" value="4 metrics" color="accent" />
            <PreviewCard icon={<ClipboardListSmall />} label="Assessments" value="3 tools" color="warning" />
            <PreviewCard icon={<Zap className="w-5 h-5" />} label="Crisis Support" value="24/7" color="danger" />
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatItem value="3" label="Validated Assessment Tools" />
              <StatItem value="4" label="Daily Wellness Metrics" />
              <StatItem value="AI" label="Distress Risk Prediction" />
              <StatItem value="24/7" label="Crisis Support Resources" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-14 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-ink-400 font-medium mb-4">
              FEATURES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-ink-50 leading-tight">
              Comprehensive mental health support,{' '}
              <span className="gradient-text">reimagined</span>
            </h2>
            <p className="text-ink-400 mt-4 text-lg">
              Our platform combines clinical assessment tools, daily monitoring, and AI-driven analysis
              to provide holistic mental health support for trauma survivors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="Clinical Assessments"
              description="Complete validated screening tools including PHQ-9 for depression, GAD-7 for anxiety, and PCL-5 for PTSD — specifically designed for trauma assessment."
              color="primary"
            />
            <FeatureCard
              icon={<Heart className="w-6 h-6" />}
              title="Daily Check-ins"
              description="Track your mood, sleep, anxiety, and distress levels daily. Build awareness of patterns and triggers over time with intuitive visualizations."
              color="accent"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Risk Prediction"
              description="Our AI engine analyzes assessment scores and daily patterns to predict distress risk levels, identify contributing factors, and recommend personalized actions."
              color="warning"
            />
            <FeatureCard
              icon={<LineChart className="w-6 h-6" />}
              title="Progress Tracking"
              description="Visualize your mental health journey with trend charts and a complete activity timeline. See how your scores change over weeks and months."
              color="success"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Crisis Support"
              description="Immediate access to crisis helplines, coping exercises, and professional support organizations. You are never alone in your journey."
              color="danger"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Trauma-Informed Care"
              description="Every aspect of the platform is designed with trauma survivors in mind — from the assessments chosen to the language used in recommendations."
              color="primary"
            />
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-white/5 bg-ink-900/30">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-14 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-ink-400 font-medium mb-4">
                PROCESS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-ink-50">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StepCard step="01" title="Assess" description="Complete standardized psychological assessments to establish your baseline." />
              <StepCard step="02" title="Monitor" description="Log daily check-ins to track mood, sleep, anxiety, and distress patterns." />
              <StepCard step="03" title="Analyze" description="Our AI engine processes your data to predict distress risk and identify trends." />
              <StepCard step="04" title="Act" description="Receive personalized recommendations and access crisis support when needed." />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-primary-500/10 to-accent-500/15" />
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary-400/20 rounded-full blur-[100px]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-ink-50 mb-4">Take the First Step</h2>
              <p className="text-ink-300 max-w-xl mx-auto mb-8 text-lg">
                Your mental health journey starts with awareness. Enter the platform to begin assessing,
                monitoring, and understanding your emotional wellbeing.
              </p>
              <button onClick={onEnter} className="btn-primary text-base px-8 py-3.5">
                Enter MindGuard AI
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-ink-950" />
              </div>
              <span className="font-semibold text-ink-300">MindGuard AI</span>
            </div>
            <p className="text-sm text-ink-600 text-center">
              This platform is a screening tool, not a substitute for professional diagnosis.
              If you are in crisis, call or text 988.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ClipboardListSmall() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function PreviewCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-500/10 text-primary-400 border-primary-400/20',
    accent: 'bg-accent-500/10 text-accent-400 border-accent-400/20',
    warning: 'bg-warning-500/10 text-warning-400 border-warning-400/20',
    danger: 'bg-danger-500/10 text-danger-400 border-danger-400/20',
  };
  return (
    <div className="card p-4 animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-ink-100">{value}</p>
      <p className="text-xs text-ink-500 mt-0.5">{label}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold font-display gradient-text">{value}</p>
      <p className="text-sm text-ink-500 mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-500/10 text-primary-400 border-primary-400/20',
    accent: 'bg-accent-500/10 text-accent-400 border-accent-400/20',
    warning: 'bg-warning-500/10 text-warning-400 border-warning-400/20',
    success: 'bg-success-500/10 text-success-400 border-success-400/20',
    danger: 'bg-danger-500/10 text-danger-400 border-danger-400/20',
  };
  return (
    <div className="card-hover p-6 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${colorMap[color]} transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <h3 className="font-semibold text-ink-50 mb-2 text-lg">{title}</h3>
      <p className="text-sm text-ink-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/15 to-primary-400/5 border border-primary-400/20 flex items-center justify-center mx-auto mb-5">
        <span className="text-xl font-bold font-display gradient-text">{step}</span>
        <div className="absolute inset-0 rounded-2xl bg-primary-400/10 blur-lg -z-10" />
      </div>
      <h3 className="font-semibold text-ink-50 mb-2 text-lg">{title}</h3>
      <p className="text-sm text-ink-400">{description}</p>
    </div>
  );
}
