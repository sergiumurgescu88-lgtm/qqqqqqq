import React, { useState, useEffect, useCallback } from 'react';
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
  Lightbulb
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCurrentProgress } from '../../hooks/useCurrentProgress';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateAssessmentResult, AssessmentResult, CategoryScore } from '../../lib/assessmentUtils';

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  source: string;
}

export default function Quiz() {
  const { user, completeModule, saveQuizProgress, resetQuiz } = useAuthStore();
  const progress = useCurrentProgress();
  const { moduleId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // Load questions and restore state
  useEffect(() => {
    const loadQuestions = async () => {
      if (!user || !moduleId || !progress) return;
      try {
        const response = await import(`../../data/roles/${user.role}.json`);
        const qData = response.default.assessment || [];
        setQuestions(qData);
        
        // Restore progress if exists
        const savedState = progress.quizState[moduleId];
        if (savedState) {
          setCurrentIdx(savedState.currentIdx);
          setAnswers(savedState.answers);
          // If the current index has an answer, it means it was submitted
          if (savedState.answers[savedState.currentIdx] !== null) {
            setIsAnswered(true);
          }
        } else {
          setAnswers(new Array(qData.length).fill(null));
        }
      } catch (error) {
        console.error("Failed to load assessment data", error);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [user, moduleId, progress]);

  // Save progress whenever it changes
  useEffect(() => {
    if (moduleId && questions.length > 0) {
      saveQuizProgress(moduleId, currentIdx, answers);
    }
  }, [currentIdx, answers, moduleId, questions.length]);

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = idx;
    setAnswers(newAnswers);
  };

  const handleConfirm = () => {
    if (answers[currentIdx] === null) return;
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(c => c + 1);
      setIsAnswered(answers[currentIdx + 1] !== null);
    } else {
      const result = calculateAssessmentResult(questions, answers);
      setAssessmentResult(result);
      setShowResults(true);
    }
  };

  const handleFinish = () => {
    if (assessmentResult && moduleId) {
      // Instead of finishing, transition to scenarios
      navigate(`/training/${moduleId}/scenarios`);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResults || loading) return;
      
      if (!isAnswered) {
        if (e.key >= '1' && e.key <= '4') {
          handleOptionSelect(parseInt(e.key) - 1);
        }
        if (e.key === 'Enter' && answers[currentIdx] !== null) {
          handleConfirm();
        }
      } else {
        if (e.key === 'Enter' || e.key === 'ArrowRight') {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, answers, currentIdx, showResults, loading]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Pregătim evaluarea...</p>
    </div>
  );

  if (questions.length === 0) return <div className="p-20 text-center">Nu există întrebări configurate pentru acest rol.</div>;

  if (showResults && assessmentResult) {
    const isPassed = assessmentResult.percentage >= 80;

    if (showReview) {
      return (
        <div className="max-w-3xl mx-auto p-6 py-12">
          <button 
            onClick={() => setShowReview(false)}
            className="flex items-center gap-2 text-primary font-bold mb-8 hover:underline"
          >
            <ChevronLeft size={20} /> Înapoi la Rezultate
          </button>
          
          <h2 className="text-3xl font-bold mb-8 text-secondary font-serif italic">Recenzia Evaluării</h2>
          
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === q.correctAnswer;
              
              return (
                <div key={q.id} className={`p-6 rounded-2xl border-2 transition-all ${isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Întrebarea {idx + 1} • {q.category}</span>
                    {isCorrect ? <CheckCircle2 className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
                  </div>
                  <h3 className="font-bold text-secondary mb-4 leading-tight">{q.question}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Răspunsul tău:</span>{' '}
                      <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {userAns !== null ? q.options[userAns] : 'Niciunul'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="text-sm">
                        <span className="text-gray-500">Răspunsul corect:</span>{' '}
                        <span className="text-green-700 font-medium">{q.options[q.correctAnswer]}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
                    <div className="flex gap-2 items-start">
                      <AlertCircle size={16} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="mb-2">{q.explanation}</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Sursă: {q.source}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12">
            <button 
              onClick={handleFinish}
              className="w-full bg-secondary text-white py-5 rounded-2xl font-bold text-lg hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              Finalizează Evaluarea <ArrowRight size={20} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-6 py-12">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Hero Result Section */}
          <div className={`p-12 text-center text-white ${isPassed ? 'bg-primary' : 'bg-secondary'}`}>
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              {isPassed ? <Trophy size={48} /> : <RotateCcw size={48} />}
            </div>
            <h2 className="text-4xl font-bold mb-2 font-serif italic">
              Nivel: {assessmentResult.competenceLevel}
            </h2>
            <div className="text-8xl font-black mb-4">{assessmentResult.percentage}%</div>
            <p className="text-white/80 max-w-md mx-auto text-lg">
              {isPassed 
                ? "Excelent! Ai demonstrat că ești un pilon de bază pentru standardele Waldevar."
                : "Siguranța nu permite compromisuri. Hai să vedem unde putem îmbunătăți."}
            </p>
          </div>

          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12">
            {/* Category Breakdown */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Target className="text-primary" size={20} />
                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Analiză pe Categorii</h3>
              </div>
              <div className="space-y-6">
                {Object.values(assessmentResult.categoryScores).map((cat: CategoryScore) => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-secondary capitalize">{cat.category}</span>
                      <span className="text-gray-400">{cat.correct}/{cat.total} corecte</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        className={`h-full ${cat.percentage >= 70 ? 'bg-green-500' : 'bg-red-400'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="text-primary" size={20} />
                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Recomandări de Creștere</h3>
              </div>
              <div className="space-y-4">
                {assessmentResult.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <p className="text-sm text-gray-600 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowReview(true)}
              className="flex-1 bg-white text-secondary py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-200"
            >
              <BookOpen size={20} /> Revizuiește Răspunsurile
            </button>
            <button 
              onClick={handleFinish}
              className={`flex-1 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-xl ${
                isPassed ? "bg-primary text-white hover:bg-primary-dark" : "bg-secondary text-white hover:bg-primary"
              }`}
            >
              {isPassed ? "Treci la Scenarii Aplicate" : "Încearcă din Nou"} <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progressPercent = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6 py-12">
      {/* Progress Header */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Evaluare Competență</h1>
            <p className="text-2xl font-bold text-secondary">Întrebarea {currentIdx + 1} <span className="text-gray-300 font-normal">din {questions.length}</span></p>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Progres</div>
            <div className="text-xl font-black text-primary">{Math.round(progressPercent)}%</div>
          </div>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 min-h-[500px] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <HelpCircle size={120} />
        </div>
        
        <div className="relative z-10 flex-grow">
          <div className="flex items-center gap-2 mb-8">
            <span className="bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {currentQuestion.category}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-12 leading-tight">
            {currentQuestion.question}
          </h2>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentIdx] === idx;
              let state = "default";
              
              if (isAnswered) {
                if (idx === currentQuestion.correctAnswer) state = "correct";
                else if (isSelected) state = "wrong";
                else state = "dimmed";
              } else if (isSelected) {
                state = "selected";
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(idx)}
                  aria-label={`Opțiunea ${idx + 1}: ${option}`}
                  className={`group w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 relative ${
                    state === "correct" ? "border-green-500 bg-green-50 text-green-900" :
                    state === "wrong" ? "border-red-500 bg-red-50 text-red-900" :
                    state === "selected" ? "border-primary bg-green-50/30 text-secondary shadow-md" :
                    state === "dimmed" ? "border-gray-50 opacity-40" :
                    "border-gray-100 hover:border-primary/30 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                      state === "selected" || state === "correct" || state === "wrong"
                        ? "bg-white border-transparent text-primary"
                        : "border-gray-200 text-gray-400 group-hover:border-primary/50"
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="text-lg font-medium leading-snug">{option}</span>
                  </div>
                  {state === "correct" && <CheckCircle2 size={24} className="shrink-0" />}
                  {state === "wrong" && <XCircle size={24} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Section (Immediate but subtle) */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-10 pt-8 border-t border-gray-100"
            >
              <div className="flex gap-4 items-start bg-gray-50 p-6 rounded-2xl">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">Confirmare Standard</p>
                  <p className="text-sm text-gray-500 italic">
                    Răspunsul a fost înregistrat. Vei putea vedea explicația detaliată la finalul testului.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex gap-4">
        {currentIdx > 0 && !isAnswered && (
          <button
            onClick={() => setCurrentIdx(c => c - 1)}
            className="px-8 py-5 rounded-2xl font-bold text-secondary border-2 border-gray-100 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <ChevronLeft size={20} /> Înapoi
          </button>
        )}
        
        {!isAnswered ? (
          <button
            disabled={answers[currentIdx] === null}
            onClick={handleConfirm}
            className={`flex-grow py-5 rounded-2xl font-bold text-xl transition-all shadow-xl ${
              answers[currentIdx] !== null 
                ? "bg-primary text-white shadow-primary/20 hover:translate-y-[-2px]" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Confirmă Răspunsul
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-grow bg-secondary text-white py-5 rounded-2xl font-bold text-xl hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-2xl hover:translate-y-[-2px]"
          >
            {currentIdx < questions.length - 1 ? "Următoarea Întrebare" : "Vezi Rezultatele"} <ChevronRight size={24} />
          </button>
        )}
      </div>
      
      <p className="mt-8 text-center text-[10px] font-mono text-gray-400 uppercase tracking-[0.3em]">
        Integritatea Evaluării • Waldevar Academy
      </p>
    </div>
  );
}
