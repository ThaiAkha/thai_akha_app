/**
 * Palette themes for AkhaPixelPattern (kept out of the component file so
 * react-refresh only sees a component export there).
 */
export type AkhaTheme = 'akha' | 'history' | 'kitchen' | 'news' | 'block_faq' | 'quiz' | 'cherry' | 'ingredients';
export type AnimationType = 'linear' | 'center-out' | 'sides-in' | 'random' | 'matrix';

export const AKHA_THEMES: Record<AkhaTheme, Record<number, string>> = {
  akha: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-primary)]',      // Rosso Brand
    2: 'bg-[var(--color-muted)]',        // Grigio/Bianco Neutrale
    3: 'bg-[var(--color-action)]',       // Verde Action
    4: 'bg-[var(--color-title)]',        // Dettaglio scuro
  },
  history: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-sunset-3)]',     // History Sunset — Red #d8392a
    2: 'bg-[var(--color-sunset-1)]',     // Gold #f2c24b
    3: 'bg-[var(--color-sunset-4)]',     // Magenta #b83a6e
    4: 'bg-[var(--color-sunset-6)]',     // Aubergine #4a2a5e
  },
  cherry: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-cherry-ai)]',       // Cherry AI — Cherry #E11B3C
    2: 'bg-[var(--color-cherry-ai-teal)]',  // Turquoise #45C3CD
    3: 'bg-[var(--color-cherry-ai-rose)]',  // Rose #EF4E71
    4: 'bg-[var(--color-cherry-ai-deep)]',  // Deep Teal #103F47
  },
  kitchen: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-recipe-5)]',     // Recipe Akha — Orange #dd6000
    2: 'bg-[var(--color-recipe-2)]',     // Green #99d973
    3: 'bg-[var(--color-recipe-3)]',     // Yellow #fae50d
    4: 'bg-[var(--color-recipe-6)]',     // Red #ca1f34
  },
  news: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-ice-4)]',        // News Ice — #2699a1
    2: 'bg-[var(--color-ice-2)]',        // #6ed6dd
    3: 'bg-[var(--color-ice-3)]',        // #39c6d0
    4: 'bg-[var(--color-ice-5)]',        // #19666b
  },
  block_faq: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-ocean-blue)]',   // Ocean Blue #0396c7
    2: 'bg-[var(--color-deep-blue)]',    // Deep Blue #016ca5
    3: 'bg-[var(--color-light-blue)]',   // Light Blue #90e0ef
    4: 'bg-white',                       // Bianco (accento/sparkle)
  },
  quiz: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-quiz-p)]',       // Quiz Set — Magenta #9b3357
    2: 'bg-[var(--color-quiz-3)]',       // Quiz Set — Gold #f7cb1b
    3: 'bg-[var(--color-quiz-1)]',       // Quiz Set — Green #7db23e
    4: 'bg-[var(--color-quiz-4)]',       // Quiz Set — Orange #e78b2e
  },
  ingredients: {
    0: 'bg-transparent',
    1: 'bg-[var(--color-pantry-4)]',     // Ingredients Pantry — Paprika #c25a2e (primary)
    2: 'bg-[var(--color-pantry-3)]',     // Galangal #d98e3c
    3: 'bg-[var(--color-pantry-1)]',     // Lemongrass #8fa05a (fresh)
    4: 'bg-[var(--color-pantry-6)]',     // Cinnamon #3e2a1e (deep)
  }
};
