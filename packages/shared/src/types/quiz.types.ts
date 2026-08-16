/**
 * 📝 THAI AKHA KITCHEN - QUIZ ENGINE TYPES
 * Shared types for the quiz system.
 */
import type { NodeBlock } from '../data/cherry/chatFlowData';

/** Modello di gioco della domanda. `single` = testo (default). `photo_*` = griglia foto. */
export type QuizQuestionType = 'single' | 'photo_single' | 'photo_order' | 'photo_multi';

/**
 * Opzione normalizzata. Testo legacy → `{ label }`. Foto → `{ label, assetId }`
 * (l'URL si risolve nel front via media_assets, mai URL diretto in DB).
 */
export interface QuizOption {
  label: string;
  assetId?: string;   // media_assets.asset_id (solo photo_*)
  imageUrl?: string;  // risolto a runtime nel front
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  /** Identità (label) della risposta corretta — usata da `single` e `photo_single`. */
  correctAnswer: string;
  /** Modello di gioco; default 'single'. */
  questionType: QuizQuestionType;
  /** Foto hero della domanda (1:1), risolta da `image_asset_id`. Vale per tutti i tipi. */
  imageUrl?: string | null;
  /** Per `photo_order` (sequenza) / `photo_multi` (insieme): indici corretti. */
  correctIndices?: number[] | null;
  explanation: string;
  points: number; // XP earned for correct answer (default 10, from quiz_questions.points)
  /**
   * Quiz Hint Preset (T6) — testo+media scritti a mano lato DB, iniettati come
   * preset zero-latency dal tasto "Request Hint" (no AI). Spoiler-free.
   */
  hintPrompt?: string | null;   // bolla-utente al click (es. "A clue please kha 🙏")
  hintResponse?: string | null; // risposta preset Cherry (markdown-lite, "Kha! 🙏 …")
  hintBlocks?: NodeBlock[] | null; // foto/audio opzionali in coda (kind: gallery|audio)
  /**
   * Reveal explanation per risposta SBAGLIATA (T8) — supporto + nudge spoiler-free
   * (non nomina la risposta corretta), markdown-lite. `explanation` resta il reveal
   * per la risposta CORRETTA (congratulazioni + perché).
   */
  explanationWrong?: string | null;
}

export interface QuizModule {
  id: string;
  title: string;
  icon: string;
  theme: string;
  image_url?: string | null;
  questions: QuizQuestion[];
  /**
   * Link "Learn more" del reveal (T8): pagina sorgente del modulo. `sourceTable`
   * ∈ {'recipes','culture_sections'} → route diversa; null = nessun link (graceful).
   */
  sourceTable?: string | null;
  sourceSlug?: string | null;
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
  display_order: number;
}
