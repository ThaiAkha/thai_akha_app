
export interface QuizButtonConfig {
  label: string;
  icon: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export const QUIZ_BUTTONS = {
  START: { label: 'Start Quiz', icon: 'play_arrow', variant: 'primary' } as QuizButtonConfig,
  RESUME: { label: 'Resume Progress', icon: 'play_circle', variant: 'primary' } as QuizButtonConfig,
  EXPLORE: { label: 'Explore Level', icon: 'explore', variant: 'outline' } as QuizButtonConfig,
  RETAKE: { label: 'Retake', icon: 'replay', variant: 'secondary' } as QuizButtonConfig,
  MASTERY: { label: 'Mastery Achieved', icon: 'stars', variant: 'ghost' } as QuizButtonConfig,
  BACK: { label: 'Back to Missions', icon: 'arrow_back', variant: 'ghost' } as QuizButtonConfig,
  CLAIM: { label: 'Claim Rewards', icon: 'redeem', variant: 'primary' } as QuizButtonConfig,
  HOME: { label: 'Back Home', icon: 'home', variant: 'primary' } as QuizButtonConfig,
};

export const LEVEL_METADATA = [
  { id: 1, subtitle: "Origins & Traditions", icon: "temple_buddhist", gridClass: "card-1" },
  { id: 2, subtitle: "Spirits & Beliefs", icon: "vital_signs", gridClass: "card-2-sub" },
  { id: 3, subtitle: "Festivals & Rituals", icon: "groups", gridClass: "card-3" },
  { id: 4, subtitle: "Food & Foraging", icon: "home", gridClass: "card-4" },
  { id: 5, subtitle: "Clothing & Identity", icon: "accessibility_new", gridClass: "card-5" },
  { id: 6, subtitle: "Music & Oral Tradition", icon: "soup_kitchen", gridClass: "card-6" },
  { id: 7, subtitle: "Modern Era & Coffee", icon: "local_cafe", gridClass: "card-7" },
];
