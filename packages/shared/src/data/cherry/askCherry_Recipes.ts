// ─────────────────────────────────────────────────────────────────────────────
// askCherry — Recipes — Menu, Diets, Allergies, Akha dishes, Curries
// Modulo della ragnatela Cherry. Aggiungi qui nuovi nodi per questo tema.
// Merge automatico in chatFlowData.ts via spread.
// ─────────────────────────────────────────────────────────────────────────────
import type { ChatNode } from './chatFlowTypes';

export const flowRecipes: Record<string, ChatNode> = {
  MENU_DIET: {
    id: 'MENU_DIET',
    shortLabel: '🍽️ Menu & Diet',
    level: 2, // T5 — selettore dieta: vive a L2 (filtrato), mai entry/L1 neutro
    priority: 2,
    message: "**Menu & Dietary Adaptations**\n\nOver 20% of our guests follow a special diet — vegan, vegetarian, gluten-free, or allergy-specific — and we adapt every single recipe for each person in the class. Nothing is pre-made or served from a package: all ingredients are fresh from the morning market, and every substitution is prepared on the day.\n\nThe menu includes Akha mountain specialties (all plant-based), your choice of curry (paste made by hand), a soup, a stir-fry, appetisers, and dessert. Tell me about your diet and I'll show you exactly what your class menu looks like.",
    options: [
      { label: '🌱 Vegan',            nextId: 'SET_VEGAN',       action: 'set_diet', data: { diet: 'vegan' },       priority: 2 },
      { label: '🥬 Vegetarian',       nextId: 'SET_VEGETARIAN',  action: 'set_diet', data: { diet: 'vegetarian' },  priority: 2 },
      { label: '🍗 Regular / Other',  nextId: 'SET_REGULAR',     action: 'set_diet', data: { diet: 'regular' },     priority: 2 },
      { label: '⚠️ I have Allergies', nextId: 'ALLERGY_INFO',    priority: 2 },
    ],
  },

  SET_VEGAN: {
    id: 'SET_VEGAN',
    level: 2, // T5 — esito selettore dieta → L2 (filtrato)
    priority: 2,
    message: "**Your diet is set to Vegan — saved!**\n\nChiang Mai is one of Southeast Asia's most vegan-friendly cities, and our kitchen has been adapting for plant-based guests since we opened. Every substitution is thoughtful: chicken and shrimp become silken or firm tofu depending on the dish, fish sauce becomes our house-made soy-based alternative, and egg in desserts is replaced with coconut-based binders.\n\nThe three Akha mountain specialties — Akha Mountain Salad, Sapi Thong chili paste, and Akha Herbal Soup — are 100% vegan by tradition and need no adaptation at all. All four curry options are also available in a fully plant-based version.",
    options: [
      { label: '🌿 Akha Specialties',    nextId: 'AKHA_DISHES_INFO',     priority: 2 },
      { label: '🍛 Curry Options',       nextId: 'CURRY_SELECTION_INFO', priority: 2 },
      { label: '📰 Full Vegan Guide',    nextId: 'NEWS_DIET_GUIDE',      priority: 2 },
      { label: '📅 Open Booking Page',   nextId: 'BOOK_NOW',             action: 'nav_booking', priority: 1 },
    ],
  },

  SET_VEGETARIAN: {
    id: 'SET_VEGETARIAN',
    level: 2, // T5 — esito selettore dieta → L2 (filtrato)
    priority: 2,
    message: "**Your diet is set to Vegetarian — saved!**\n\nFor vegetarians, we remove all meat and seafood and substitute with tofu, eggs (where appropriate), and fresh vegetables. Fish sauce is the one item left to your preference: if you want to avoid it completely, just let the chef know on the day and we'll use our soy-based alternative throughout.\n\nAll Akha mountain specialties are naturally plant-based and require no changes. The curry pastes themselves contain no animal products — it's only the protein and sauce additions that we adjust. You'll cook a full, satisfying menu without any compromise on flavour.",
    options: [
      { label: '🌿 Akha Specialties',    nextId: 'AKHA_DISHES_INFO',     priority: 2 },
      { label: '🍛 Curry Options',       nextId: 'CURRY_SELECTION_INFO', priority: 2 },
      { label: '📰 Full Diet Guide',     nextId: 'NEWS_DIET_GUIDE',      priority: 2 },
      { label: '📅 Open Booking Page',   nextId: 'BOOK_NOW',             action: 'nav_booking', priority: 1 },
    ],
  },

  SET_REGULAR: {
    id: 'SET_REGULAR',
    level: 2, // T5 — esito selettore dieta → L2 (filtrato)
    priority: 2,
    message: "**Your diet is set to Regular — saved!**\n\nIn Northern Thai cooking, the main proteins are chicken and shrimp — beef is rarely used in this region. You'll cook with the same ingredients our chefs use at home: fresh galangal, lemongrass, kaffir lime leaf, and Akha wild pepper (Mak Khen) that you won't find in southern Thai cuisine.\n\nIf you're pescatarian, we'll naturally lean toward shrimp-based dishes. If you prefer more chicken, just tell the chef. The menu is flexible and personalised — this isn't a fixed group meal, it's your class.",
    options: [
      { label: '🌿 Akha Specialties',    nextId: 'AKHA_DISHES_INFO',     priority: 2 },
      { label: '🍛 Curry Options',       nextId: 'CURRY_SELECTION_INFO', priority: 2 },
      { label: '🌶️ Spice Levels Guide',  nextId: 'NEWS_SPICE_GUIDE',     priority: 2 },
      { label: '📅 Open Booking Page',   nextId: 'BOOK_NOW',             action: 'nav_booking', priority: 1 },
    ],
  },

  ALLERGY_INFO: {
    id: 'ALLERGY_INFO',
    shortLabel: '⚠️ Allergies',
    level: 2, // T5 — selettore allergie: vive a L2 (filtrato), mai entry/L1 neutro
    priority: 2,
    message: "**Allergies & Intolerances**\n\nSince 2016 we have welcomed over 42,000 guests — many with serious allergies and intolerances. We do not use pre-packaged sauces or pastes, which means we have full control over every ingredient in every dish.\n\nCommon allergies we regularly accommodate:\n\n- 🥜 Peanuts\n- 🌾 Gluten\n- 🦐 Shellfish\n- 🥛 Dairy\n- 🥚 Egg\n\nFor severe allergies, please add a note in your booking so we can prepare a dedicated workspace and cross-check all ingredients before the class starts. We take this seriously — your safety is more important than any recipe.",
    options: [
      { label: '📰 Our Allergy Protocols', nextId: 'NEWS_ALLERGY_GUIDE', priority: 2 },
      { label: '🌱 Vegan Options',         nextId: 'SET_VEGAN',          action: 'set_diet', data: { diet: 'vegan' }, priority: 2 },
      { label: '🍽️ See the Menu',          nextId: 'AKHA_DISHES_INFO',   priority: 2 },
      { label: '☀️ About the Classes',     nextId: 'INFO_CLASSES',       priority: 1 },
    ],
  },

  AKHA_DISHES_INFO: {
    id: 'AKHA_DISHES_INFO',
    shortLabel: '🌿 Akha Dishes',
    priority: 2,
    message: "**The Three Akha Mountain Specialties**\n\nThese three recipes come directly from Akha highland tradition and are not found in mainstream Thai restaurants. They are 100% plant-based by nature — no adaptation needed.\n\nThe **Akha Mountain Salad** is a fresh, oil-free combination of cucumber, tomatoes, lime, and roasted peanuts. **Sapi Thong** is the essential Akha chili paste, hand-pounded in the mortar with wild Mak Khen pepper. The **Akha Herbal Soup** uses only fresh mountain vegetables in a clear, purifying broth — by Akha tradition, no meat ever enters this soup.\n\nAll three are part of every class and represent the most distinctive part of the curriculum.",
    options: [
      { label: '🥗 Akha Mountain Salad',  nextId: 'AKHA_SALAD_DETAIL',  priority: 2 },
      { label: '🌶️ Spice Levels',         nextId: 'NEWS_SPICE_GUIDE',   priority: 2 },
      { label: '🌶️ Sapi Thong',           nextId: 'SAPI_THONG_DETAIL',  priority: 2 },
      { label: '🍵 Akha Herbal Soup',     nextId: 'AKHA_SOUP_DETAIL',   priority: 2 },
    ],
  },

  AKHA_SALAD_DETAIL: {
    id: 'AKHA_SALAD_DETAIL',
    priority: 2,
    message: "**Akha Mountain Salad**\n\nA deceptively simple dish that embodies the Akha food-as-medicine philosophy. The ingredients are cucumber, ripe tomatoes, fresh lime juice, roasted ground peanuts, green onions, coriander, and a pinch of dried chili — no oil, no heat, no cooking required.\n\nWhat makes it distinctly Akha is the absence of fish sauce (unlike central Thai salads) and the use of lime as the sole acid. Each ingredient has a traditional medicinal role: cucumber cools the body, lime stimulates digestion, fresh herbs restore energy after fieldwork. You learn to prepare and dress it by hand during class.",
    options: [
      { label: '🍽️ See All Recipes',       nextId: 'AKHA_SALAD_DETAIL', action: 'nav_menu',  priority: 2 },
      { label: '🌶️ Sapi Thong',            nextId: 'SAPI_THONG_DETAIL', priority: 2 },
      { label: '🍵 Akha Herbal Soup',      nextId: 'AKHA_SOUP_DETAIL',  priority: 2 },
      { label: '🍛 Curry Selection',       nextId: 'CURRY_SELECTION_INFO', priority: 2 },
    ],
  },

  SAPI_THONG_DETAIL: {
    id: 'SAPI_THONG_DETAIL',
    priority: 2,
    message: "**Sapi Thong — The Akha Chili Paste**\n\nSapi Thong is the cornerstone of Akha cooking — a chili paste made by hand-pounding dried chilies, garlic, shallots, and wild Mak Khen pepper (a fragrant berry unique to highland Akha cuisine) in a heavy stone mortar. It is never blended. The slow, rhythmic pounding releases oils and creates a smoky depth that a blender physically cannot replicate.\n\nIn Akha households, Sapi Thong is made fresh every morning and served as a condiment alongside rice and vegetables. During class, each student pounds their own paste — it's one of the most physical and satisfying moments of the experience. The aroma when the wild pepper hits the mortar is unforgettable.",
    options: [
      { label: '📖 Read: Sapi Thong Story', nextId: 'AKHA_PHILOSOPHY_L1', action: 'nav_culture', data: { slug: 'akha-sapi-thong-spice-philosophy' }, priority: 3 },
      { label: '🥗 Akha Mountain Salad',    nextId: 'AKHA_SALAD_DETAIL',  priority: 2 },
      { label: '🍵 Akha Herbal Soup',       nextId: 'AKHA_SOUP_DETAIL',   priority: 2 },
      { label: '🍛 Curry Selection',        nextId: 'CURRY_SELECTION_INFO', priority: 2 },
    ],
  },

  AKHA_SOUP_DETAIL: {
    id: 'AKHA_SOUP_DETAIL',
    priority: 2,
    message: "**Akha Herbal Soup**\n\n⚠️ Absolute rule in Akha tradition: no meat ever enters this soup — not even broth. The base is pure water with mountain vegetables, wild herbs, and a light seasoning of salt and dried spices. The result is a clear, gently fragrant broth that Akha families drink to restore the body after heavy fieldwork or illness.\n\nThe vegetables used change with the season and depend on what the morning market offers. You'll learn to identify the herbs by smell before they go into the pot. This soup is one of the most medically significant dishes in the Akha repertoire — and one of the most surprising for guests who expect bold Thai flavours.",
    options: [
      { label: '🍽️ See All Recipes',       nextId: 'AKHA_SOUP_DETAIL',   action: 'nav_menu',  priority: 2 },
      { label: '🥗 Akha Mountain Salad',   nextId: 'AKHA_SALAD_DETAIL',  priority: 2 },
      { label: '🌶️ Sapi Thong',            nextId: 'SAPI_THONG_DETAIL',  priority: 2 },
      { label: '🍛 Curry Selection',       nextId: 'CURRY_SELECTION_INFO', priority: 2 },
    ],
  },

  CURRY_SELECTION_INFO: {
    id: 'CURRY_SELECTION_INFO',
    shortLabel: '🍛 Curries',
    priority: 2,
    message: "**Choose Your Curry — All Pastes Made Fresh**\n\nEvery curry paste is pounded by hand in class using a stone mortar — no jars, no powders, no shortcuts. You'll learn the difference between wet and dry pastes, which spices go in first, and why the order of pounding matters.\n\n- 🔴 **Red Curry** — classic, medium spice\n- 🟢 **Green Curry** — the spiciest, most aromatic\n- 🟤 **Massaman** — Persian-influenced, mild and rich\n- 🟡 **Panang** — thick, creamy, with pounded peanuts\n\nAll four are available in vegan, vegetarian, or regular versions depending on your diet profile.",
    options: [
      { label: '🔴 Red Curry',        nextId: 'CURRY_RED_DETAIL',      priority: 2 },
      { label: '🟢 Green Curry',      nextId: 'CURRY_GREEN_DETAIL',    priority: 2 },
      { label: '🟤 Massaman Curry',   nextId: 'CURRY_MASSAMAN_DETAIL', priority: 2 },
      { label: '🟡 Panang Curry',     nextId: 'CURRY_PANANG_DETAIL',   priority: 2 },
    ],
  },

  CURRY_RED_DETAIL: {
    id: 'CURRY_RED_DETAIL',
    priority: 2,
    message: "**Red Curry — Gaeng Phet**\n\nThe most iconic Thai curry and the one most guests choose first. The paste is built from dried long red chilies (soaked and drained), lemongrass, galangal, kaffir lime zest, coriander root, garlic, and shallots — all pounded together for 15 to 20 minutes until completely smooth.\n\nCooked in coconut milk with your choice of protein or tofu, Thai eggplant, and Thai basil. Medium spice level — enough warmth to feel it, balanced by the coconut milk. A good entry point for guests who have never made curry from scratch. The difference between this and a paste-from-a-jar is extraordinary.",
    options: [
      { label: '🍽️ See All Recipes',  nextId: 'CURRY_RED_DETAIL',     action: 'nav_menu',  priority: 2 },
      { label: '🟢 Green Curry',      nextId: 'CURRY_GREEN_DETAIL',    priority: 2 },
      { label: '🟤 Massaman Curry',   nextId: 'CURRY_MASSAMAN_DETAIL', priority: 2 },
      { label: '🟡 Panang Curry',     nextId: 'CURRY_PANANG_DETAIL',   priority: 2 },
    ],
  },

  CURRY_GREEN_DETAIL: {
    id: 'CURRY_GREEN_DETAIL',
    priority: 2,
    message: "**Green Curry — Gaeng Keow Wan**\n\nThe spiciest and most aromatic curry on the menu — the green colour comes from fresh green chilies, Thai basil, and coriander, pounded together with lemongrass, kaffir lime leaf, galangal, and white pepper.\n\nUnlike the red curry (which uses dried chilies), the green paste must be made entirely from fresh ingredients and used immediately — it doesn't keep. This makes it one of the most satisfying to cook from scratch. Finished in thin coconut milk with Thai eggplant, baby corn, and fragrant basil leaves added at the last moment to preserve their colour. Choose this if you enjoy bold, herbaceous heat.",
    options: [
      { label: '🍽️ See All Recipes',  nextId: 'CURRY_GREEN_DETAIL',   action: 'nav_menu',  priority: 2 },
      { label: '🔴 Red Curry',        nextId: 'CURRY_RED_DETAIL',      priority: 2 },
      { label: '🟤 Massaman Curry',   nextId: 'CURRY_MASSAMAN_DETAIL', priority: 2 },
      { label: '🟡 Panang Curry',     nextId: 'CURRY_PANANG_DETAIL',   priority: 2 },
    ],
  },

  CURRY_MASSAMAN_DETAIL: {
    id: 'CURRY_MASSAMAN_DETAIL',
    priority: 2,
    message: "**Massaman Curry — Gaeng Massaman**\n\nThe most unusual Thai curry — its flavours trace a historic spice trade route from Persia through the Malay Peninsula to Thailand. The paste includes cinnamon, cardamom, cloves, star anise, cumin, and dried chilies alongside the standard Thai aromatics.\n\nMassaman is the mildest of the four — rich, slightly sweet, and deeply comforting with potato or sweet potato, roasted peanuts, and thick coconut cream. The spice blend means it tastes almost more like a tagine than a Thai curry. Excellent for guests who find standard Thai curries too spicy, and one of the most rewarding to make because of the number of spices you learn to identify by smell.",
    options: [
      { label: '🍽️ See All Recipes',  nextId: 'CURRY_MASSAMAN_DETAIL', action: 'nav_menu', priority: 2 },
      { label: '🔴 Red Curry',        nextId: 'CURRY_RED_DETAIL',      priority: 2 },
      { label: '🟢 Green Curry',      nextId: 'CURRY_GREEN_DETAIL',    priority: 2 },
      { label: '🟡 Panang Curry',     nextId: 'CURRY_PANANG_DETAIL',   priority: 2 },
    ],
  },

  CURRY_PANANG_DETAIL: {
    id: 'CURRY_PANANG_DETAIL',
    priority: 2,
    message: "**Panang Curry — Gaeng Panang**\n\nThe thickest and creamiest curry on the menu. Roasted peanuts are pounded directly into the paste, giving it a nutty richness unlike any other Thai curry. Finished in thick coconut cream (not coconut milk) with kaffir lime leaves chiffonaded on top — it's more of a rich sauce than a soupy curry.\n\nPanang has a concentrated flavour — mild-to-medium spice, deeply savoury, with a subtle sweetness from the coconut cream and peanuts. It clings to the protein rather than sitting in a broth. A great choice for guests who prefer something substantial and less liquid. Also one of the most photogenic dishes of the class.",
    options: [
      { label: '🍽️ See All Recipes',  nextId: 'CURRY_PANANG_DETAIL',  action: 'nav_menu',  priority: 2 },
      { label: '🔴 Red Curry',        nextId: 'CURRY_RED_DETAIL',      priority: 2 },
      { label: '🟢 Green Curry',      nextId: 'CURRY_GREEN_DETAIL',    priority: 2 },
      { label: '🟤 Massaman Curry',   nextId: 'CURRY_MASSAMAN_DETAIL', priority: 2 },
    ],
  },
};
