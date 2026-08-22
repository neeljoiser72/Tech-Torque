import type { User, Assessment, CheckIn, RiskPrediction, AssessmentType } from './types';

const TOKEN_KEY = 'mindguard_auth_token';
const USER_KEY = 'mindguard_auth_user';

type AuthListener = (user: User | null) => void;
const authListeners = new Set<AuthListener>();

function notifyAuthListeners(user: User | null) {
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.error('Auth listener error:', e);
    }
  });
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthListeners(user);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthListeners(null);
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null; error: string | null }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 401) {
        clearSession();
      }
      return {
        data: null,
        error: (body && body.error) || `Request failed with status ${res.status}`,
      };
    }

    return { data: body as T, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Network error. Please make sure the server is running.',
    };
  }
}

export const api = {
  auth: {
    getUser: (): User | null => {
      return getStoredUser();
    },

    async getSession(): Promise<{ user: User | null }> {
      const token = getToken();
      if (!token) {
        return { user: null };
      }
      const { data, error } = await apiRequest<{ user: User }>('/api/auth/me');
      if (error || !data?.user) {
        clearSession();
        return { user: null };
      }
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { user: data.user };
    },

    async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
      const { data, error } = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (error || !data) {
        return { user: null, error: error || 'Login failed' };
      }

      setSession(data.token, data.user);
      return { user: data.user, error: null };
    },

    async signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
      const { data, error } = await apiRequest<{ user: User; token: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (error || !data) {
        return { user: null, error: error || 'Sign up failed' };
      }

      setSession(data.token, data.user);
      return { user: data.user, error: null };
    },

    async guestLogin(): Promise<{ user: User | null; error: string | null }> {
      const { data, error } = await apiRequest<{ user: User; token: string }>('/api/auth/guest', {
        method: 'POST',
      });

      if (error || !data) {
        return { user: null, error: error || 'Guest login failed' };
      }

      setSession(data.token, data.user);
      return { user: data.user, error: null };
    },

    signOut: () => {
      clearSession();
    },

    onAuthStateChange: (callback: AuthListener) => {
      authListeners.add(callback);
      return {
        unsubscribe: () => {
          authListeners.delete(callback);
        },
      };
    },
  },

  assessments: {
    list: async () => {
      return apiRequest<Assessment[]>('/api/assessments');
    },
    create: async (assessment: { type: AssessmentType; score: number; severity: string; answers: number[] }) => {
      return apiRequest<Assessment>('/api/assessments', {
        method: 'POST',
        body: JSON.stringify(assessment),
      });
    },
  },

  checkIns: {
    list: async () => {
      return apiRequest<CheckIn[]>('/api/check-ins');
    },
    create: async (entry: Omit<CheckIn, 'id' | 'created_at' | 'user_id'>) => {
      return apiRequest<CheckIn>('/api/check-ins', {
        method: 'POST',
        body: JSON.stringify(entry),
      });
    },
  },

  riskPredictions: {
    list: async () => {
      return apiRequest<RiskPrediction[]>('/api/risk-predictions');
    },
    create: async (prediction: {
      risk_level: string;
      risk_score: number;
      factors: string[];
      recommendations: string[];
      summary: string;
    }) => {
      return apiRequest<RiskPrediction>('/api/risk-predictions', {
        method: 'POST',
        body: JSON.stringify(prediction),
      });
    },
  },

  health: async () => {
    return apiRequest<{ status: string; database: string }>('/api/health');
  },
};
