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
}

export interface QuizModule {
  id: string;
  title: string;
  icon: string;
  theme: string;
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
}
