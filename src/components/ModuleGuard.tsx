import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrentProgress } from '../hooks/useCurrentProgress';

interface ModuleGuardProps {
  children: React.ReactNode;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({ children }) => {
  const progress = useCurrentProgress();
  const { moduleId } = useParams<{ moduleId: string }>();

  if (!moduleId || !progress) return <>{children}</>;

  // Logic: To access Module N, Module N-1 must be in completedModules
  // mod-0 is always accessible
  if (moduleId === 'mod-0') return <>{children}</>;

  const moduleIndex = parseInt(moduleId.split('-')[1]);
  const previousModuleId = `mod-${moduleIndex - 1}`;

  const isPreviousCompleted = progress.completedModules.includes(previousModuleId);

  if (!isPreviousCompleted) {
    return <Navigate to={`/training/${previousModuleId}`} replace />;
  }

  return <>{children}</>;
};
