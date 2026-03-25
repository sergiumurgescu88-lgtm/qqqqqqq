import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const handleLogin = (role: any) => {
    setUser({
      id: 'user-123',
      name: 'Sergiu Andrei',
      role: role,
      email: 'sergiu0288@gmail.com'
    });
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border border-gray-200 p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-secondary">Waldevar Academy</h1>
          <p className="text-gray-500 text-sm">Selectează un profil pentru simulare</p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => handleLogin('ssm-specialist')}
            className="w-full p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-green-50 transition-all text-left flex justify-between items-center group"
          >
            <div>
              <p className="font-bold text-secondary">Specialist SSM</p>
              <p className="text-xs text-gray-500 italic">Rol Configurat (Module 0-2)</p>
            </div>
            <LogIn size={18} className="text-gray-300 group-hover:text-primary" />
          </button>

          <button 
            onClick={() => handleLogin('site-manager')}
            className="w-full p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-green-50 transition-all text-left flex justify-between items-center group"
          >
            <div>
              <p className="font-bold text-secondary">Site Manager</p>
              <p className="text-xs text-gray-500 italic">Rol Configurat (Module 0-2)</p>
            </div>
            <LogIn size={18} className="text-gray-300 group-hover:text-primary" />
          </button>

          <button 
            onClick={() => handleLogin('manager')}
            className="w-full p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-blue-50 transition-all text-left flex justify-between items-center group"
          >
            <div>
              <p className="font-bold text-secondary">Manager / Team Lead</p>
              <p className="text-xs text-gray-500 italic">Dashboard Management</p>
            </div>
            <LogIn size={18} className="text-gray-300 group-hover:text-primary" />
          </button>

          <button 
            onClick={() => handleLogin('hr')}
            className="w-full p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-purple-50 transition-all text-left flex justify-between items-center group"
          >
            <div>
              <p className="font-bold text-secondary">HR Specialist</p>
              <p className="text-xs text-gray-500 italic">Dashboard HR</p>
            </div>
            <LogIn size={18} className="text-gray-300 group-hover:text-primary" />
          </button>

          <button 
            onClick={() => handleLogin('architect')}
            className="w-full p-4 border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-left flex justify-between items-center group opacity-60"
          >
            <div>
              <p className="font-bold text-secondary">Arhitect</p>
              <p className="text-xs text-gray-500 italic">Rol Neconfigurat</p>
            </div>
            <LogIn size={18} className="text-gray-300" />
          </button>
        </div>

        <p className="mt-8 text-[10px] text-center text-gray-400 uppercase tracking-widest font-mono">
          Sistem de Autentificare Securizat Waldevar
        </p>
      </motion.div>
    </div>
  );
}
