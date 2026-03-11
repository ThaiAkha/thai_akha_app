
export interface ChatSuggestion {
  id: string;
  label: string;
  payload: string;
  type: 'contextual' | 'discovery';
}

/**
 * HIERARCHY_MAP
 * Mapping of specific contexts to their primary buttons.
 */
const HIERARCHY_MAP: Record<string, ChatSuggestion[]> = {
  root: [
    { id: 'btn_see_menu', label: '🥘 See Menu', payload: 'Show me the full menu kha', type: 'contextual' },
    { id: 'btn_book', label: '👉 Book Now', payload: 'How do I book a class? kha', type: 'contextual' },
  ],
  classes: [
    { id: 'btn_morning', label: '📅 Morning Class', payload: 'Tell me about the morning class kha', type: 'contextual' },
    { id: 'btn_evening', label: '🌆 Evening Class', payload: 'Tell me about the evening class kha', type: 'contextual' },
    { id: 'btn_prices', label: '💰 Price List', payload: 'What are the prices for the classes? kha', type: 'contextual' },
    { id: 'btn_market', label: '🛒 Market Tour Info', payload: 'Tell me about the market tour kha', type: 'contextual' },
    { id: 'btn_book', label: '👉 Book Now', payload: 'How do I book a class? kha', type: 'contextual' },
  ],
  menu: [
    { id: 'btn_spice', label: '🌶️ Spice Levels', payload: 'How spicy is the food? kha', type: 'contextual' },
    { id: 'btn_vegan', label: '🥦 Vegan/Vegetarian', payload: 'Do you have vegan and vegetarian options? kha', type: 'contextual' },
    { id: 'btn_see_menu', label: '🥘 See Menu', payload: 'Show me the full menu kha', type: 'contextual' },
    { id: 'btn_what_is_akha', label: '❓ What is Akha Food?', payload: 'Tell me about Akha cuisine and flavors kha', type: 'contextual' },
  ],
  location: [
    { id: 'btn_zone', label: '📍 Check My Zone', payload: 'Help me check my hotel pickup zone kha', type: 'contextual' },
    { id: 'btn_map', label: '🗺️ Open Map', payload: 'Show me the location map and directions kha', type: 'contextual' },
    { id: 'btn_transport', label: '🚕 Train/Airport', payload: 'Tell me about train station and airport services kha', type: 'contextual' },
    { id: 'btn_walk', label: '🚶 I will Walk', payload: 'I want to walk to the kitchen, where should I meet you? kha', type: 'contextual' },
  ]
};

/**
 * RANDOM_POOL (Discovery Buttons)
 */
const RANDOM_POOL: ChatSuggestion[] = [
  { id: 'btn_quiz', label: '🧩 Play Akha Quiz', payload: 'I want to play the Akha Quiz to test my knowledge kha', type: 'discovery' },
  { id: 'btn_coffee', label: '☕ Coffee History', payload: 'Tell me about the history of Akha coffee kha', type: 'discovery' },
  { id: 'btn_surprise', label: '🎁 Surprise Me', payload: 'Tell me something surprising about Akha culture kha', type: 'discovery' },
  { id: 'btn_gallery', label: '📸 See Gallery', payload: 'Show me some photos of the kitchen and the village kha', type: 'discovery' },
];

/**
 * getSuggestions
 * Returns 2 Contextual + 2 Discovery buttons.
 */
export const getSuggestions = (context: string = 'root'): ChatSuggestion[] => {
  // 1. Get contextual buttons based on hierarchy (fallback to root)
  const contextualPool = HIERARCHY_MAP[context] || HIERARCHY_MAP['root'];
  
  // 2. Take first 2 contextual buttons
  const primaryContext = contextualPool.slice(0, 2);

  // 3. Pick 2 unique random discovery buttons
  const shuffledDiscovery = [...RANDOM_POOL].sort(() => 0.5 - Math.random());
  
  // Filter out any potential duplicates by ID if discovery pool overlaps with contextual
  const primaryIds = new Set(primaryContext.map(btn => btn.id));
  const uniqueDiscovery = shuffledDiscovery
    .filter(btn => !primaryIds.has(btn.id))
    .slice(0, 2);

  return [...primaryContext, ...uniqueDiscovery];
};
