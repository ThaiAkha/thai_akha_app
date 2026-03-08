export type ChatNodeId = 
  | 'ROOT' | 'INFO_CLASSES' | 'MORNING_DETAILS' | 'EVENING_DETAILS'
  | 'MENU_DIET' | 'VEGAN_INFO' | 'VEGETARIAN_INFO' | 'REGULAR_INFO' | 'ALLERGY_INFO'
  | 'SET_VEGAN' | 'SET_VEGETARIAN' | 'SET_REGULAR' | 'SET_PESCATARIAN' | 'SET_MEATLOVER'
  | 'PICKUP_INFO' | 'MEETING_POINT' | 'PICKUP_RULES'
  | 'PLAY_QUIZ' | 'QUIZ_LEVEL1_Q1' | 'QUIZ_LEVEL1_Q2' | 'QUIZ_LEVEL1_Q3' | 'QUIZ_LEVEL1_Q4'
  | 'QUIZ_LEVEL2_Q1' | 'QUIZ_LEVEL2_Q2' | 'QUIZ_LEVEL2_Q3' | 'QUIZ_LEVEL2_Q4'
  | 'QUIZ_LEVEL3_Q1' | 'QUIZ_LEVEL3_Q2' | 'QUIZ_LEVEL3_Q3' | 'QUIZ_LEVEL3_Q4'
  | 'QUIZ_LEVEL1_COMPLETE' | 'QUIZ_LEVEL2_COMPLETE' | 'QUIZ_LEVEL3_COMPLETE'
  | 'QUIZ_WRONG_ANSWER' | 'QUIZ_RETRY'
  | 'GIFT_INFO' | 'LEARN_THAI' | 'AKHA_CULTURE'
  | 'AKHA_CULTURE_L1' | 'AKHA_CULTURE_L2' | 'AKHA_CULTURE_L3'
  | 'AKHA_ZANG_L1' | 'AKHA_ZANG_L2' | 'AKHA_ZANG_L3'
  | 'AKHA_DRESS_L1' | 'AKHA_DRESS_L2' | 'AKHA_DRESS_L3'
  | 'AKHA_FESTIVAL_L1' | 'AKHA_FESTIVAL_L2' | 'AKHA_FESTIVAL_L3'
  | 'AKHA_SPIRITGATE_L1' | 'AKHA_SPIRITGATE_L2' | 'AKHA_SPIRITGATE_L3'
  | 'MENU_SPECIALS' | 'AKHA_DISHES_INFO' | 'CURRY_SELECTION_INFO'
  | 'AKHA_SALAD_DETAIL' | 'SAPI_THONG_DETAIL' | 'AKHA_SOUP_DETAIL'
  | 'CURRY_RED_DETAIL' | 'CURRY_GREEN_DETAIL' | 'CURRY_MASSAMAN_DETAIL' | 'CURRY_PANANG_DETAIL'
  | 'RECIPE_SUGGESTIONS' | 'DIET_ADAPTED_MENU'
  | 'BOOK_NOW' | 'CONTACT_INFO';

export interface ChatOption {
  label: string;
  nextId: ChatNodeId;
  action?: 'nav_classes' | 'nav_menu' | 'nav_quiz' | 'open_map' | 'close_chat' | 'set_diet' | null;
  data?: {
    diet?: 'vegan' | 'vegetarian' | 'regular' | 'pescatarian' | 'meatlover';
    correct?: boolean;
  };
}

export interface ChatNode {
  id: ChatNodeId;
  message: string;
  options: ChatOption[];
  hasRandomOption?: boolean;
}

// Random option pool
export const RANDOM_CHAT_OPTIONS: ChatOption[] = [
  { label: "🎁 Discover Prizes", nextId: 'GIFT_INFO' },
  { label: "🌶️ Play Quiz", nextId: 'PLAY_QUIZ' },
  { label: "🗣️ Learn Thai", nextId: 'LEARN_THAI' },
  { label: "⛰️ Akha Culture", nextId: 'AKHA_CULTURE_L1' },
  { label: "📍 Meeting Point", nextId: 'MEETING_POINT' },
  { label: "🍽️ Special Menu", nextId: 'MENU_SPECIALS' }
];

export const CHAT_FLOW: Record<string, ChatNode> = {
  ROOT: {
    id: 'ROOT',
    message: "Sawasdee kha! 🙏 I'm Cherry, your Akha digital guide! How can I help you today?",
    options: [
      { label: "📚 Class Info", nextId: 'INFO_CLASSES' },
      { label: "🍽️ Menu & Diets", nextId: 'MENU_DIET' },
      { label: "🚐 Pickup Service", nextId: 'PICKUP_INFO' },
      { label: "🎮 Play Quiz", nextId: 'PLAY_QUIZ' }
    ]
  },

  INFO_CLASSES: {
    id: 'INFO_CLASSES',
    message: "We offer morning market classes 🛒 and evening dinner classes 🌙. Which one interests you?",
    options: [
      { label: "☀️ Morning Class", nextId: 'MORNING_DETAILS' },
      { label: "🌙 Evening Class", nextId: 'EVENING_DETAILS' },
      { label: "🍲 See Menu", nextId: 'MENU_DIET' },
      { label: "🚗 Free Pickup", nextId: 'PICKUP_INFO' }
    ]
  },

  MORNING_DETAILS: {
    id: 'MORNING_DETAILS',
    message: "☀️ **Morning Class**\n\n⏰ 8:30 AM - 2:30 PM\n💰 1,400 THB\n✨ Includes local market tour!\n\nPerfect for morning energy lovers who want to discover fresh ingredients!",
    hasRandomOption: true,
    options: [
      { label: "📋 See Full Menu", nextId: 'ROOT', action: 'nav_menu' },
      { label: "🚐 Pickup Info", nextId: 'PICKUP_INFO' },
      { label: "🎯 Book Now", nextId: 'BOOK_NOW' }
    ]
  },

  EVENING_DETAILS: {
    id: 'EVENING_DETAILS',
    message: "🌙 **Evening Class**\n\n⏰ 4:30 PM - 9:00 PM\n💰 1,300 THB\n✨ Cozy dinner atmosphere!\n\nIdeal for romantic experiences or with friends, with Thai sunset magic.",
    hasRandomOption: true,
    options: [
      { label: "📋 See Full Menu", nextId: 'ROOT', action: 'nav_menu' },
      { label: "🚐 Pickup Info", nextId: 'PICKUP_INFO' },
      { label: "🎯 Book Evening", nextId: 'BOOK_NOW' }
    ]
  },

  MENU_DIET: {
    id: 'MENU_DIET',
    message: "🍽️ **Menu & Dietary Adaptations**\n\nOver 20% of our guests follow special diets! Choose yours to personalize your experience:",
    options: [
      { label: "🌱 I'm Vegan", nextId: 'SET_VEGAN' },
      { label: "🥬 I'm Vegetarian", nextId: 'SET_VEGETARIAN' },
      { label: "🍗 I Eat Everything", nextId: 'SET_REGULAR' },
      { label: "🐟 Pescatarian", nextId: 'SET_PESCATARIAN' },
      { label: "🥩 Meat Lover", nextId: 'SET_MEATLOVER' },
      { label: "⚠️ Allergies", nextId: 'ALLERGY_INFO' }
    ]
  },

  SET_VEGAN: {
    id: 'SET_VEGAN',
    message: "🌱 **Perfect! I'll remember you're vegan.**\n\nChiang Mai is famous for being vegan-friendly! We'll use tofu and plant-based ingredients in all recipes.",
    options: [
      { label: "👨‍🍳 See Vegan Akha Specialties", nextId: 'AKHA_DISHES_INFO' },
      { label: "🍛 Discover Vegan Curries", nextId: 'CURRY_SELECTION_INFO' },
      { label: "📋 Personalized Menu", nextId: 'DIET_ADAPTED_MENU' },
      { label: "↩️ Go Back", nextId: 'MENU_DIET' }
    ]
  },

  SET_VEGETARIAN: {
    id: 'SET_VEGETARIAN',
    message: "🥬 **Great! You're vegetarian.**\n\nWe'll replace all meat with tofu. Fish sauce is optional!",
    options: [
      { label: "👨‍🍳 Vegetarian Akha Specialties", nextId: 'AKHA_DISHES_INFO' },
      { label: "🍛 Vegetarian Curries", nextId: 'CURRY_SELECTION_INFO' },
      { label: "📋 Personalized Menu", nextId: 'DIET_ADAPTED_MENU' },
      { label: "↩️ Go Back", nextId: 'MENU_DIET' }
    ]
  },

  SET_REGULAR: {
    id: 'SET_REGULAR',
    message: "🍗 **Classic Thai diet!**\n\nYou'll try chicken, shrimp, and tofu as in local tradition.",
    options: [
      { label: "👨‍🍳 All Specialties", nextId: 'AKHA_DISHES_INFO' },
      { label: "🍛 Full Curry Selection", nextId: 'CURRY_SELECTION_INFO' },
      { label: "📋 See Menu", nextId: 'DIET_ADAPTED_MENU' },
      { label: "↩️ Go Back", nextId: 'MENU_DIET' }
    ]
  },

  DIET_ADAPTED_MENU: {
    id: 'DIET_ADAPTED_MENU',
    message: "📋 **Menu Personalized for You**\n\n*Based on your preferences, Cherry suggests:*\n\n🍴 **2 Appetizers** (for everyone)\n🍴 **2 Desserts** (for everyone)\n🍴 **3 Akha Specialties** (100% vegan)\n\n➕ **You Choose:**\n1️⃣ One Curry from 4 options\n2️⃣ One Soup from 3 options\n3️⃣ One Stir-fry from 4 options\n\n✨ All ingredients adapted to your diet!",
    options: [
      { label: "👨‍🍳 Discover Akha Dishes", nextId: 'AKHA_DISHES_INFO' },
      { label: "🍛 Curry Info", nextId: 'CURRY_SELECTION_INFO' },
      { label: "🎯 Book Now", nextId: 'BOOK_NOW' },
      { label: "↩️ Change Diet", nextId: 'MENU_DIET' }
    ]
  },

  AKHA_DISHES_INFO: {
    id: 'AKHA_DISHES_INFO',
    message: "🌿 **The 3 Akha Gems (100% Vegan)**\n\nThese rare recipes come straight from the mountains!",
    options: [
      { label: "🥗 Akha Salad", nextId: 'AKHA_SALAD_DETAIL' },
      { label: "🌶️ Sapi Thong", nextId: 'SAPI_THONG_DETAIL' },
      { label: "🍵 Akha Soup", nextId: 'AKHA_SOUP_DETAIL' },
      { label: "↩️ Back to Menu", nextId: 'DIET_ADAPTED_MENU' }
    ]
  },

  AKHA_SALAD_DETAIL: {
    id: 'AKHA_SALAD_DETAIL',
    message: "🥗 **Akha Salad**\n\nA mountain salad with wild herbs hand-picked from the forest. Every leaf has medicinal properties! The secrets of the forest on your plate.",
    options: [
      { label: "🌶️ Next: Sapi Thong", nextId: 'SAPI_THONG_DETAIL' },
      { label: "🍵 See Akha Soup", nextId: 'AKHA_SOUP_DETAIL' },
      { label: "↩️ Back to Specialties", nextId: 'AKHA_DISHES_INFO' }
    ]
  },

  SAPI_THONG_DETAIL: {
    id: 'SAPI_THONG_DETAIL',
    message: "🌶️ **Sapi Thong**\n\nThe essential Akha chili paste! HAND-POUNDED in mortar (never blended!). The slow rhythm of the pestle creates the smoky depth.",
    options: [
      { label: "🍵 Next: Akha Soup", nextId: 'AKHA_SOUP_DETAIL' },
      { label: "🥗 See Akha Salad", nextId: 'AKHA_SALAD_DETAIL' },
      { label: "↩️ Back to Specialties", nextId: 'AKHA_DISHES_INFO' }
    ]
  },

  AKHA_SOUP_DETAIL: {
    id: 'AKHA_SOUP_DETAIL',
    message: "🍵 **Akha Vegetable Soup**\n\n⚠️ **ABSOLUTE RULE:** NEVER meat in this soup! Only fresh vegetables and herbs in a clear, purifying broth. The secret to body balance.",
    options: [
      { label: "🥗 See Akha Salad", nextId: 'AKHA_SALAD_DETAIL' },
      { label: "🌶️ See Sapi Thong", nextId: 'SAPI_THONG_DETAIL' },
      { label: "↩️ Back to Specialties", nextId: 'AKHA_DISHES_INFO' }
    ]
  },

  CURRY_SELECTION_INFO: {
    id: 'CURRY_SELECTION_INFO',
    message: "🍛 **Choose Your Curry**\n\nAll pastes made FRESH, no powders!",
    options: [
      { label: "🔴 Red Curry", nextId: 'CURRY_RED_DETAIL' },
      { label: "🟢 Green Curry", nextId: 'CURRY_GREEN_DETAIL' },
      { label: "🟤 Massaman Curry", nextId: 'CURRY_MASSAMAN_DETAIL' },
      { label: "🟡 Panang Curry", nextId: 'CURRY_PANANG_DETAIL' },
      { label: "↩️ Back to Menu", nextId: 'DIET_ADAPTED_MENU' }
    ]
  },

  CURRY_RED_DETAIL: {
    id: 'CURRY_RED_DETAIL',
    message: "🔴 **Red Curry**\n\nThe classic! Dried red chilies, lemongrass, galangal. Perfect spice balance. *For you: version with chicken/tofu according to your diet.*",
    options: [
      { label: "🟢 See Green Curry", nextId: 'CURRY_GREEN_DETAIL' },
      { label: "🟤 See Massaman", nextId: 'CURRY_MASSAMAN_DETAIL' },
      { label: "↩️ Back to Selection", nextId: 'CURRY_SELECTION_INFO' }
    ]
  },

  CURRY_GREEN_DETAIL: {
    id: 'CURRY_GREEN_DETAIL',
    message: "🟢 **Green Curry**\n\nSpicy and fresh! Fresh green chilies, Thai basil, eggplant. The most aromatic. *Adapted to your dietary preferences.*",
    options: [
      { label: "🔴 See Red Curry", nextId: 'CURRY_RED_DETAIL' },
      { label: "🟤 See Massaman", nextId: 'CURRY_MASSAMAN_DETAIL' },
      { label: "↩️ Back to Selection", nextId: 'CURRY_SELECTION_INFO' }
    ]
  },

  CURRY_MASSAMAN_DETAIL: {
    id: 'CURRY_MASSAMAN_DETAIL',
    message: "🟤 **Massaman Curry**\n\nPersian influences! Cinnamon, cardamom, star anise. Rich and sweet, the least spicy. *Prepared according to your dietary choices.*",
    options: [
      { label: "🔴 See Red Curry", nextId: 'CURRY_RED_DETAIL' },
      { label: "🟢 See Green Curry", nextId: 'CURRY_GREEN_DETAIL' },
      { label: "↩️ Back to Selection", nextId: 'CURRY_SELECTION_INFO' }
    ]
  },

  CURRY_PANANG_DETAIL: {
    id: 'CURRY_PANANG_DETAIL',
    message: "🟡 **Panang Curry**\n\nThick and creamy! Roasted peanuts, coconut cream. The most substantial. *Customized version for your diet.*",
    options: [
      { label: "🔴 See Red Curry", nextId: 'CURRY_RED_DETAIL' },
      { label: "🟢 See Green Curry", nextId: 'CURRY_GREEN_DETAIL' },
      { label: "↩️ Back to Selection", nextId: 'CURRY_SELECTION_INFO' }
    ]
  },

  PLAY_QUIZ: {
    id: 'PLAY_QUIZ',
    message: "🎮 **Quiz Time!** 🎮\n\nChoose your challenge level! Each level has 4 questions about Akha culture.",
    options: [
      { label: "🌱 Level 1 (Easy)", nextId: 'QUIZ_LEVEL1_Q1' },
      { label: "🚶 Level 2 (Medium)", nextId: 'QUIZ_LEVEL2_Q1' },
      { label: "🎓 Level 3 (Expert)", nextId: 'QUIZ_LEVEL3_Q1' },
      { label: "↩️ Go Back", nextId: 'ROOT' }
    ]
  },

  // ==================== LEVEL 1 (EASY) ====================
  QUIZ_LEVEL1_Q1: {
    id: 'QUIZ_LEVEL1_Q1',
    message: "🌱 **Question 1/4**\n\nFrom which region did the Akha people migrate?",
    options: [
      { label: "Tibetan Plateau", nextId: 'QUIZ_LEVEL1_Q2', data: { correct: true } },
      { label: "Cambodian Lowlands", nextId: 'QUIZ_LEVEL1_Q2', data: { correct: false } },
      { label: "Indonesian Archipelago", nextId: 'QUIZ_LEVEL1_Q2', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL1_Q2: {
    id: 'QUIZ_LEVEL1_Q2',
    message: "🌱 **Question 2/4**\n\nWhat is Akha Zang?",
    options: [
      { label: "A musical instrument", nextId: 'QUIZ_LEVEL1_Q3', data: { correct: false } },
      { label: "The Akha Way of life", nextId: 'QUIZ_LEVEL1_Q3', data: { correct: true } },
      { label: "A type of headdress", nextId: 'QUIZ_LEVEL1_Q3', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL1_Q3: {
    id: 'QUIZ_LEVEL1_Q3',
    message: "🌱 **Question 3/4**\n\nWhich festival is the 'Women's New Year'?",
    options: [
      { label: "Harvest Festival", nextId: 'QUIZ_LEVEL1_Q4', data: { correct: false } },
      { label: "Swing Festival", nextId: 'QUIZ_LEVEL1_Q4', data: { correct: true } },
      { label: "Spirit Gate Ceremony", nextId: 'QUIZ_LEVEL1_Q4', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL1_Q4: {
    id: 'QUIZ_LEVEL1_Q4',
    message: "🌱 **Question 4/4**\n\nWhat does silver represent in traditional dress?",
    options: [
      { label: "Spiritual protection", nextId: 'QUIZ_LEVEL1_COMPLETE', data: { correct: true } },
      { label: "Financial wealth", nextId: 'QUIZ_LEVEL1_COMPLETE', data: { correct: false } },
      { label: "Marital status", nextId: 'QUIZ_LEVEL1_COMPLETE', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL1_COMPLETE: {
    id: 'QUIZ_LEVEL1_COMPLETE',
    message: "🎉 **CONGRATULATIONS!** 🎉\n\nYou completed Level 1! Ready to learn more?\n\n🏆 **Visit our FULL QUIZ PAGE** for:\n• 21 questions across 3 levels\n• Unlock special cards\n• Win REAL PRIZES!\n• Become an Akha culture expert!",
    options: [
      { label: "🚀 Go to Quiz Page", nextId: 'ROOT', action: 'nav_quiz' },
      { label: "🔄 Try Level 2", nextId: 'QUIZ_LEVEL2_Q1' },
      { label: "🏠 Back to Chat", nextId: 'ROOT' }
    ]
  },

  // ==================== LEVEL 2 (MEDIUM) ====================
  QUIZ_LEVEL2_Q1: {
    id: 'QUIZ_LEVEL2_Q1',
    message: "🚶 **Question 1/4**\n\nHow many generations can Akha patrilineal lineage trace?",
    options: [
      { label: "10-15 generations", nextId: 'QUIZ_LEVEL2_Q2', data: { correct: false } },
      { label: "Over 60 generations", nextId: 'QUIZ_LEVEL2_Q2', data: { correct: true } },
      { label: "Exactly 30 generations", nextId: 'QUIZ_LEVEL2_Q2', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL2_Q2: {
    id: 'QUIZ_LEVEL2_Q2',
    message: "🚶 **Question 2/4**\n\nWhat is 'Pii Pa' in Akha music?",
    options: [
      { label: "A bamboo flute", nextId: 'QUIZ_LEVEL2_Q3', data: { correct: false } },
      { label: "A leaf used as instrument", nextId: 'QUIZ_LEVEL2_Q3', data: { correct: true } },
      { label: "A ceremonial drum", nextId: 'QUIZ_LEVEL2_Q3', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL2_Q3: {
    id: 'QUIZ_LEVEL2_Q3',
    message: "🚶 **Question 3/4**\n\nAt what altitude does Akha coffee grow?",
    options: [
      { label: "500-800 meters", nextId: 'QUIZ_LEVEL2_Q4', data: { correct: false } },
      { label: "1,200-1,500 meters", nextId: 'QUIZ_LEVEL2_Q4', data: { correct: true } },
      { label: "2,000-2,500 meters", nextId: 'QUIZ_LEVEL2_Q4', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL2_Q4: {
    id: 'QUIZ_LEVEL2_Q4',
    message: "🚶 **Question 4/4**\n\nWhat is 'Mak Khen'?",
    options: [
      { label: "Wild pepper for Sapi Thong", nextId: 'QUIZ_LEVEL2_COMPLETE', data: { correct: true } },
      { label: "Traditional Akha house", nextId: 'QUIZ_LEVEL2_COMPLETE', data: { correct: false } },
      { label: "Ceremonial hat", nextId: 'QUIZ_LEVEL2_COMPLETE', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL2_COMPLETE: {
    id: 'QUIZ_LEVEL2_COMPLETE',
    message: "🎉 **EXCELLENT!** 🎉\n\nLevel 2 COMPLETED! You're becoming an expert!\n\n🏆 **In the full quiz page you'll find:**\n• Even more in-depth questions\n• The 4-phase system with prizes\n• The challenge to unlock all cards!",
    options: [
      { label: "🚀 Go to Quiz Page", nextId: 'ROOT', action: 'nav_quiz' },
      { label: "🎓 Try Level 3", nextId: 'QUIZ_LEVEL3_Q1' },
      { label: "🏠 Back to Chat", nextId: 'ROOT' }
    ]
  },

  // ==================== LEVEL 3 (EXPERT) ====================
  QUIZ_LEVEL3_Q1: {
    id: 'QUIZ_LEVEL3_Q1',
    message: "🎓 **Question 1/4**\n\nWhat is 'Pyaw' in Akha cosmology?",
    options: [
      { label: "Balance between human and spirit worlds", nextId: 'QUIZ_LEVEL3_Q2', data: { correct: true } },
      { label: "The Akha creation myth", nextId: 'QUIZ_LEVEL3_Q2', data: { correct: false } },
      { label: "Traditional farming technique", nextId: 'QUIZ_LEVEL3_Q2', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL3_Q2: {
    id: 'QUIZ_LEVEL3_Q2',
    message: "🎓 **Question 2/4**\n\nWho is the 'Phu-mo'?",
    options: [
      { label: "Village spiritual head", nextId: 'QUIZ_LEVEL3_Q3', data: { correct: false } },
      { label: "Shaman master of chants", nextId: 'QUIZ_LEVEL3_Q3', data: { correct: true } },
      { label: "Sacred blacksmith", nextId: 'QUIZ_LEVEL3_Q3', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL3_Q3: {
    id: 'QUIZ_LEVEL3_Q3',
    message: "🎓 **Question 3/4**\n\nWhat is the taboo about the Spirit Gate?",
    options: [
      { label: "Don't touch it as outsider", nextId: 'QUIZ_LEVEL3_Q4', data: { correct: true } },
      { label: "Don't pass through at night", nextId: 'QUIZ_LEVEL3_Q4', data: { correct: false } },
      { label: "Don't photograph it", nextId: 'QUIZ_LEVEL3_Q4', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL3_Q4: {
    id: 'QUIZ_LEVEL3_Q4',
    message: "🎓 **Question 4/4**\n\nHow does the school describe its culinary philosophy?",
    options: [
      { label: "Thai ingredients with Akha hearts", nextId: 'QUIZ_LEVEL3_COMPLETE', data: { correct: true } },
      { label: "Modern East-West fusion", nextId: 'QUIZ_LEVEL3_COMPLETE', data: { correct: false } },
      { label: "Pure tradition preservation", nextId: 'QUIZ_LEVEL3_COMPLETE', data: { correct: false } }
    ]
  },

  QUIZ_LEVEL3_COMPLETE: {
    id: 'QUIZ_LEVEL3_COMPLETE',
    message: "🎉 **AKHA CULTURE MASTER!** 🎉\n\nYou passed the hardest level! Ready for the final challenge?\n\n🏆 **In the FULL QUIZ PAGE** you can:\n• Compete for Akha Expert title\n• Unlock the 4-phase system\n• Earn EXCLUSIVE prizes!\n• Test all 21 questions!",
    options: [
      { label: "🚀 Go to Full Quiz Page", nextId: 'ROOT', action: 'nav_quiz' },
      { label: "⛰️ Explore Akha Culture", nextId: 'AKHA_CULTURE_L1' },
      { label: "🏠 Back to Chat", nextId: 'ROOT' }
    ]
  },

  // ==================== AKHA CULTURE (MINI-TOUR) ====================
  AKHA_CULTURE_L1: {
    id: 'AKHA_CULTURE_L1',
    message: "⛰️ **Explore Akha Culture**\n\nChoose a topic to start your journey!",
    options: [
      { label: "📜 Akha Zang (The Akha Way)", nextId: 'AKHA_ZANG_L1' },
      { label: "👘 Traditional Dress", nextId: 'AKHA_DRESS_L1' },
      { label: "🎡 Swing Festival", nextId: 'AKHA_FESTIVAL_L1' },
      { label: "🚪 Spirit Gate", nextId: 'AKHA_SPIRITGATE_L1' },
      { label: "↩️ Go Back", nextId: 'ROOT' }
    ]
  },

  // AKHA ZANG - 3 LEVELS
  AKHA_ZANG_L1: {
    id: 'AKHA_ZANG_L1',
    message: "📜 **Akha Zang - Level 1**\n\nAkha Zang is the 'Akha Way', an oral constitution guiding every aspect of life.",
    options: [
      { label: "🔍 Deepen (Level 2)", nextId: 'AKHA_ZANG_L2' },
      { label: "🎮 Quiz on Akha Zang", nextId: 'QUIZ_LEVEL1_Q2' },
      { label: "⛰️ Other Topics", nextId: 'AKHA_CULTURE_L1' }
    ]
  },

  AKHA_ZANG_L2: {
    id: 'AKHA_ZANG_L2',
    message: "📜 **Akha Zang - Level 2**\n\nIncludes agriculture, forest management, family obligations. Passed orally from elders to youth.",
    options: [
      { label: "🎓 Expert Level (3)", nextId: 'AKHA_ZANG_L3' },
      { label: "↩️ Back to Level 1", nextId: 'AKHA_ZANG_L1' },
      { label: "⛰️ Other Topics", nextId: 'AKHA_CULTURE_L1' }
    ]
  },

  AKHA_ZANG_L3: {
    id: 'AKHA_ZANG_L3',
    message: "📜 **Akha Zang - Level 3**\n\nTraces patrilineal lineages of 60+ generations. Maintains 'Pyaw' (balance) between human and spirit worlds. Preserves Akha identity through centuries of migration.",
    options: [
      { label: "🎮 Advanced Quiz", nextId: 'QUIZ_LEVEL3_Q1' },
      { label: "↩️ Back to Level 2", nextId: 'AKHA_ZANG_L2' },
      { label: "🏠 Back to Chat", nextId: 'ROOT' }
    ]
  },

  // TRADITIONAL DRESS - 3 LEVELS
  AKHA_DRESS_L1: {
    id: 'AKHA_DRESS_L1',
    message: "👘 **Akha Dress - Level 1**\n\nTraditional clothes are an identity map! Every bead and coin tells a story.",
    options: [
      { label: "🔍 Deepen (Level 2)", nextId: 'AKHA_DRESS_L2' },
      { label: "🎮 Quiz on Dress", nextId: 'QUIZ_LEVEL1_Q4' },
      { label: "⛰️ Other Topics", nextId: 'AKHA_CULTURE_L1' }
    ]
  },

  AKHA_DRESS_L2: {
    id: 'AKHA_DRESS_L2',
    message: "👘 **Akha Dress - Level 2**\n\nHeaddress shows subgroup (Ulo/Loimi) and life stage. Silver protects from evil spirits.",
    options: [
      { label: "🎓 Expert Level (3)", nextId: 'AKHA_DRESS_L3' },
      { label: "↩️ Back to Level 1", nextId: 'AKHA_DRESS_L1' },
      { label: "⛰️ Other Topics", nextId: 'AKHA_CULTURE_L1' }
    ]
  },

  AKHA_DRESS_L3: {
    id: 'AKHA_DRESS_L3',
    message: "👘 **Akha Dress - Level 3**\n\nCoins (Burmese rupee, French Indochinese piastre) are portable banks and maps of ancestral trade routes. Indigo represents earth's stability.",
    options: [
      { label: "🎮 Advanced Quiz", nextId: 'QUIZ_LEVEL2_Q4' },
      { label: "↩️ Back to Level 2", nextId: 'AKHA_DRESS_L2' },
      { label: "🏠 Back to Chat", nextId: 'ROOT' }
    ]
  },

  // SWING FESTIVAL - 3 LEVELS
  AKHA_FESTIVAL_L1: {
    id: 'AKHA_FESTIVAL_L1',
    message: "🎡 **Swing Festival - Level 1**\n\nYehkuja! The 4-day festival in August, called 'Women's New Year'.",
    options: [
      { label: "🔍 Deepen (Level 2)", nextId: 'AKHA_FESTIVAL_L2' },
      { label: "🎮 Quiz on Festival", nextId: 'QUIZ_LEVEL1_Q3' },
      { label: "⛰️ Other Topics", nextId: 'AKHA_CULTURE_L1' }
    ]
  },

  AKHA_FESTIVAL_L2: {
    id: 'AKHA_FESTIVAL_L2',
    message: "🎡 **Swing Festival - Level 2**\n\nA 4-pillar swing. Swinging high prays for ripe rice and connects celestial lands.",
    options: [
      { label: "🎓 Expert Level (3)", nextId: 'AKHA_FESTIVAL_L3' },
      { label: "↩️ Back to Level 1", nextId: 'AKHA_FESTIVAL_L1' },
      { label: "⛰️ Other Topics", nextId: 'AKHA_CULTURE_L1' }
    ]
  },

  AKHA_FESTIVAL_L3: {
    id: 'AKHA_FESTIVAL_L3',
    message: "🎡 **Swing Festival - Level 3**\n\nRhythmic motion stimulates fertility for women and land. Includes ancestral offerings, choral singing, feasts for Agriculture Goddess.",
    options: [
      { label: "🎮 Advanced Quiz", nextId: 'QUIZ_LEVEL2_Q1' },
      { label: "↩️ Back to Level 2", nextId: 'AKHA_FESTIVAL_L2' },
      { label: "🏠 Back to Chat", nextId: 'ROOT' }
    ]
  },

  // SPIRIT GATE - 3 LEVELS
  AKHA_SPIRITGATE_L1: {
    id: 'AKHA_SPIRITGATE_L1',
    message: "🚪 **Spirit Gate - Level 1**\n\nThe Loku-Pah is the sacred boundary between human and spirit worlds.",
    options: [
      { label: "🔍 Deepen (Level 2)", nextId: 'AKHA_SPIRITGATE_L2' },
      { label: "🎮 Quiz on Spirit Gate", nextId: 'QUIZ_LEVEL3_Q3' },
      { label: "⛰️ Other Topics", nextId: 'AKHA_CULTURE_L1' }
    ]
  },

  AKHA_SPIRITGATE_L2: {
    id: 'AKHA_SPIRITGATE_L2',
    message: "🚪 **Spirit Gate - Level 2**\n\nMetaphysical filter of bamboo/wood. Keeps harmful spirits out, protective energy in.",
    options: [
      { label: "🎓 Expert Level (3)", nextId: 'AKHA_SPIRITGATE_L3' },
      { label: "↩️ Back to Level 1", nextId: 'AKHA_SPIRITGATE_L1' },
      { label: "⛰️ Other Topics", nextId: 'AKHA_CULTURE_L1' }
    ]
  },

  AKHA_SPIRITGATE_L3: {
    id: 'AKHA_SPIRITGATE_L3',
    message: "🚪 **Spirit Gate - Level 3**\n\nCarved figures represent male/female principles for fertility. Rebuilt annually for renewal. TABOO: outsiders must not touch.",
    options: [
      { label: "🎮 Advanced Quiz", nextId: 'QUIZ_LEVEL3_Q3' },
      { label: "↩️ Back to Level 2", nextId: 'AKHA_SPIRITGATE_L2' },
      { label: "🏠 Back to Chat", nextId: 'ROOT' }
    ]
  },

  // ==================== UPDATED EXISTING SECTIONS ====================
  PICKUP_INFO: {
    id: 'PICKUP_INFO',
    message: "🚐 **Free Pickup in Old City!** 🛺\n\nWe come to get you! Service included in price.",
    hasRandomOption: true,
    options: [
      { label: "📋 Pickup Rules", nextId: 'PICKUP_RULES' },
      { label: "📍 Meeting Point", nextId: 'MEETING_POINT' },
      { label: "🗺️ View on Map", nextId: 'MEETING_POINT', action: 'open_map' },
      { label: "🏠 Go Back", nextId: 'ROOT' }
    ]
  },

  PICKUP_RULES: {
    id: 'PICKUP_RULES',
    message: "📋 **Pickup Rules**\n\n✅ Confirm via WhatsApp/email\n✅ Flexible times\n✅ English-speaking driver",
    options: [
      { label: "📍 See Meeting Point", nextId: 'MEETING_POINT' },
      { label: "↩️ Back to Pickup Info", nextId: 'PICKUP_INFO' }
    ]
  },

  MEETING_POINT: {
    id: 'MEETING_POINT',
    message: "📍 **Meeting Point**\n\nWat Pan Whaen Temple\n\n*The perfect place to start your adventure!*",
    options: [
      { label: "🗺️ Open Map", nextId: 'MEETING_POINT', action: 'open_map' },
      { label: "🚐 Pickup Info", nextId: 'PICKUP_INFO' },
      { label: "🏠 Back to Chat", nextId: 'ROOT' }
    ]
  },

  LEARN_THAI: {
    id: 'LEARN_THAI',
    message: "🗣️ **Learn Thai!**\n\nSay 'Aroi Mak' when you taste something delicious! 😋\n\n*Aroi = Delicious\nMak = Very*",
    options: [
      { label: "Aroi Mak! 😋", nextId: 'ROOT' },
      { label: "More Phrases", nextId: 'LEARN_THAI' }
    ]
  },

  GIFT_INFO: {
    id: 'GIFT_INFO',
    message: "🎁 **Your Prizes!**\n\nCompleting classes you receive:\n📖 Free Recipe Book\n🎓 Participation Certificate\n📸 Photos of Your Experience\n\n*And if you complete the online quiz... special prizes!*",
    options: [
      { label: "🎮 Try the Quiz", nextId: 'PLAY_QUIZ' },
      { label: "🙏 Thanks Cherry!", nextId: 'ROOT' }
    ]
  },

  BOOK_NOW: {
    id: 'BOOK_NOW',
    message: "🎯 **Book Your Experience!**\n\nVisit our website or contact via:\n📧 email@thaiakhakitchen.com\n📱 +66 XX XXX XXXX\n💬 WhatsApp available\n\n*Cherry can't book, but will guide you!*",
    options: [
      { label: "🏠 Back to Chat", nextId: 'ROOT' },
      { label: "📚 Class Info", nextId: 'INFO_CLASSES' },
      { label: "🍽️ See Menu", nextId: 'MENU_DIET' }
    ]
  },

  ALLERGY_INFO: {
    id: 'ALLERGY_INFO',
    message: "⚠️ **Allergies & Intolerances**\n\nSince 2016 we've served 42,000 guests with different needs! Inform us when booking.\n\nWe substitute ingredients and adapt recipes for your safety and enjoyment.",
    options: [
      { label: "🌱 Vegan Diet", nextId: 'VEGAN_INFO' },
      { label: "🥬 Vegetarian Diet", nextId: 'VEGETARIAN_INFO' },
      { label: "🍗 Regular Diet", nextId: 'REGULAR_INFO' },
      { label: "↩️ Back to Diet Menu", nextId: 'MENU_DIET' }
    ]
  },

  VEGAN_INFO: {
    id: 'VEGAN_INFO',
    message: "🌱 **Vegan Info**\n\nChiang Mai is vegan-friendly! We use tofu and plant ingredients. Substitutions: chicken/shrimp/egg → tofu, fish sauce → soy sauce.",
    options: [
      { label: "👨‍🍳 See Vegan Menu", nextId: 'DIET_ADAPTED_MENU' },
      { label: "↩️ Back to Diets", nextId: 'MENU_DIET' }
    ]
  },

  VEGETARIAN_INFO: {
    id: 'VEGETARIAN_INFO',
    message: "🥬 **Vegetarian Info**\n\nWe exclude meat and fish. We use tofu and eggs/dairy. Fish sauce optional.",
    options: [
      { label: "👨‍🍳 See Vegetarian Menu", nextId: 'DIET_ADAPTED_MENU' },
      { label: "↩️ Back to Diets", nextId: 'MENU_DIET' }
    ]
  },

  REGULAR_INFO: {
    id: 'REGULAR_INFO',
    message: "🍗 **Regular Thai Diet**\n\nChicken, shrimp, tofu and eggs as in local tradition. Little beef in the north.",
    options: [
      { label: "👨‍🍳 See Full Menu", nextId: 'DIET_ADAPTED_MENU' },
      { label: "↩️ Back to Diets", nextId: 'MENU_DIET' }
    ]
  },

  // New nodes for additional diets
  SET_PESCATARIAN: {
    id: 'SET_PESCATARIAN',
    message: "🐟 **Pescatarian!**\n\nPerfect! Fish and seafood yes, meat no. We'll use shrimp and tofu in your recipes.",
    options: [
      { label: "👨‍🍳 Pescatarian Menu", nextId: 'DIET_ADAPTED_MENU' },
      { label: "↩️ Change Diet", nextId: 'MENU_DIET' }
    ]
  },

  SET_MEATLOVER: {
    id: 'SET_MEATLOVER',
    message: "🥩 **Meat Lover!**\n\nFantastic! We'll suggest chicken versions in all possible recipes.",
    options: [
      { label: "👨‍🍳 Meat Lover Menu", nextId: 'DIET_ADAPTED_MENU' },
      { label: "↩️ Change Diet", nextId: 'MENU_DIET' }
    ]
  },

  QUIZ_WRONG_ANSWER: {
    id: 'QUIZ_WRONG_ANSWER',
    message: "😅 **Almost!**\n\nThe correct answer was... [answer]. But don't worry! In the full quiz page you can retry and learn more!",
    options: [
      { label: "🔄 Try Again", nextId: 'QUIZ_RETRY' },
      { label: "🚀 Go to Quiz Page", nextId: 'ROOT', action: 'nav_quiz' },
      { label: "🏠 Back to Chat", nextId: 'ROOT' }
    ]
  },

  QUIZ_RETRY: {
    id: 'QUIZ_RETRY',
    message: "🔄 **Choose level again:**",
    options: [
      { label: "🌱 Level 1", nextId: 'QUIZ_LEVEL1_Q1' },
      { label: "🚶 Level 2", nextId: 'QUIZ_LEVEL2_Q1' },
      { label: "🎓 Level 3", nextId: 'QUIZ_LEVEL3_Q1' },
      { label: "🏠 Back to Chat", nextId: 'ROOT' }
    ]
  }
};