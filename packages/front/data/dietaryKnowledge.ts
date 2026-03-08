
/**
 * 🍒 THAI AKHA KITCHEN - MASTER DIETARY KNOWLEDGE BASE
 * Version: 4.1 (2025-2026)
 * AI Sync: Cherry Assistant Optimized
 */

export const DIETARY_KNOWLEDGE_BASE = {
  title: "Dietary Style at Thai Akha Kitchen",
  url: "https://www.thaiakhakitchen.com/dietary-style",
  
  safetyPillars: {
    noRedMeat: "🚫 STRICT: No Pork, Beef, Buffalo, or Horse meat is allowed in our kitchen.",
    zeroContamination: "🛡️ CLEANLINESS: Since we never stock red meat, there is zero risk of cross-contamination.",
    proteins: "🍗 ALLOWED: Only high-quality Chicken Fillet and Fresh Prawns are used.",
    akhaSoup: "🥣 AKHA SOUP: Historically 100% plant-based. No meat ever used by tradition.",
    flexibility: "🔄 LAST-MINUTE: Menu selections can be changed during the market visit or via teacher discussion."
  },

  introduction: "At Thai Akha Kitchen, creating an inclusive and exciting experience for everyone is our top priority. Since 2016, we have hosted more than 42,000 customers from all over the world with diverse cultures and dietary styles.",

  // 🥘 DETAILED PROFILES (KEYS ARE LOWERCASE FOR SAFE LOOKUP)
  profiles: {
    regular: {
      id: "diet_regular",
      name: "Regular Diet",
      icon: "🍽️",
      content: "A regular diet reflects authentic Thai habits. We provide high-quality chicken, prawns, tofu, and eggs.",
      experience: "Standard authentic preparation.",
      adaptations: {}
    },
    
    vegan: {
      id: "diet_vegan",
      name: "Vegan Diet",
      icon: "🌱",
      introduction: "Chiang Mai is a vegan paradise. We ensure your experience is rich and authentic using tofu and premium plant-based sauces.",
      experience: "We use premium soy sauce and mushroom stock,tufu protain supperment to replicate the deep umami of fish and oyster sauces.",
      substitutions: [
        { original: "Chicken", substitute: "Firm Tofu / Mushrooms" },
        { original: "Shrimp", substitute: "Extra Tofu" },
        { original: "Egg", substitute: "Omitted / Extra Tofu" },
        { original: "Fish Sauce", substitute: "Premium Soy Sauce" },
        { original: "Oyster Sauce", substitute: "Mushroom Sauce" },
        { original: "Shrimp Paste (Kapi)", substitute: "Sea Salt & Roasted Herbs" }
      ],
      adaptations: {
        "Papaya Salad (Som Tam)": "No Shrimp Paste (Use Salt) / No Fish Sauce (Use Soy Sauce)",
        "Red Curry": "No Shrimp Paste (Use Salt)",
        "Green Curry": "No Shrimp Paste (Use Salt)",
        "Panang Curry": "No Shrimp Paste (Use Salt)",
        "Massaman Curry": "No Shrimp Paste (Use Salt)",
        "Pad Thai": "Omit Egg, increase Tofu portion",
        "Mango Sticky Rice": "Naturally Vegan",
        "Pumpkin in Coconut Milk": "Naturally Vegan"
      }
    },

    vegetarian: {
      id: "diet_vegetarian",
      name: "Vegetarian Diet",
      icon: "🥬",
      content: "Vegetarians enjoy all the tastes of Akha cooking using tofu and eggs while omitting meat and seafood.",
      experience: "We use tofu to replace meat and soy sauce to replace fish sauce.",
      substitutions: [
        { original: "Chicken/Shrimp", substitute: "Tofu" },
        { original: "Fish Sauce", substitute: "Soy Sauce" }
      ],
      adaptations: {
        "Red Curry": "No Shrimp Paste (Use Salt)",
        "Green Curry": "No Shrimp Paste (Use Salt)",
        "Panang Curry": "No Shrimp Paste (Use Salt)",
        "Massaman Curry": "No Shrimp Paste (Use Salt)",
        "Stir-fry Cashew Nuts": "Substitute chicken with Tofu",
        "Stir-fry Holy Basil": "Substitute chicken with Tofu"
      }
    },

    pescatarian: {
      id: "diet_pescatarian",
      name: "Pescatarian Diet",
      icon: "🐟",
      content: "Pescatarians follow a vegetarian diet plus seafood. Shrimp is common in Akha aquatic cooking.",
      experience: "We provide extra shrimp or tofu as substitutes for chicken. Fish sauce is kept for authentic flavor.",
      substitutions: [
        { original: "Chicken", substitute: "Prawns or Tofu" }
      ],
      adaptations: {
        "Stir-fry Cashew Nuts": "Substitute chicken with Prawns",
        "Stir-fry Holy Basil": "Substitute chicken with Prawns"
      }
    },

    meatlover: {
      id: "diet_meatlover",
      name: "Meat Lover",
      icon: "🍗",
      content: "Meat lovers focus on animal protein. Note: We strictly do not serve Beef or Pork.",
      experience: "You will enjoy the full, authentic flavor profile featuring chicken and prawns as the stars.",
      adaptations: {
        "Papaya Salad (Som Tam)": "Classic Style: With Dried Shrimp & Fish Sauce.",
        "Red Curry": "Authentic: Includes Shrimp Paste (Kapi) for deep flavor.",
        "Green Curry": "Authentic: Includes Shrimp Paste (Kapi) for deep flavor.",
        "Panang Curry": "Authentic: Includes Shrimp Paste (Kapi) for deep flavor.",
        "Pad Thai": "Full Protein: Served with Chicken, Prawns & Egg.",
        "Stir-fry Cashew Nuts": "Protein Boost: Prepared with Chicken and Oyster Sauce."
      }
    }
  },

  // ⚠️ ALLERGY LOGIC (KEYS MATCH UI LABELS LOWERCASED)
  allergyWarnings: {
    gluten: "Traditional Soy Sauce contains wheat. We use Fish Sauce (Naturally GF) or certified Tamari as a swap.",
    peanuts: "Peanuts are in Papaya Salad and Panang Curry. We use sunflower seeds as a crunchy substitute.",
    shellfish: "Shrimp paste is in curries. We use the 'Salt-based' adaptation for allergic guests.",
    soy: "We substitute soy sauce with fish sauce or salt to maintain the savory balance."
  }
};
