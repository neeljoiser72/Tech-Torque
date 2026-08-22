import { useState } from 'react';
import { Moon, Frown, Meh, Smile, Heart, Brain, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useCheckIns } from '@/lib/hooks';

const moodOptions = [
  { value: 1, label: 'Very Low', icon: Frown, color: 'text-danger-400', bg: 'bg-danger-500/10 border-danger-400/30' },
  { value: 2, label: 'Low', icon: Frown, color: 'text-accent-400', bg: 'bg-accent-500/10 border-accent-400/30' },
  { value: 3, label: 'Neutral', icon: Meh, color: 'text-warning-400', bg: 'bg-warning-500/10 border-warning-400/30' },
  { value: 4, label: 'Good', icon: Smile, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-400/30' },
  { value: 5, label: 'Great', icon: Heart, color: 'text-success-400', bg: 'bg-success-500/10 border-success-400/30' },
];

const levelOptions = [
  { value: 1, label: 'Minimal', color: 'text-success-400', bg: 'bg-success-500/10 border-success-400/30' },
  { value: 2, label: 'Mild', color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-400/30' },
  { value: 3, label: 'Moderate', color: 'text-warning-400', bg: 'bg-warning-500/10 border-warning-400/30' },
  { value: 4, label: 'High', color: 'text-accent-400', bg: 'bg-accent-500/10 border-accent-400/30' },
  { value: 5, label: 'Very High', color: 'text-danger-400', bg: 'bg-danger-500/10 border-danger-400/30' },
];

export function CheckIn() {
  const { addCheckIn } = useCheckIns();
  const [mood, setMood] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState(7);
  const [anxiety, setAnxiety] = useState<number | null>(null);
  const [distress, setDistress] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = mood !== null && anxiety !== null && distress !== null;

  const handleSubmit = async () => {
    if (!canSubmit || mood === null || anxiety === null || distress === null) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await addCheckIn({
      mood,
      sleep_hours: sleepHours,
      anxiety_level: anxiety,
      distress_level: distress,
      notes: notes.trim() || null,
    });
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error || 'Failed to save check-in. Please try again.');
    }
  };

  const reset = () => {
    setMood(null);
    setSleepHours(7);
    setAnxiety(null);
    setDistress(null);
    setNotes('');
    setSubmitted(false);
    setSubmitError(null);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 aurora-bg opacity-40" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-success-500/10 border border-success-400/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-400" />
            </div>
            <h2 className="text-xl font-bold font-display text-ink-50">Check-in Saved</h2>
            <p className="text-sm text-ink-500 mt-2 max-w-md mx-auto">
              Thank you for taking a moment to reflect. Your entry has been recorded and will contribute to your mental health insights.
            </p>
            <button onClick={reset} className="btn-primary mt-6">
              Log Another Check-in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-50">Daily Check-in</h1>
        <p className="text-ink-500 mt-1">Take a moment to reflect on how you're feeling today</p>
      </div>

      {submitError && (
        <div className="rounded-xl border border-danger-400/20 bg-danger-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-danger-300 font-medium">Failed to save check-in</p>
            <p className="text-sm text-danger-400 mt-1 opacity-80">{submitError}</p>
          </div>
        </div>
      )}

      {/* Mood */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-ink-100">How is your mood today?</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {moodOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = mood === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setMood(opt.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected ? `${opt.bg} border-current ${opt.color}` : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <Icon className={`w-7 h-7 ${isSelected ? opt.color : 'text-ink-600'}`} />
                <span className={`text-xs font-medium ${isSelected ? opt.color : 'text-ink-500'}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sleep */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5 text-accent-400" />
          <h3 className="font-semibold text-ink-100">How many hours did you sleep?</h3>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="14"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
            className="flex-1 accent-primary-500"
          />
          <div className="flex items-baseline gap-1 min-w-[60px]">
            <span className="text-2xl font-bold font-display text-ink-50">{sleepHours}</span>
            <span className="text-sm text-ink-600">hrs</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-ink-600 mt-2">
          <span>0h</span>
          <span>7h (recommended)</span>
          <span>14h</span>
        </div>
      </div>

      {/* Anxiety */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-warning-400" />
          <h3 className="font-semibold text-ink-100">Anxiety level today?</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {levelOptions.map((opt) => {
            const isSelected = anxiety === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setAnxiety(opt.value)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected ? `${opt.bg} border-current ${opt.color}` : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <span className={`text-xs font-medium block ${isSelected ? opt.color : 'text-ink-500'}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Distress */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-danger-400" />
          <h3 className="font-semibold text-ink-100">Overall distress level?</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {levelOptions.map((opt) => {
            const isSelected = distress === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setDistress(opt.value)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected ? `${opt.bg} border-current ${opt.color}` : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <span className={`text-xs font-medium block ${isSelected ? opt.color : 'text-ink-500'}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="card p-6">
        <h3 className="font-semibold text-ink-100 mb-3">Journal entry (optional)</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Write down any thoughts, feelings, or reflections you'd like to remember..."
          className="input-field resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Check-in'
        )}
      </button>
      {!canSubmit && (
        <p className="text-center text-sm text-ink-600">
          Please complete mood, anxiety, and distress selections to save
        </p>
      )}
    </div>
  );
}
