import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

// Custom debounced storage to prevent excessive writes
const createDebouncedStorage = (storage: StateStorage, delay: number): StateStorage => {
  let timeoutId: any;
  let pendingValue: string | null = null;
  let pendingName: string | null = null;

  const flush = () => {
    if (pendingName && pendingValue !== null) {
      storage.setItem(pendingName, pendingValue);
      pendingName = null;
      pendingValue = null;
    }
  };

  // Flush on page unload to ensure data isn't lost
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flush);
  }

  return {
    getItem: (name) => storage.getItem(name),
    setItem: (name, value) => {
      pendingName = name;
      pendingValue = value;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(flush, delay);
    },
    removeItem: (name) => {
      if (timeoutId) clearTimeout(timeoutId);
      storage.removeItem(name);
    },
  };
};

export type UserRole = 'ssm-specialist' | 'site-manager' | 'project-manager' | 'manager' | 'hr' | 'guest';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface Progress {
  completedModules: string[]; // IDs of completed modules
  scores: Record<string, number>; // moduleId -> score
  quizState: Record<string, { currentIdx: number; answers: (number | null)[] }>;
  scenarioState: Record<string, { currentIdx: number; answers: (number | null)[]; markedForReview: boolean[] }>;
  weakAreas: string[]; // Categories where performance is low
  lastUpdated: string;
}

interface AuthState {
  user: User | null;
  allProgress: Record<string, Progress>; // key: `${userId}:${role}`
  setUser: (user: User | null) => void;
  completeModule: (moduleId: string, score: number, weakAreas?: string[]) => void;
  saveQuizProgress: (moduleId: string, currentIdx: number, answers: (number | null)[]) => void;
  saveScenarioProgress: (moduleId: string, currentIdx: number, answers: (number | null)[], markedForReview: boolean[]) => void;
  resetQuiz: (moduleId: string) => void;
  resetScenarios: (moduleId: string) => void;
  logout: () => void;
  exportProgress: () => void;
  importProgress: (data: string) => boolean;
  deleteMyData: () => void; // GDPR
}

const initialProgress: Progress = {
  completedModules: [],
  scores: {},
  quizState: {},
  scenarioState: {},
  weakAreas: [],
  lastUpdated: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      allProgress: {},
      
      setUser: (user) => set({ user }),

      completeModule: (moduleId, score, weakAreas = []) => set((state) => {
        if (!state.user) return state;
        const key = `${state.user.id}:${state.user.role}`;
        const currentProgress = state.allProgress[key] || { ...initialProgress };
        
        const updatedProgress: Progress = {
          ...currentProgress,
          completedModules: currentProgress.completedModules.includes(moduleId)
            ? currentProgress.completedModules
            : [...currentProgress.completedModules, moduleId],
          scores: { ...currentProgress.scores, [moduleId]: score },
          weakAreas: Array.from(new Set([...currentProgress.weakAreas, ...weakAreas])),
          lastUpdated: new Date().toISOString(),
        };

        return {
          allProgress: {
            ...state.allProgress,
            [key]: updatedProgress
          }
        };
      }),

      saveQuizProgress: (moduleId, currentIdx, answers) => set((state) => {
        if (!state.user) return state;
        const key = `${state.user.id}:${state.user.role}`;
        const currentProgress = state.allProgress[key] || { ...initialProgress };

        return {
          allProgress: {
            ...state.allProgress,
            [key]: {
              ...currentProgress,
              quizState: {
                ...currentProgress.quizState,
                [moduleId]: { currentIdx, answers }
              },
              lastUpdated: new Date().toISOString(),
            }
          }
        };
      }),

      saveScenarioProgress: (moduleId, currentIdx, answers, markedForReview) => set((state) => {
        if (!state.user) return state;
        const key = `${state.user.id}:${state.user.role}`;
        const currentProgress = state.allProgress[key] || { ...initialProgress };

        return {
          allProgress: {
            ...state.allProgress,
            [key]: {
              ...currentProgress,
              scenarioState: {
                ...currentProgress.scenarioState,
                [moduleId]: { currentIdx, answers, markedForReview }
              },
              lastUpdated: new Date().toISOString(),
            }
          }
        };
      }),

      resetQuiz: (moduleId) => set((state) => {
        if (!state.user) return state;
        const key = `${state.user.id}:${state.user.role}`;
        const currentProgress = state.allProgress[key];
        if (!currentProgress) return state;

        const newQuizState = { ...currentProgress.quizState };
        delete newQuizState[moduleId];

        return {
          allProgress: {
            ...state.allProgress,
            [key]: {
              ...currentProgress,
              quizState: newQuizState,
              lastUpdated: new Date().toISOString(),
            }
          }
        };
      }),

      resetScenarios: (moduleId) => set((state) => {
        if (!state.user) return state;
        const key = `${state.user.id}:${state.user.role}`;
        const currentProgress = state.allProgress[key];
        if (!currentProgress) return state;

        const newScenarioState = { ...currentProgress.scenarioState };
        delete newScenarioState[moduleId];

        return {
          allProgress: {
            ...state.allProgress,
            [key]: {
              ...currentProgress,
              scenarioState: newScenarioState,
              lastUpdated: new Date().toISOString(),
            }
          }
        };
      }),

      logout: () => set({ user: null }),

      exportProgress: () => {
        const data = JSON.stringify(get().allProgress, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `waldevar-academy-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      importProgress: (data) => {
        try {
          const parsed = JSON.parse(data);
          // Basic validation
          if (typeof parsed !== 'object') return false;
          set({ allProgress: parsed });
          return true;
        } catch (e) {
          console.error("Failed to import progress:", e);
          return false;
        }
      },

      deleteMyData: () => {
        const { user, allProgress } = get();
        if (!user) return;
        const newProgress = { ...allProgress };
        // Delete all progress related to this user ID (across all roles)
        Object.keys(newProgress).forEach(key => {
          if (key.startsWith(`${user.id}:`)) {
            delete newProgress[key];
          }
        });
        set({ allProgress: newProgress });
      }
    }),
    {
      name: 'waldevar-academy-auth-v2',
      storage: createJSONStorage(() => createDebouncedStorage(localStorage, 1000)),
    }
  )
);
