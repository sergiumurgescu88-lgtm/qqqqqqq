import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  CheckCircle, 
  Users, 
  Zap, 
  ArrowRight, 
  Box, 
  Trophy, 
  ArrowDown, 
  ChevronDown, 
  ChevronUp,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCurrentProgress } from '../../hooks/useCurrentProgress';

interface Brick {
  id: string;
  label: string;
  priority: string;
  narrative: string;
  whyItMatters: string;
  value: string;
  icon: string;
}

interface TrophyData {
  label: string;
  value: string;
  description: string;
}

interface Module0Data {
  title: string;
  summary: string;
  bricks: Brick[];
  trophies: TrophyData[];
  workflow: {
    inputs: string[];
    role: string;
    outputs: string[];
  };
}

const IconMap: Record<string, any> = {
  Zap,
  Shield,
  CheckCircle,
  Box,
  Users
};

export default function Module0() {
  const { user, completeModule } = useAuthStore();
  const progress = useCurrentProgress();
  const [data, setData] = useState<Module0Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedBrick, setExpandedBrick] = useState<string | null>(null);
  const [roleInfo, setRoleInfo] = useState({ name: '', dept: '' });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const response = await import(`../../data/roles/${user.role}.json`);
        setData(response.default.module0);
        setRoleInfo({ name: response.default.roleName, dept: response.default.department });
      } catch (error) {
        console.error("Failed to load role data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-full" />
        <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Încărcăm viziunea...</p>
      </div>
    </div>
  );

  if (!data) return <div className="p-8 text-center text-red-500">Eroare la încărcarea datelor. Contactați HR.</div>;

  const isCompleted = progress.completedModules.includes('mod-0');

  return (
    <div className="min-h-screen bg-white text-secondary selection:bg-primary selection:text-white">
      {/* Header Section */}
      <header className="bg-secondary text-white pt-20 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {roleInfo.dept}
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 font-serif italic leading-tight"
          >
            {roleInfo.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl"
          >
            {data.summary}
          </motion.p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2" />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-24">
        
        {/* Bricks of Success */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-8 w-1 bg-primary" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Cărămizile Succesului Tău</h2>
          </div>
          <div className="grid gap-4">
            {data.bricks.map((brick, idx) => {
              const Icon = IconMap[brick.icon] || Zap;
              const isExpanded = expandedBrick === brick.id;
              
              return (
                <motion.div 
                  key={brick.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`border-2 transition-all cursor-pointer overflow-hidden ${
                    isExpanded ? 'border-primary bg-green-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                  onClick={() => setExpandedBrick(isExpanded ? null : brick.id)}
                >
                  <div className="p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isExpanded ? 'bg-primary text-white' : 'bg-gray-50 text-secondary'}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                            brick.priority === 'Maximă' || brick.priority === 'Critic' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {brick.priority}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {brick.value}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg">{brick.label}</h3>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-gray-300" />}
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="pl-14">
                          <p className="text-secondary font-medium mb-3 italic">"{brick.narrative}"</p>
                          <div className="bg-white border-l-4 border-primary p-4 shadow-sm">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              <span className="font-bold text-primary block mb-1 uppercase text-[10px] tracking-widest">De ce contează:</span>
                              {brick.whyItMatters}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Workflow Diagram */}
        <section className="bg-gray-50 p-10 rounded-3xl border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">Harta Ta de Navigare</h2>
            <p className="text-sm text-gray-500">Locul tău în angrenajul Waldevar</p>
          </div>
          
          <div className="flex flex-col items-center gap-8 max-w-sm mx-auto">
            {/* Inputs */}
            <div className="w-full space-y-2">
              {data.workflow.inputs.map((input, i) => (
                <div key={i} className="bg-white border border-gray-200 p-3 rounded-xl text-center text-xs font-medium shadow-sm">
                  {input}
                </div>
              ))}
            </div>
            
            <ArrowDown className="text-primary animate-bounce" />
            
            {/* The Role */}
            <div className="w-full bg-secondary text-white p-6 rounded-2xl text-center shadow-xl border-4 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Ești Aici
              </div>
              <Briefcase className="mx-auto mb-2 text-primary" size={24} />
              <div className="font-bold text-lg">{data.workflow.role}</div>
            </div>
            
            <ArrowDown className="text-primary" />
            
            {/* Outputs */}
            <div className="w-full space-y-2">
              {data.workflow.outputs.map((output, i) => (
                <div key={i} className="bg-white border border-gray-200 p-3 rounded-xl text-center text-xs font-medium shadow-sm">
                  {output}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trophies / Metrics */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-8 w-1 bg-primary" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Direcția Succesului</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.trophies.map((trophy, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white border-2 border-gray-100 p-8 rounded-2xl text-center group hover:border-primary transition-all"
              >
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                  <Trophy size={20} className="text-gray-300 group-hover:text-primary" />
                </div>
                <div className="text-2xl font-bold text-secondary mb-1">{trophy.value}</div>
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">{trophy.label}</div>
                <p className="text-xs text-gray-500 leading-tight">{trophy.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-10 pb-20 text-center">
          {!isCompleted ? (
            <button 
              onClick={() => {
                completeModule('mod-0', 100);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-primary text-white px-12 py-5 rounded-full font-bold text-xl shadow-[0_20px_50px_rgba(0,255,0,0.2)] hover:shadow-none hover:translate-y-1 transition-all flex items-center gap-3 mx-auto"
            >
              Am Înțeles Misiunea Mea <ArrowRight />
            </button>
          ) : (
            <Link 
              to="/training/mod-1"
              className="bg-secondary text-white px-12 py-5 rounded-full font-bold text-xl shadow-xl hover:bg-primary transition-all flex items-center gap-3 mx-auto w-fit"
            >
              Începe Modulul 1 <ArrowRight />
            </Link>
          )}
          <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-mono">
            Pasul 1 din 3 • Fundația Academiei Waldevar
          </p>
        </section>

      </main>
    </div>
  );
}
