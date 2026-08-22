import { useState, useRef, useCallback, useEffect } from 'react';
import { Phone, Globe, Heart, BookOpen, Wind, Brain, Users, ExternalLink, Play, Pause } from 'lucide-react';

const crisisLines = [
  { name: '988 Suicide & Crisis Lifeline', number: '988', description: 'Call or text 988, available 24/7. Free and confidential support for people in distress.', region: 'United States' },
  { name: 'SAMHSA National Helpline', number: '1-800-662-4357', description: 'Free, confidential, 24/7, 365-day-a-year treatment referral and information service.', region: 'United States' },
  { name: 'Crisis Text Line', number: 'Text HOME to 741741', description: 'Free, 24/7 crisis support by text message.', region: 'Global' },
  { name: 'International Association for Suicide Prevention', number: 'iasp.info/resources/Crisis_Centres', description: 'Find crisis centers and helplines worldwide.', region: 'International' },
];

const copingExercises = [
  { title: '4-7-8 Breathing', description: 'Inhale for 4 seconds, hold for 7, exhale for 8. Repeat 4 times to calm your nervous system.', icon: Wind, duration: '2 min' },
  { title: '5-4-3-2-1 Grounding', description: 'Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. Brings you to the present.', icon: Brain, duration: '3 min' },
  { title: 'Progressive Muscle Relaxation', description: 'Tense and release each muscle group from toes to head. Releases stored tension from trauma.', icon: Heart, duration: '10 min' },
  { title: 'Body Scan Meditation', description: 'Slowly bring attention to each part of your body. Notice sensations without judgment.', icon: BookOpen, duration: '5 min' },
];

const supportOrgs = [
  { name: 'National Center for PTSD', description: 'Information and resources for trauma survivors and their families.', url: 'www.ptsd.va.gov' },
  { name: 'International Society for Traumatic Stress Studies', description: 'Professional resources and research on trauma and its treatment.', url: 'www.istss.org' },
  { name: 'The Trevor Project', description: 'Crisis intervention and suicide prevention for LGBTQ+ young people.', url: 'www.thetrevorproject.org' },
  { name: 'NAMI HelpLine', description: 'Information, resource referrals and support for people living with mental health conditions.', url: 'www.nami.org' },
];

const phases = [
  { key: 'inhale', text: 'Breathe In', duration: 4000 },
  { key: 'hold', text: 'Hold', duration: 7000 },
  { key: 'exhale', text: 'Breathe Out', duration: 8000 },
  { key: 'rest', text: 'Rest', duration: 1000 },
] as const;

type BreathingPhase = typeof phases[number]['key'];

export function Resources() {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<BreathingPhase>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const activeRef = useRef(false);

  const startBreathing = useCallback(() => {
    if (activeRef.current) {
      activeRef.current = false;
      setBreathingActive(false);
      return;
    }
    activeRef.current = true;
    setBreathingActive(true);
    setBreathingCount(0);

    (async () => {
      for (let cycle = 0; cycle < 4; cycle++) {
        for (const phase of phases) {
          if (!activeRef.current) return;
          setBreathingPhase(phase.key);
          await new Promise((r) => setTimeout(r, phase.duration));
        }
        if (!activeRef.current) return;
        setBreathingCount((c) => c + 1);
      }
      activeRef.current = false;
      setBreathingActive(false);
      setBreathingPhase('inhale');
    })();
  }, []);

  useEffect(() => {
    return () => { activeRef.current = false; };
  }, []);

  const phaseScale: Record<BreathingPhase, string> = {
    inhale: 'scale-125',
    hold: 'scale-125',
    exhale: 'scale-100',
    rest: 'scale-100',
  };

  const phaseText: Record<BreathingPhase, string> = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    rest: 'Rest',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-50">Resources & Support</h1>
        <p className="text-ink-500 mt-1">Crisis support, coping tools, and professional resources</p>
      </div>

      {/* Crisis Support */}
      <div className="card p-6 border-danger-400/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-danger-500/10 text-danger-400 border border-danger-400/20 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-100">Crisis Support Lines</h3>
            <p className="text-xs text-ink-500">Available 24/7 — you are not alone</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {crisisLines.map((line) => (
            <div key={line.name} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-danger-400/20 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-ink-100 text-sm">{line.name}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-ink-500 flex-shrink-0">{line.region}</span>
              </div>
              <p className="text-sm text-ink-400 mb-2">{line.description}</p>
              <p className="text-sm font-bold text-danger-400">{line.number}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Breathing Exercise */}
      <div className="card p-6 relative overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold text-ink-100">4-7-8 Breathing Exercise</h3>
          </div>
          <p className="text-sm text-ink-400 mb-6">
            A calming breathing technique that activates your parasympathetic nervous system, reducing anxiety and distress.
          </p>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 flex items-center justify-center mb-4">
              <div
                className={`w-32 h-32 rounded-full bg-gradient-to-br from-primary-400/40 to-primary-600/40 border border-primary-400/30 transition-transform ease-in-out ${breathingActive ? phaseScale[breathingPhase] : 'scale-100'}`}
                style={{ transitionDuration: breathingPhase === 'inhale' ? '4000ms' : breathingPhase === 'exhale' ? '8000ms' : '0ms' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-ink-100 font-semibold text-lg">
                  {breathingActive ? phaseText[breathingPhase] : 'Ready?'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={startBreathing} className="btn-primary">
                {breathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {breathingActive ? 'Stop' : 'Start Breathing'}
              </button>
              {breathingActive && breathingCount > 0 && (
                <span className="text-sm text-ink-500">Cycle {breathingCount}/4</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coping Exercises */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-accent-400" />
          <h3 className="font-semibold text-ink-100">Coping Exercises</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {copingExercises.map((ex) => {
            const Icon = ex.icon;
            return (
              <div key={ex.title} className="card-hover p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-400/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-ink-100">{ex.title}</h4>
                      <span className="text-xs text-ink-600">{ex.duration}</span>
                    </div>
                    <p className="text-sm text-ink-400">{ex.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Organizations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-ink-100">Support Organizations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportOrgs.map((org) => (
            <div key={org.name} className="card-hover p-5">
              <h4 className="font-medium text-ink-100 mb-1">{org.name}</h4>
              <p className="text-sm text-ink-400 mb-2">{org.description}</p>
              <div className="flex items-center gap-1 text-sm text-primary-400 font-medium">
                <Globe className="w-4 h-4" />
                {org.url}
                <ExternalLink className="w-3 h-3 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message of hope */}
      <div className="relative rounded-3xl overflow-hidden p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-primary-500/10 to-accent-500/15" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-primary-400/15 rounded-full blur-[80px]" />
        <div className="relative">
          <Heart className="w-10 h-10 text-primary-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-ink-50 mb-2">You Are Not Alone</h3>
          <p className="text-sm text-ink-300 max-w-lg mx-auto leading-relaxed">
            Healing from trauma is a journey, and every step forward matters. Seeking help is a sign of strength,
            not weakness. Your experiences are valid, your feelings are real, and there is hope for recovery.
            Reach out, connect, and allow yourself the support you deserve.
          </p>
        </div>
      </div>
    </div>
  );
}
