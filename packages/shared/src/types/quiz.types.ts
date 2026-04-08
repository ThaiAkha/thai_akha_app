/**
 * 📝 THAI AKHA KITCHEN - QUIZ ENGINE TYPES
 * Shared types for the quiz system.
 */

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number; // XP earned for correct answer (default 10, from quiz_questions.points)
}

export interface QuizModule {
  id: string;
  title: string;
  icon: string;
  theme: string;
  image_url?: string | null;
  questions: QuizQuestion[];
}

export interface QuizLevel {
  id: number;
  title: string;
  subtitle: string;
  image: string; // Mapped from image_url
  modules: QuizModule[];
  rewardId?: number;
  is_active?: boolean;
  completion_bonus: number; // Bonus XP for completing all modules in level (from quiz_levels.completion_bonus)
}
