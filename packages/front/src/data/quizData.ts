
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizModule {
  id: string;
  title: string;
  weight: number;
  questions: Question[];
}

export interface GameLevel {
  id: number;
  title: string;
  image: string;
  modules: QuizModule[];
  reward_mp3?: string;
  reward_title?: string;
}

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
  { id: 1, subtitle: "Origins & Traditions", icon: "temple_buddhist", color: "from-primary/20" },
  { id: 2, subtitle: "Spirits & Beliefs", icon: "vital_signs", color: "from-blue-500/20" },
  { id: 3, subtitle: "Festivals & Rituals", icon: "groups", color: "from-emerald-500/20" },
  { id: 4, subtitle: "Food & Foraging", icon: "home", color: "from-orange-500/20" },
  { id: 5, subtitle: "Clothing & Identity", icon: "accessibility_new", color: "from-purple-500/20" },
  { id: 6, subtitle: "Music & Oral Lore", icon: "soup_kitchen", color: "from-pink-500/20" },
  { id: 7, subtitle: "Modern Era & Coffee", icon: "local_cafe", color: "from-amber-500/20" },
];

export const QUIZ_DATA: GameLevel[] = [
  {
    id: 1,
    title: "Origins & Migration",
    image: "https://www.thaiakhakitchen.com/wp-content/uploads/2026/01/Akha01.jpg",
    reward_title: "Akha Lady in the Mountain",
    reward_mp3: "/music/akha-lady-in-the-mountain.mp3",
    modules: [
      {
        id: "L1-M1", title: "The Tibetan Plateau", weight: 25,
        questions: [
          { id: "q1", text: "From which high-altitude region do Akha ancestors originate?", options: ["Tibetan Plateau", "Gobi Desert", "Mekong Delta"], correctAnswer: "Tibetan Plateau" },
          { id: "q2", text: "Which language family does Akha belong to?", options: ["Sino-Tibetan", "Austroasiatic", "Tai-Kadai"], correctAnswer: "Sino-Tibetan" }
        ]
      },
      { id: "L1-M2", title: "Yunnan Crossroads", weight: 25, questions: [{ id: "q8", text: "Which Chinese province was a major stop in migration?", options: ["Yunnan", "Sichuan", "Guangdong"], correctAnswer: "Yunnan" }] },
      { id: "L1-M3", title: "Thailand Settlement", weight: 50, questions: [{ id: "q15", text: "In which Thai province are most Akha located?", options: ["Chiang Rai", "Phuket", "Bangkok"], correctAnswer: "Chiang Rai" }] }
    ]
  },
  {
    id: 2,
    title: "Spirits & Beliefs",
    image: "https://www.thaiakhakitchen.com/wp-content/uploads/2022/05/Kitchen-05.jpg",
    modules: [
      { id: "L2-M1", title: "The Spirit Gate", weight: 25, questions: [{ id: "q22", text: "What is the Akha name for the Spirit Gate?", options: ["Lawkah-pah", "Spirit-Wall", "Heaven-Door"], correctAnswer: "Lawkah-pah" }] },
      { id: "L2-M2", title: "Ancestors", weight: 25, questions: [{ id: "q29", text: "Who is the highest spiritual authority?", options: ["Dzo-ma", "The blacksmith", "The elder"], correctAnswer: "Dzo-ma" }] },
      { id: "L2-M3", title: "Animism", weight: 50, questions: [{ id: "q36", text: "Where do spirits inhabit?", options: ["Trees, rocks, and water", "Only humans", "Electronics"], correctAnswer: "Trees, rocks, and water" }] }
    ]
  },
  {
    id: 3,
    title: "Festivals & Rituals",
    image: "https://www.thaiakhakitchen.com/wp-content/uploads/2019/07/4Asia1200x630.jpg",
    modules: [
      { id: "L3-M1", title: "Swing Festival", weight: 25, questions: [{ id: "q43", text: "What is the Akha name for the Swing Festival?", options: ["Yehkuja", "Songkran", "Holi"], correctAnswer: "Yehkuja" }] },
      { id: "L3-M2", title: "Spinning Top", weight: 25, questions: [{ id: "q50", text: "Which game is for men during festivals?", options: ["Spinning Top", "Soccer", "Chess"], correctAnswer: "Spinning Top" }] },
      { id: "L3-M3", title: "Passage Rituals", weight: 50, questions: [{ id: "q57", text: "What marks the birth of a child?", options: ["Soul-binding", "Naming by fire", "River washing"], correctAnswer: "Soul-binding" }] }
    ]
  },
  {
    id: 4,
    title: "Food & Foraging",
    image: "https://www.thaiakhakitchen.com/wp-content/uploads/2020/09/Base_1200_Akha_Dinner_23.jpg",
    modules: [
      { id: "L4-M1", title: "Mountain Rice", weight: 25, questions: [{ id: "q64", text: "What is the staple food?", options: ["Rice", "Wheat", "Maize"], correctAnswer: "Rice" }] },
      { id: "L4-M2", title: "Jungle Herbs", weight: 25, questions: [{ id: "q71", text: "Which herb is a signature?", options: ["Mountain Coriander", "Rosemary", "Thyme"], correctAnswer: "Mountain Coriander" }] },
      { id: "L4-M3", title: "The Kitchen", weight: 50, questions: [{ id: "q78", text: "What is the heart of an Akha home?", options: ["Indoor fireplace", "The TV", "The garden"], correctAnswer: "Indoor fireplace" }] }
    ]
  },
  {
    id: 5,
    title: "Clothing & Identity",
    image: "https://www.thaiakhakitchen.com/wp-content/uploads/2020/09/Base_1200_Akha_Dinner_33.jpg",
    modules: [
      { id: "L5-M1", title: "The Headdress", weight: 25, questions: [{ id: "q85", text: "Most iconic part of Akha attire?", options: ["Headdress", "Shoes", "Cape"], correctAnswer: "Headdress" }] },
      { id: "L5-M2", title: "Indigo", weight: 25, questions: [{ id: "q92", text: "Primary color of cloth?", options: ["Indigo", "Red", "Blue"], correctAnswer: "Indigo" }] },
      { id: "L5-M3", title: "Silver", weight: 50, questions: [{ id: "q99", text: "Why is silver prized?", options: ["Deflects evil spirits", "Easy to find", "Only metal"], correctAnswer: "Deflects evil spirits" }] }
    ]
  },
  {
    id: 6,
    title: "Music & Oral Lore",
    image: "https://www.thaiakhakitchen.com/wp-content/uploads/2020/09/Base_1200_Akha_Dinner_12.jpg",
    modules: [
      { id: "L6-M1", title: "Oral Literature", weight: 25, questions: [{ id: "q106", text: "Do they have a script?", options: ["No, oral only", "Yes, like Thai", "Yes, like Chinese"], correctAnswer: "No, oral only" }] },
      { id: "L6-M2", title: "Instruments", weight: 25, questions: [{ id: "q113", text: "What is a Subu?", options: ["3-stringed lute", "A drum", "A flute"], correctAnswer: "3-stringed lute" }] },
      { id: "L6-M3", title: "Mountain Songs", weight: 50, questions: [{ id: "q120", text: "Feature of Akha songs?", options: ["Vocal harmony", "Monotone", "Autotune"], correctAnswer: "Vocal harmony" }] }
    ]
  },
  {
    id: 7,
    title: "Modern Era & Coffee",
    image: "https://www.thaiakhakitchen.com/wp-content/uploads/2018/11/tak-logo-new.png",
    modules: [
      { id: "L7-M1", title: "Opium Transition", weight: 25, questions: [{ id: "q127", text: "Major crop before coffee?", options: ["Opium", "Wheat", "Corn"], correctAnswer: "Opium" }] },
      { id: "L7-M2", title: "Akha Coffee", weight: 25, questions: [{ id: "q134", text: "Variety grown?", options: ["Arabica", "Robusta", "Liberica"], correctAnswer: "Arabica" }] },
      { id: "L7-M3", title: "Future", weight: 50, questions: [{ id: "q141", text: "What is community tourism?", options: ["Managed by village", "Big hotels", "Helicopter tours"], correctAnswer: "Managed by village" }] }
    ]
  }
];
