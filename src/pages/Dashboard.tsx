import { motion } from 'motion/react';
import { Shield, ArrowRight, Zap, Users, BarChart, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrentProgress } from '../hooks/useCurrentProgress';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();
  const progress = useCurrentProgress();
  const navigate = useNavigate();

  const isManager = user?.role === 'manager' || user?.role === 'hr';

  if (!user || !progress) return null;

  const completionPercentage = Math.round((progress.completedModules.length / 3) * 100);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest"
        >
          Waldevar Academy • {user.role}
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-secondary leading-tight font-serif italic"
        >
          Bun venit, <span className="text-primary">{user.name.split(' ')[0]}</span>
        </motion.h1>
        <p className="text-gray-600 text-lg max-w-2xl">Platforma ta centralizată pentru training, certificări și operare în siguranță.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isManager && (
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-secondary p-10 rounded-[3rem] shadow-2xl text-white md:col-span-3 flex flex-col md:flex-row justify-between items-center gap-8 border-4 border-primary/20"
          >
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl">
                <LayoutDashboard size={40} />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2 font-serif italic">Dashboard Managerial</h3>
                <p className="text-white/70 text-lg max-w-md leading-relaxed">Monitorizează progresul echipei și identifică ariile slabe în timp real.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/manager')}
              className="w-full md:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-3"
            >
              Accesează Datele <ArrowRight size={24} />
            </button>
          </motion.div>
        )}

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-gray-100 flex flex-col h-full"
        >
          <div className="w-16 h-16 bg-green-50 text-primary rounded-2xl flex items-center justify-center mb-6">
            <Zap size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-secondary">Module Active</h3>
          <p className="text-gray-500 leading-relaxed mb-8 flex-grow">Continuă învățarea de unde ai rămas. Ai module noi pregătite pentru tine.</p>
          <button 
            onClick={() => navigate('/training')}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
          >
            Continuă Training <ArrowRight size={20} />
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-gray-100 flex flex-col h-full"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Users size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-secondary">Rolul Tău</h3>
          <p className="text-gray-500 leading-relaxed mb-8 flex-grow">Ești înregistrat ca <span className="font-bold text-secondary uppercase">{user.role}</span>. Vezi cerințele postului.</p>
          <button 
            onClick={() => navigate('/profile')}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
          >
            Vezi Profil <ArrowRight size={20} />
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-gray-100 flex flex-col h-full"
        >
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <BarChart size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-secondary">Progresul Tău</h3>
          <div className="mb-8 flex-grow">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-black text-secondary">{completionPercentage}%</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completat</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                className="h-full bg-purple-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-purple-600 font-bold">
            <CheckCircle2 size={20} />
            <span>{progress.completedModules.length} module finalizate</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
