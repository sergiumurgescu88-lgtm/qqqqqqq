import { useAuthStore } from '../store/useAuthStore';

export const useCurrentProgress = () => {
  const { user, allProgress } = useAuthStore();
  
  if (!user) return null;
  
  const key = `${user.id}:${user.role}`;
  return allProgress[key] || {
    completedModules: [],
    scores: {},
    quizState: {},
    scenarioState: {},
    weakAreas: [],
    lastUpdated: new Date().toISOString(),
  };
};
