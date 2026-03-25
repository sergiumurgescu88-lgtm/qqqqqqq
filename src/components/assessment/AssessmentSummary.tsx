import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Award, 
  Target, 
  Zap, 
  Shield, 
  BookOpen, 
  Download, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Calendar,
  User as UserIcon,
  Briefcase
} from 'lucide-react';
import { AssessmentResult, CompetenceLevel } from '../../lib/assessmentUtils';
import { useNavigate } from 'react-router-dom';

interface AssessmentSummaryProps {
  result: AssessmentResult;
  userName: string;
  roleName: string;
  onRetake: () => void;
  onContinue: () => void;
}

export default function AssessmentSummary({ 
  result, 
  userName, 
  roleName, 
  onRetake, 
  onContinue 
}: AssessmentSummaryProps) {
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);

  const getBadgeColor = (level: CompetenceLevel) => {
    switch (level) {
      case 'Expert': return 'bg-primary text-white shadow-primary/30';
      case 'Competent': return 'bg-green-500 text-white shadow-green-500/30';
      default: return 'bg-secondary text-white shadow-secondary/30';
    }
  };

  const getLevelIcon = (level: CompetenceLevel) => {
    switch (level) {
      case 'Expert': return <Trophy size={32} />;
      case 'Competent': return <Award size={32} />;
      default: return <Target size={32} />;
    }
  };

  const handleDownloadCertificate = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('ro-RO', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const uniqueId = `WA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return (
    <div className="max-w-5xl mx-auto p-6 py-12 space-y-12">
      {/* Header Recognition */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
          <Calendar size={14} /> {today}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary font-serif italic">
          Felicitări, {userName.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Ai finalizat cu succes evaluarea pentru rolul de <span className="font-bold text-secondary">{roleName}</span>. 
          Efortul tău de astăzi construiește viitorul energetic de mâine.
        </p>
      </motion.div>

      {/* Main Achievement Card */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Visual Score Circle */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${result.percentage}%` }}
              className={`h-full ${result.percentage >= 70 ? 'bg-primary' : 'bg-secondary'}`}
            />
          </div>
          
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-100"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={553}
                initial={{ strokeDashoffset: 553 }}
                animate={{ strokeDashoffset: 553 - (553 * result.percentage) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={result.percentage >= 70 ? 'text-primary' : 'text-secondary'}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-secondary">{result.percentage}%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scor Total</span>
            </div>
          </div>

          <div className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-xl transition-transform group-hover:scale-105 ${getBadgeColor(result.competenceLevel)}`}>
            {getLevelIcon(result.competenceLevel)}
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-widest opacity-80">Nivel Competență</div>
              <div className="text-xl">{result.competenceLevel}</div>
            </div>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-2 bg-white rounded-[3rem] p-10 md:p-12 shadow-2xl border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-10">
            <Zap className="text-primary" size={24} />
            <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Performanță pe Categorii</h3>
          </div>
          
          <div className="space-y-8">
            {Object.values(result.categoryScores).map((cat, idx) => (
              <div key={cat.category}>
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-secondary capitalize">{cat.category}</span>
                    {cat.percentage >= 90 && <CheckCircle2 size={16} className="text-primary" />}
                  </div>
                  <span className="font-mono text-sm font-bold text-gray-400">{cat.percentage}%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 1, delay: 0.6 + (idx * 0.1) }}
                    className={`h-full rounded-full ${
                      cat.percentage >= 90 ? 'bg-primary' : 
                      cat.percentage >= 70 ? 'bg-green-500' : 'bg-secondary'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recommendations & Weak Areas */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Weak Areas & Study */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-secondary/5 rounded-[2.5rem] p-10 border border-secondary/10"
        >
          <div className="flex items-center gap-3 mb-8">
            <AlertCircle className="text-secondary" size={24} />
            <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Arii de Îmbunătățit</h3>
          </div>
          
          {result.weakAreas.length > 0 ? (
            <div className="space-y-4">
              {result.weakAreas.map((area, idx) => (
                <div key={idx} className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-secondary capitalize mb-1">{area}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Necesită o revizuire a procedurilor specifice pentru a atinge standardul de aur.
                    </p>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => navigate('/training')}
                className="w-full mt-4 py-4 bg-secondary text-white rounded-2xl font-bold hover:bg-primary transition-all flex items-center justify-center gap-2"
              >
                Mergi la Materiale de Studiu <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <p className="font-bold text-secondary">Nicio arie critică identificată!</p>
              <p className="text-sm text-gray-500">Performanța ta este echilibrată și solidă.</p>
            </div>
          )}
        </motion.div>

        {/* Personalized Recommendations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-primary/5 rounded-[2.5rem] p-10 border border-primary/10"
        >
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="text-primary" size={24} />
            <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Recomandări Personalizate</h3>
          </div>
          
          <div className="space-y-4">
            {result.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Zap size={20} />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {rec}
                </p>
              </div>
            ))}
            
            {result.competenceLevel === 'Expert' && (
              <div className="mt-6 p-6 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Zap size={120} />
                </div>
                <h4 className="font-bold text-lg mb-2">Următorul Pas: AI Literacy</h4>
                <p className="text-sm text-white/80 mb-4">
                  Ești pregătit pentru viitor. Explorează cum AI poate optimiza managementul șantierului tău.
                </p>
                <button className="bg-white text-primary px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
                  Explorează Modulul AI
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Certificate Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-[3rem] p-12 shadow-2xl border border-gray-100 text-center space-y-8"
      >
        <div className="max-w-md mx-auto">
          <Shield className="text-primary mx-auto mb-4" size={48} />
          <h3 className="text-2xl font-bold text-secondary font-serif italic">Certificat de Progres</h3>
          <p className="text-gray-500 text-sm">
            O dovadă a competenței tale și a angajamentului față de excelență.
          </p>
        </div>

        {/* Hidden Printable Certificate */}
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-20">
          <div className="border-[12px] border-primary p-16 h-full flex flex-col items-center justify-center text-center space-y-10">
            <div className="flex items-center gap-4 mb-10">
              <Shield size={60} className="text-primary" />
              <div className="text-left">
                <div className="text-3xl font-black text-secondary uppercase tracking-tighter">WALDEVAR</div>
                <div className="text-primary font-bold tracking-[0.3em] text-sm">ACADEMY</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-400 uppercase tracking-[0.2em] text-sm">Certificat de Competență</p>
              <h1 className="text-6xl font-serif italic text-secondary">{userName}</h1>
            </div>

            <div className="w-24 h-1 bg-primary" />

            <p className="text-xl text-gray-600 max-w-2xl">
              A demonstrat cu succes competențele necesare pentru rolul de <br />
              <span className="font-bold text-secondary text-2xl">{roleName}</span> <br />
              obținând un scor de <span className="text-primary font-bold">{result.percentage}%</span> în cadrul evaluării integrate.
            </p>

            <div className="grid grid-cols-2 gap-20 pt-10">
              <div className="text-center">
                <div className="font-mono text-sm text-gray-400 mb-1">{today}</div>
                <div className="border-t border-gray-200 pt-2 text-xs font-bold uppercase tracking-widest">Data Emiterii</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-sm text-gray-400 mb-1">{uniqueId}</div>
                <div className="border-t border-gray-200 pt-2 text-xs font-bold uppercase tracking-widest">ID Certificat</div>
              </div>
            </div>

            <div className="pt-10 opacity-20">
              <p className="text-[10px] font-mono uppercase tracking-widest">Document generat automat de platforma Waldevar Academy</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleDownloadCertificate}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 text-secondary rounded-2xl font-bold hover:bg-gray-200 transition-all"
        >
          <Download size={20} /> Descarcă Certificatul (PDF/Print)
        </button>
      </motion.div>

      {/* Final Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8">
        <button 
          onClick={onContinue}
          className="flex-1 py-6 bg-primary text-white rounded-[2rem] font-bold text-xl shadow-2xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3"
        >
          Continuă Trainingul <ArrowRight size={24} />
        </button>
        <button 
          onClick={onRetake}
          className="flex-1 py-6 bg-secondary text-white rounded-[2rem] font-bold text-xl shadow-2xl shadow-secondary/20 hover:bg-primary transition-all flex items-center justify-center gap-3"
        >
          <RotateCcw size={24} /> Reia Evaluarea
        </button>
      </div>
    </div>
  );
}
