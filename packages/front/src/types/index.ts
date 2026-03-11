/**
 * 📦 THAI AKHA KITCHEN - GLOBAL TYPE DEFINITIONS
 * Central Repository for Database Models and Shared Interfaces.
 * Version: System 4.8
 */

// --- 1. COOKING CLASSES ---
export interface CookingClassDB {
  id: string;
  title: string;
  badge: string;
  tags: string[];
  price: number;
  theme_color: string;
  duration_text: string;
  image_url: string;
  description: string;
  schedule_items: {
    label: string;
    time: string;
    description?: string;
  }[];
  highlights: string[];
  inclusions: string[];
  has_market_tour?: boolean;
}

// --- 2. RECIPE CATEGORIES ---
export interface RecipeCategoryDB {
  id: string;
  title: string;
  description: string;
  image: string;
  display_order: number;
  ui_quote?: string;
  content_body?: string;
  audio_story_url?: string;
  icon_name?: string;
  keywords?: string[];
  chef_secrets?: string[];
  cherry_context?: string;
}

// --- 3. QUIZ ENGINE (✨ NUOVO) ---
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
  image: string; // Mappato da image_url
  modules: QuizModule[];
  rewardId?: number;
  is_active?: boolean;
}

// --- 4. CHAT & AI ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  suggestions?: string[];
  isStreaming?: boolean;
}