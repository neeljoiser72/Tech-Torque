import { useState, useEffect } from 'react';
import { Brain, LayoutDashboard, ClipboardList, Heart, Sparkles, BookOpen, Clock, Menu, X, Phone, LogOut } from 'lucide-react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { Landing } from '@/views/Landing';
import { Login } from '@/views/Login';
import { Dashboard } from '@/views/Dashboard';
import { Assessment } from '@/views/Assessment';
import { CheckIn } from '@/views/CheckIn';
import { RiskPrediction } from '@/views/RiskPrediction';
import { Resources } from '@/views/Resources';
import { History } from '@/views/History';

type View = 'landing' | 'login' | 'dashboard' | 'assessment' | 'checkin' | 'prediction' | 'resources' | 'history';

const navItems: { id: View; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, desc: 'Overview & insights' },
  { id: 'assessment', label: 'Assessments', icon: <ClipboardList className="w-5 h-5" />, desc: 'PHQ-9, GAD-7, PCL-5' },
  { id: 'checkin', label: 'Daily Check-in', icon: <Heart className="w-5 h-5" />, desc: 'Mood & wellness log' },
  { id: 'prediction', label: 'AI Prediction', icon: <Sparkles className="w-5 h-5" />, desc: 'Distress risk analysis' },
  { id: 'history', label: 'History', icon: <Clock className="w-5 h-5" />, desc: 'Activity timeline' },
  { id: 'resources', label: 'Resources', icon: <BookOpen className="w-5 h-5" />, desc: 'Crisis support & tools' },
];

function App() {
  const [view, setView] = useState<View>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    api.auth.getSession()
      .then(({ user }) => {
        setUser(user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });

    const listener = api.auth.onAuthStateChange((newUser) => {
      setUser(newUser);
      setAuthLoading(false);
    });

    return () => {
      listener.unsubscribe();
    };
  }, []);

  const navigate = (v: string) => {
    setView(v as View);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    api.auth.signOut();
    setUser(null);
    setView('landing');
    setMobileMenuOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 grid-pattern opacity-30" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Brain className="w-7 h-7 text-ink-950" />
          </div>
          <div className="w-8 h-8 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <Landing
        onEnter={() => {
          if (user) {
            setView('dashboard');
          } else {
            setView('login');
          }
        }}
      />
    );
  }

  if (view === 'login' || !user) {
    return (
      <Login
        onAuthSuccess={() => setView('dashboard')}
        onBack={() => setView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Ambient background */}
      <div className="fixed inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none animate-aurora" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-[120px] pointer-events-none animate-aurora-delayed" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-72 flex-col p-4 z-40">
        <div className="glass rounded-2xl flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="p-5 border-b border-white/5">
            <button onClick={() => setView('landing')} className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 transition-transform group-hover:scale-105">
                <Brain className="w-6 h-6 text-ink-950" />
                <div className="absolute inset-0 rounded-2xl bg-primary-400/20 blur-md -z-10" />
              </div>
              <div>
                <span className="font-bold font-display text-ink-50 block leading-tight text-lg">MindGuard AI</span>
                <span className="text-xs text-ink-500">Mental Health Monitor</span>
              </div>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
            <p className="text-xs font-semibold text-ink-600 uppercase tracking-wider px-3 py-2">Menu</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`nav-item w-full ${view === item.id ? 'nav-item-active' : ''}`}
              >
                {item.icon}
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  <span className="text-xs text-ink-600 font-normal">{item.desc}</span>
                </div>
              </button>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="p-4 space-y-3">
            {/* Crisis CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-danger-500/10 to-accent-500/10 border border-danger-400/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-danger-500/20 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-danger-400" />
                </div>
                <p className="text-xs font-semibold text-ink-200">Need immediate help?</p>
              </div>
              <p className="text-xs text-ink-500 mb-2">Call or text 988 — available 24/7</p>
              <button onClick={() => navigate('resources')} className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                View resources →
              </button>
            </div>

            {/* User info */}
            <div className="flex items-center justify-between rounded-xl bg-ink-900/40 border border-white/5 px-3 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-300">
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                </div>
                <span className="text-xs text-ink-300 truncate">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg hover:bg-danger-500/10 text-ink-500 hover:text-danger-400 transition-colors flex-shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 glass-strong">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setView('landing')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Brain className="w-5 h-5 text-ink-950" />
            </div>
            <span className="font-bold font-display text-ink-50">MindGuard AI</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl hover:bg-danger-500/10 text-ink-400 hover:text-danger-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-xl hover:bg-white/5 text-ink-300">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-ink-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute top-16 left-3 right-3 glass-strong rounded-2xl p-3 space-y-1 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`nav-item w-full ${view === item.id ? 'nav-item-active' : ''}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 relative z-10">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {view === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {view === 'assessment' && <Assessment />}
          {view === 'checkin' && <CheckIn />}
          {view === 'prediction' && <RiskPrediction />}
          {view === 'resources' && <Resources />}
          {view === 'history' && <History />}
        </div>
      </main>
    </div>
  );
}

export default App;
