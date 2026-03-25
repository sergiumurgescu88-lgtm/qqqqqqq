/**
 * Assessment Utilities for Waldevar Academy
 * 
 * This module transforms raw quiz answers into meaningful insights,
 * identifying strengths, weak areas, and providing growth-oriented recommendations.
 */

export type CompetenceLevel = 'Expert' | 'Competent' | 'Needs Development';

export interface CategoryScore {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface AssessmentResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  competenceLevel: CompetenceLevel;
  categoryScores: Record<string, CategoryScore>;
  weakAreas: string[];
  recommendations: string[];
  totalPoints?: number;
}

interface Question {
  id: string;
  category: string;
  correctAnswer: number;
}

/**
 * Calculates the full assessment result based on user answers.
 * Supports weighted scoring (e.g., 2 points for scenarios).
 */
export function calculateAssessmentResult(
  questions: Question[],
  answers: (number | null)[],
  pointValue: number = 1
): AssessmentResult {
  let score = 0;
  const categoryMap: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q, idx) => {
    const userAns = answers[idx];
    const isCorrect = userAns === q.correctAnswer;

    if (isCorrect) score += pointValue;

    if (!categoryMap[q.category]) {
      categoryMap[q.category] = { correct: 0, total: 0 };
    }
    categoryMap[q.category].total += pointValue;
    if (isCorrect) categoryMap[q.category].correct += pointValue;
  });

  const totalPoints = questions.length * pointValue;
  const percentage = Math.round((score / totalPoints) * 100);
  const competenceLevel = getCompetenceLevel(percentage);

  const categoryScores: Record<string, CategoryScore> = {};
  const weakAreas: string[] = [];

  Object.entries(categoryMap).forEach(([cat, data]) => {
    const catPercentage = Math.round((data.correct / data.total) * 100);
    categoryScores[cat] = {
      category: cat,
      correct: data.correct,
      total: data.total,
      percentage: catPercentage,
    };

    if (catPercentage < 70) {
      weakAreas.push(cat);
    }
  });

  const result: AssessmentResult = {
    score,
    totalQuestions: questions.length,
    percentage,
    competenceLevel,
    categoryScores,
    weakAreas,
    recommendations: [],
    totalPoints,
  };

  result.recommendations = generateRecommendations(result);

  return result;
}

/**
 * Determines the competence level based on the overall percentage.
 */
function getCompetenceLevel(percentage: number): CompetenceLevel {
  if (percentage >= 90) return 'Expert';
  if (percentage >= 70) return 'Competent';
  return 'Needs Development';
}

/**
 * Generates personalized recommendations based on the assessment outcome.
 */
function generateRecommendations(result: AssessmentResult): string[] {
  const recs: string[] = [];

  // Level-based general feedback
  switch (result.competenceLevel) {
    case 'Expert':
      recs.push("Felicitări! Stăpânești standardele de aur Waldevar la un nivel de excelență.");
      recs.push("Ești pregătit să explorezi modulele avansate de specializare.");
      break;
    case 'Competent':
      recs.push("Ai o bază solidă de cunoștințe. Cu puțină atenție la detalii, vei atinge nivelul de expert.");
      recs.push("Continuă să aplici aceste principii în activitatea ta zilnică.");
      break;
    case 'Needs Development':
      recs.push("Siguranța și calitatea necesită o înțelegere mai profundă a procedurilor.");
      recs.push("Nu te descuraja! Această evaluare este punctul tău de plecare pentru a crește profesional.");
      break;
  }

  // Category-specific feedback for weak areas
  result.weakAreas.forEach(area => {
    switch (area) {
      case 'responsibilities':
        recs.push("Revizuiește fișa postului pentru a clarifica limitele de autoritate și rolul tău în echipă.");
        break;
      case 'procedures':
        recs.push("Acordă o atenție sporită procedurilor de lucru (SOP). Ele sunt scutul tău împotriva erorilor.");
        break;
      case 'requirements':
        recs.push("Asigură-te că înțelegi cerințele de conformitate și certificările necesare pentru siguranța tehnică.");
        break;
      case 'scenarios':
        recs.push("Exersează luarea deciziilor în situații critice. Gândește-te mereu: 'Siguranța pe primul loc'.");
        break;
    }
  });

  return recs;
}

/**
 * Combines quiz and scenario results into a single competence profile.
 */
export function combineAssessmentResults(
  quizResult: AssessmentResult,
  scenarioResult: AssessmentResult
): AssessmentResult {
  const totalScore = quizResult.score + scenarioResult.score;
  const totalPoints = (quizResult.totalPoints || quizResult.totalQuestions) + (scenarioResult.totalPoints || scenarioResult.totalQuestions);
  const percentage = Math.round((totalScore / totalPoints) * 100);
  
  const combinedCategoryScores = { ...quizResult.categoryScores };
  Object.values(scenarioResult.categoryScores).forEach(cat => {
    if (combinedCategoryScores[cat.category]) {
      combinedCategoryScores[cat.category].correct += cat.correct;
      combinedCategoryScores[cat.category].total += cat.total;
      combinedCategoryScores[cat.category].percentage = Math.round(
        (combinedCategoryScores[cat.category].correct / combinedCategoryScores[cat.category].total) * 100
      );
    } else {
      combinedCategoryScores[cat.category] = { ...cat };
    }
  });

  const weakAreas = Object.values(combinedCategoryScores)
    .filter(cat => cat.percentage < 70)
    .map(cat => cat.category);

  const result: AssessmentResult = {
    score: totalScore,
    totalQuestions: quizResult.totalQuestions + scenarioResult.totalQuestions,
    percentage,
    competenceLevel: getCompetenceLevel(percentage),
    categoryScores: combinedCategoryScores,
    weakAreas,
    recommendations: [],
    totalPoints,
  };

  result.recommendations = generateRecommendations(result);
  return result;
}
