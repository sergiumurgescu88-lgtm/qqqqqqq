import { motion } from 'motion/react';
import { BookOpen, CheckCircle, Lock, ArrowRight, Info } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrentProgress } from '../hooks/useCurrentProgress';
import { Link } from 'react-router-dom';

export default function Training() {
  const { user } = useAuthStore();
  const progress = useCurrentProgress();

  if (!user || !progress) return null;

  const modules = [
    { id: 'mod-0', title: 'Misiunea și Impactul Tău', description: 'De ce contează munca ta la Waldevar Energy.' },
    { id: 'mod-1', title: 'Proceduri și Standarde', description: 'Cum operăm conform standardelor de aur.' },
    { id: 'mod-2', title: 'Scenarii și Operare', description: 'Aplicarea cunoștințelor în situații reale.' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Academia Waldevar</h1>
          <p className="text-gray-500">Parcursul tău de învățare pentru rolul de <span className="text-primary font-bold uppercase">{user.role}</span></p>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 max-w-md">
          <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-blue-700 leading-relaxed">
            Progresul tău este salvat automat pe acest dispozitiv. Pentru backup sau transfer, folosește funcția <strong>Export</strong> din profil.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {modules.map((mod, idx) => {
          const isCompleted = progress.completedModules.includes(mod.id);
          const isLocked = idx > 0 && !progress.completedModules.includes(modules[idx - 1].id);

          return (
            <motion.div 
              key={mod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white p-6 rounded-2xl border-2 transition-all ${
                isLocked ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:border-primary shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCompleted ? 'bg-green-100 text-green-600' : isLocked ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'
                  }`}>
                    {isCompleted ? <CheckCircle size={24} /> : isLocked ? <Lock size={24} /> : <BookOpen size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-secondary">{mod.title}</h3>
                    <p className="text-sm text-gray-500">{mod.description}</p>
                  </div>
                </div>
                
                {!isLocked ? (
                  <Link 
                    to={`/training/${mod.id}`}
                    className={`px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
                      isCompleted ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {isCompleted ? 'Re-vizitează' : 'Începe'} <ArrowRight size={16} />
                  </Link>
                ) : (
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    Blocat
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
