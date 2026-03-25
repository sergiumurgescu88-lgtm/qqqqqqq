import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck,
  RotateCcw,
  Trophy,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Target,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  Info
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCurrentProgress } from '../../hooks/useCurrentProgress';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateAssessmentResult, AssessmentResult, CategoryScore, combineAssessmentResults } from '../../lib/assessmentUtils';
import AssessmentSummary from './AssessmentSummary';

interface Scenario {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  source: string;
}

export default function Scenarios() {
  const { user, completeModule, saveScenarioProgress, resetScenarios, resetQuiz } = useAuthStore();
  const progress = useCurrentProgress();
  const { moduleId } = useParams();
  const navigate = useNavigate();
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [roleName, setRoleName] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [markedForReview, setMarkedForReview] = useState<boolean[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // Load data and restore state
  useEffect(() => {
    const loadData = async () => {
      if (!user || !moduleId || !progress) return;
      try {
        const response = await import(`../../data/roles/${user.role}.json`);
        const allQuestions = response.default.assessment || [];
        setRoleName(response.default.roleName || user.role);
        
        const scenarioData = allQuestions.filter((q: any) => q.category === 'scenarios');
        const theoreticalData = allQuestions.filter((q: any) => q.category !== 'scenarios');
        
        setScenarios(scenarioData);
        setQuizQuestions(theoreticalData);
        
        // Restore progress if exists
        const savedState = progress.scenarioState[moduleId];
        if (savedState) {
          setCurrentIdx(savedState.currentIdx);
          setAnswers(savedState.answers);
          setMarkedForReview(savedState.markedForReview);
          if (savedState.answers[savedState.currentIdx] !== null) {
            setIsAnswered(true);
          }
        } else {
          setAnswers(new Array(scenarioData.length).fill(null));
          setMarkedForReview(new Array(scenarioData.length).fill(false));
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, moduleId, progress]);

  // Save progress whenever it changes
  useEffect(() => {
    if (moduleId && scenarios.length > 0) {
      saveScenarioProgress(moduleId, currentIdx, answers, markedForReview);
    }
  }, [currentIdx, answers, markedForReview, moduleId, scenarios.length]);

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = idx;
    setAnswers(newAnswers);
  };

  const toggleReview = () => {
    const newMarked = [...markedForReview];
    newMarked[currentIdx] = !newMarked[currentIdx];
    setMarkedForReview(newMarked);
  };

  const handleConfirm = () => {
    if (answers[currentIdx] === null) return;
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIdx < scenarios.length - 1) {
      setCurrentIdx(c => c + 1);
      setIsAnswered(answers[currentIdx + 1] !== null);
    } else {
      // Calculate Combined Result
      const quizAnswers = progress?.quizState[moduleId!]?.answers || [];
      const quizResult = calculateAssessmentResult(quizQuestions, quizAnswers, 1);
      const scenarioResult = calculateAssessmentResult(scenarios, answers, 2);
      
      const combined = combineAssessmentResults(quizResult, scenarioResult);
      setAssessmentResult(combined);
      setShowResults(true);
    }
  };

  const handleFinish = () => {
    if (assessmentResult && moduleId) {
      completeModule(moduleId, assessmentResult.percentage, assessmentResult.weakAreas);
      
      if (assessmentResult.percentage >= 80) {
        resetScenarios(moduleId);
        resetQuiz(moduleId);
      }
    }
    navigate('/training');
  };

  const handleRetake = () => {
    if (moduleId) {
      resetScenarios(moduleId);
      resetQuiz(moduleId);
      navigate(`/training/${moduleId}`);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Pregătim scenariile aplicate...</p>
    </div>
  );

  if (scenarios.length === 0) return <div className="p-20 text-center">Nu există scenarii configurate pentru acest rol.</div>;

  if (showResults && assessmentResult && user) {
    return (
      <AssessmentSummary 
        result={assessmentResult}
        userName={user.name}
        roleName={roleName}
        onRetake={handleRetake}
        onContinue={handleFinish}
      />
    );
  }

  const currentScenario = scenarios[currentIdx];
  const progressPercent = ((currentIdx + 1) / scenarios.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6 py-12">
      {/* Progress Header */}
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            {currentIdx + 1}
          </div>
          <div>
            <h1 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scenariu Aplicat</h1>
            <p className="text-xl font-bold text-secondary">Evaluare Decizională</p>
          </div>
        </div>
        <button 
          onClick={toggleReview}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            markedForReview[currentIdx] 
              ? "bg-primary text-white shadow-lg shadow-primary/20" 
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          {markedForReview[currentIdx] ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {markedForReview[currentIdx] ? "Marcat pentru Revizuire" : "Marchează pentru Revizuire"}
        </button>
      </div>

      {/* Scenario Card */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
        {/* Scenario Context - The "Book" feel */}
        <div className="bg-secondary p-10 md:p-14 text-white relative">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <BookOpen size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                {currentScenario.difficulty}
              </span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                {currentScenario.category}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif italic leading-tight">
              {currentScenario.question.split('?')[0]}?
            </h2>
            <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
              <Info size={24} className="text-primary shrink-0 mt-1" />
              <p className="text-white/80 leading-relaxed italic">
                Analizează contextul cu atenție. Decizia ta trebuie să reflecte standardele de aur Waldevar.
              </p>
            </div>
          </div>
        </div>

        {/* Options Section */}
        <div className="p-10 md:p-14 flex-grow bg-white">
          <div className="grid gap-4">
            {currentScenario.options.map((option, idx) => {
              const isSelected = answers[currentIdx] === idx;
              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(idx)}
                  className={`group w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-6 ${
                    isSelected 
                      ? "border-primary bg-primary/5 text-secondary shadow-md" 
                      : "border-gray-100 hover:border-primary/30 hover:bg-gray-50 text-gray-700"
                  } ${isAnswered && !isSelected ? "opacity-40" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border-2 transition-colors ${
                    isSelected 
                      ? "bg-primary border-transparent text-white" 
                      : "border-gray-200 text-gray-400 group-hover:border-primary/50"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-lg font-medium leading-snug">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation - Shown after answer but correctness hidden */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-12 pt-10 border-t border-gray-100"
              >
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-primary" size={24} />
                    <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Justificare Procedurală</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6 text-lg italic">
                    "{currentScenario.explanation}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Sursă: {currentScenario.source}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Corectitudinea va fi revelată la final</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-12 flex items-center justify-between">
        <div className="flex gap-2">
          {scenarios.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIdx ? "w-8 bg-primary" : 
                answers[idx] !== null ? "w-4 bg-secondary" : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>
        
        <div className="flex gap-4">
          {!isAnswered ? (
            <button
              disabled={answers[currentIdx] === null}
              onClick={handleConfirm}
              className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${
                answers[currentIdx] !== null 
                  ? "bg-primary text-white shadow-primary/20 hover:translate-y-[-2px]" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirmă Decizia
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-10 py-4 bg-secondary text-white rounded-2xl font-bold text-lg hover:bg-primary transition-all flex items-center gap-3 shadow-2xl hover:translate-y-[-2px]"
            >
              {currentIdx < scenarios.length - 1 ? "Următorul Scenariu" : "Vezi Rezultatele"} <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
