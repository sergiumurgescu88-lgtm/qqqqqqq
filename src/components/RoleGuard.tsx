import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'motion/react';
import { ShieldAlert, UserCog } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is active/configured
  const activeRoles = ['ssm-specialist', 'site-manager', 'project-manager', 'manager', 'hr'];
  const isRoleActive = activeRoles.includes(user.role);

  if (!isRoleActive) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border-2 border-secondary p-8 text-center shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]"
        >
          <div className="bg-amber-100 text-amber-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCog size={32} />
          </div>
          <h2 className="text-2xl font-bold text-secondary mb-4">Acces Restricționat</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Rolul tău (<span className="font-mono font-bold text-primary">{user.role}</span>) nu este încă activ în Academie.
          </p>
          <div className="bg-gray-50 border-l-4 border-primary p-4 text-left mb-6">
            <p className="text-xs text-gray-500 italic">
              "Fiecare drum are timpul său. Contactează HR sau Managerul tău direct pentru suport în activarea parcursului de învățare."
            </p>
          </div>
          <button 
            onClick={() => window.location.href = 'mailto:hr@waldevar.ro'}
            className="w-full bg-secondary text-white py-3 font-bold hover:bg-primary transition-colors flex items-center justify-center gap-2"
          >
            CONTACTEAZĂ HR
          </button>
        </motion.div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
