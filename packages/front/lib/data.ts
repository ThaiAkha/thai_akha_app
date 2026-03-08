
import { classData, commonMetadata } from '../data/classData.ts';

/**
 * THAI AKHA KITCHEN - CENTRAL DATA REPOSITORY
 * Consolidating JSON data into TS constants to ensure maximum compatibility 
 * with browser ES modules and fix path resolution errors.
 */

export const AkhaCultureData = {
  "sections": [
    {
      "id": "hill_tribes_overview",
      "tag": "REGIONAL_CONTEXT", // 👈 AGGIUNGI QUESTA RIGA
      "title": "The Highland Mosaic",
      "content": "Northern Thailand is a cultural crossroads for several ethnic minorities including Karen, Hmong, Lahu, Akha, Mien, and Lisu. Each has a distinct history and spiritual framework."
    },
    {
      "id": "historical_roots",
      "tag": "HISTORICAL_ROOTS", // 👈 Meglio usare questo per la storia
      "title": "The Journey from the Tibetan Plateau",
      "content": "The Akha are a Tibeto-Burman group who migrated from the high-altitude regions of the Tibetan Plateau through Yunnan, Myanmar, and Laos, reaching Thailand in the early 1900s."
    },
    {
      "id": "akha_zang",
      "tag": "CULTURAL_IDENTITY", // 👈 Meglio questo per lo "Way of Life"
      "title": "The Akha Way (Akha Zang)",
      "content": "Akha Zang is an oral constitution integrating religion, law, and social custom. It maintains the 'Pyaw' (balance) between human and spirit worlds."
    }
  ]
};

export const CookingClassData = {
  "classes": {
    "morning": {
      "id": classData.morning.id,
      "title": classData.morning.title,
      "price": { "amount": classData.morning.price, "currency": classData.morning.currency },
      "schedule": "9:00 AM - 2:30 PM",
      "features": classData.morning.tags
    },
    "evening": {
      "id": classData.evening.id,
      "title": classData.evening.title,
      "price": { "amount": classData.evening.price, "currency": classData.evening.currency },
      "schedule": "5:00 PM - 9:00 PM",
      "features": classData.evening.tags
    }
  },
  "common": {
    "metadata": { "currency": commonMetadata.currency, "location": commonMetadata.location }
  }
};

export const AkhaQuiz = [
    {
        "question": "What is the name of the Akha 'Women's New Year' celebration?",
        "options": ["Songkran", "Loi Krathong", "Yehkuja", "Pii Mai"],
        "correctAnswer": "Yehkuja",
        "funFact": "Yehkuja is a 4-day festival where women swing on a giant, sacred swing to celebrate fertility!"
    },
    {
        "question": "What is strictly forbidden for outsiders to do at an Akha Spirit Gate?",
        "options": ["Take a photo", "Touch it", "Walk through it", "Leave an offering"],
        "correctAnswer": "Touch it",
        "funFact": "Touching the 'Loku-Pah' or Spirit Gate is a major taboo as it protects the village's spiritual health."
    }
];

export const HotelList = {
    "features": [
        { "properties": { "name": "The Inside House", "zone": "Yellow" } }
    ]
};
