// GENERATO DA gen-cherry-facts - NON EDITARE A MANO
// lang: en | generato: 2026-09-07
// Sorgenti: cooking_classes, class_sessions, meeting_points, business_profile,
// recipes + content_categories, dietary_profiles e i sidecar *_translations
// (campo per campo, con ricaduta sull inglese). Per cambiare un fatto: aggiorna
// il database, poi `pnpm gen-cherry-facts`.

import type { CherryFacts } from '../types';

export const CHERRY_FACTS_EN: CherryFacts = {
  "lang": "en",
  "generatedAt": "2026-09-07",
  "business": {
    "name": "Thai Akha Kitchen",
    "legalName": "Thai Akha Kitchen Limited Partnership",
    "foundingYear": 2015,
    "address": "14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District, Chiang Mai 50100, Thailand",
    "telephone": "+66 61 325 4611",
    "whatsapp": "+66 61 325 4611",
    "email": "office@thaiakhakitchen.com",
    "openingHours": [
      "Mo-Su 08:00-22:00"
    ],
    "priceRange": "1300-1400 THB",
    "areaServed": [
      "Chiang Mai city"
    ],
    "rating": {
      "value": "5.0",
      "count": "8500"
    },
    "socials": [
      {
        "type": "instagram",
        "url": "https://www.instagram.com/thaiakhakitchen/"
      },
      {
        "type": "youtube",
        "url": "https://www.youtube.com/channel/UC4oOjPPQ54PdlSrcoH9YU1A"
      },
      {
        "type": "pinterest",
        "url": "https://www.pinterest.com/thaiakhakitchen/"
      },
      {
        "type": "x",
        "url": "https://x.com/ThaiAkhaKitchen"
      },
      {
        "type": "tripadvisor",
        "url": "https://www.tripadvisor.com/Attraction_Review-g293917-d8614455-Reviews-Thai_Akha_Cooking_School-Chiang_Mai.html"
      },
      {
        "type": "maps",
        "url": "https://maps.app.goo.gl/kwgXVPjR6vhTVeXV7"
      }
    ]
  },
  "classes": [
    {
      "id": "morning_class",
      "title": "Morning Cooking Class",
      "badge": "Most Popular",
      "priceThb": 1400,
      "currency": "THB",
      "unit": "per person",
      "startTime": "09:00",
      "endTime": "14:30",
      "durationText": "6 h",
      "hasMarketTour": true,
      "marketTour": {
        "start": "09:00",
        "end": "10:00"
      },
      "capacityText": "12 per kitchen, up to 24 together · private groups up to 28",
      "inclusions": [
        "Pick-up from/to your place of stay",
        "1h Market Tour",
        "Individual cooking station",
        "Full-color paper CookBook (40 pages)",
        "Ingredient gift set for every Student",
        "Unlimited authentic Akha mountain coffee",
        "Fresh water, and different teas",
        "Free Wifi, charger plugs, and more are available"
      ],
      "schedule": [
        {
          "label": "Pick-Up Service Included",
          "time": "8:15 am > 8:40 am",
          "description": "Exact time depends on your hotel location. Yellow Zone: 8:20 am. Green Zone (Old City): 8:30 am. Pink/Azure Zone: 8:40 am. Please be ready in the lobby."
        },
        {
          "label": "Market Visit Tour",
          "time": "9:00 am > 10:00 am",
          "description": "We will take you to the local market, so you can experience the real lifestyle of the local people. See and taste all the different local products."
        },
        {
          "label": "Class time",
          "time": "10:00 am > 2:30 pm",
          "description": "Once you arrive at the cooking school, you’ll begin to prepare a variety of dishes with the help of our Akha instructor."
        },
        {
          "label": "Drop-off time",
          "time": "2:30 pm > 3:00 pm",
          "description": "Return to your hotel after eating your 11 delicious dishes."
        }
      ],
      "walkIn": [
        {
          "name": "Thai Akha Kitchen (School)",
          "time": "08:50",
          "note": "Our Cooking School is located just a 5-minute walk from Chiang Mai South Gate."
        },
        {
          "name": "Wat Pan Whaen (Temple)",
          "time": "09:00",
          "note": "Where we park our taxi before starting the market tour."
        }
      ]
    },
    {
      "id": "evening_class",
      "title": "Evening Cooking Class",
      "badge": "Great for Dinner",
      "priceThb": 1300,
      "currency": "THB",
      "unit": "per person",
      "startTime": "17:00",
      "endTime": "21:00",
      "durationText": "5 h",
      "hasMarketTour": false,
      "marketTour": null,
      "capacityText": "12 per kitchen, up to 24 together · private groups up to 28",
      "inclusions": [
        "Pick-up from/to your place of stay",
        "Individual cooking station",
        "Full-color paper CookBook (40 pages)",
        "Ingredient gift set for every Student",
        "Unlimited authentic Akha mountain coffee",
        "Fresh water, and different teas",
        "Free Wifi, charger plugs, and more are available"
      ],
      "schedule": [
        {
          "label": "Pick-Up service included",
          "time": "4:15 pm > 4:40 pm",
          "description": "Exact time depends on your hotel location. Yellow Zone: 4:20 pm. Green Zone (Old City): 4:30 pm. Pink/Azure Zone: 4:40 pm. Please be ready in the lobby."
        },
        {
          "label": "Class time",
          "time": "5:00 pm > 9:00 pm",
          "description": "Create 11 delicious dishes that you will get to eat after each cooking session."
        },
        {
          "label": "Drop off time",
          "time": "9:00 pm > 9:30 pm",
          "description": "Return to your hotel."
        }
      ],
      "walkIn": [
        {
          "name": "Thai Akha Kitchen (School)",
          "time": "17:00",
          "note": "Meet us at our kitchen by 5:00 pm. Our Cooking School is located just a 5-minute walk from Chiang Mai South Gate."
        }
      ]
    }
  ],
  "pickupZones": [
    {
      "id": "pink",
      "name": "Pink Area",
      "description": "Extended pickup area for outer hotels. Please be ready in the lobby on time.",
      "morning": {
        "from": "08:40",
        "to": "09:00"
      },
      "evening": {
        "from": "16:40",
        "to": "17:00"
      }
    },
    {
      "id": "green",
      "name": "Green Area",
      "description": "Standard pickup area covering the Old City. Please be ready in the lobby.",
      "morning": {
        "from": "08:30",
        "to": "09:00"
      },
      "evening": {
        "from": "16:30",
        "to": "17:00"
      }
    },
    {
      "id": "azure",
      "name": "Azure Area",
      "description": "Extended pickup area for outer hotels. Please be ready in the lobby on time.",
      "morning": {
        "from": "08:40",
        "to": "09:00"
      },
      "evening": {
        "from": "16:40",
        "to": "17:00"
      }
    },
    {
      "id": "yellow",
      "name": "Yellow Area",
      "description": "High traffic zone requiring an earlier pickup. Please be ready in the lobby.",
      "morning": {
        "from": "08:20",
        "to": "08:40"
      },
      "evening": {
        "from": "16:20",
        "to": "16:40"
      }
    }
  ],
  "meetingPoints": [
    {
      "id": "mp_cen_airport",
      "name": "Central Airport Plaza",
      "type": "pickup",
      "description": "Wait in front of the entrance to Central Plaza Gate.",
      "dropoffDescription": null,
      "isDropoff": false,
      "morning": {
        "from": "08:20",
        "to": "08:30"
      },
      "evening": {
        "from": "16:20",
        "to": "16:30"
      }
    },
    {
      "id": "mp_central_festival",
      "name": "Central Festival",
      "type": "pickup",
      "description": "Wait on the main street in front of the BUS Stop Sign.",
      "dropoffDescription": null,
      "isDropoff": false,
      "morning": {
        "from": "08:15",
        "to": "08:20"
      },
      "evening": {
        "from": "16:15",
        "to": "16:20"
      }
    },
    {
      "id": "mp_airport_gate2",
      "name": "Chiang Mai Airport - Domestic",
      "type": "pickup",
      "description": "Domestic flight: Wait outside exit Gate 2. Note: Free pickup not included. We can help arrange a Grab taxi (~150-200 THB) paid to the driver.",
      "dropoffDescription": "We drop you at Chiang Mai Airport, Domestic Departures. Please allow enough time before your flight.",
      "isDropoff": true,
      "morning": {
        "from": "08:20",
        "to": "08:30"
      },
      "evening": {
        "from": "16:20",
        "to": "16:30"
      }
    },
    {
      "id": "mp_airport_gate1",
      "name": "Chiang Mai Airport - International",
      "type": "pickup",
      "description": "International flight: Wait outside exit Gate 8. Note: Free pickup not included. We can help arrange a Grab taxi (~150-200 THB) paid to the driver.",
      "dropoffDescription": "We drop you at Chiang Mai International Airport, at the Departures level for your terminal. Please allow enough time before your flight.",
      "isDropoff": true,
      "morning": {
        "from": "08:20",
        "to": "08:30"
      },
      "evening": {
        "from": "16:20",
        "to": "16:30"
      }
    },
    {
      "id": "mp_train_station",
      "name": "Chiang Mai Train Station",
      "type": "pickup",
      "description": "Wait outside of Coffee and Drink Mini Mart next to the Clock's tower.",
      "dropoffDescription": "We drop you right at the Chiang Mai Train Station entrance, by the main forecourt - easy to reach your platform from there.",
      "isDropoff": true,
      "morning": {
        "from": "08:20",
        "to": "08:30"
      },
      "evening": {
        "from": "16:20",
        "to": "16:30"
      }
    },
    {
      "id": "mp_maya",
      "name": "MAYA Shopping Center",
      "type": "pickup",
      "description": "Wait on the main street in front of the entrance to ONE Nimman.",
      "dropoffDescription": null,
      "isDropoff": false,
      "morning": {
        "from": "08:20",
        "to": "08:30"
      },
      "evening": {
        "from": "16:20",
        "to": "16:30"
      }
    },
    {
      "id": "mp_thaphae",
      "name": "McDonald's - Tha Phae Gate",
      "type": "pickup",
      "description": "Wait on the main street in front of the entrance to McDonald's.",
      "dropoffDescription": null,
      "isDropoff": false,
      "morning": {
        "from": "08:30",
        "to": "09:00"
      },
      "evening": {
        "from": "16:30",
        "to": "17:00"
      }
    },
    {
      "id": "mp_north_gate_b2",
      "name": "North Gate - B2 Hotel",
      "type": "pickup",
      "description": "Wait on the main street in front of B2 Hotel.",
      "dropoffDescription": null,
      "isDropoff": false,
      "morning": {
        "from": "08:30",
        "to": "09:00"
      },
      "evening": {
        "from": "16:30",
        "to": "17:00"
      }
    },
    {
      "id": "mp_saturday_market",
      "name": "Saturday Market - Wualai",
      "type": "dropoff",
      "description": "Wualai Road Night Bazaar - open Saturday evenings from 17:00.",
      "dropoffDescription": null,
      "isDropoff": true,
      "morning": null,
      "evening": null
    },
    {
      "id": "mp_sunday_market",
      "name": "Sunday Market - Tha Phae",
      "type": "dropoff",
      "description": "Walking Street along Th Wichayanon - open Sunday evenings from 16:00.",
      "dropoffDescription": null,
      "isDropoff": true,
      "morning": null,
      "evening": null
    },
    {
      "id": "mp_school",
      "name": "Thai Akha Kitchen - Chiang Mai",
      "type": "walk_in",
      "description": "Go directly to school. Please arrive by 8:50 am for morning class or 5:00 pm for evening class.",
      "dropoffDescription": null,
      "isDropoff": false,
      "morning": {
        "from": "08:50",
        "to": null
      },
      "evening": {
        "from": "16:50",
        "to": null
      }
    },
    {
      "id": "mp_wat_pan_whaen",
      "name": "Wat Pan Whaen (Temple)",
      "type": "walk_in",
      "description": "Morning market meeting point. Walk inside near the big white Pagoda. Look for crews in Thai Akha Kitchen aprons.",
      "dropoffDescription": null,
      "isDropoff": false,
      "morning": {
        "from": "08:50",
        "to": "09:00"
      },
      "evening": null
    }
  ],
  "dishes": [
    {
      "category": "The Authentic Tribal Dishes",
      "categorySlug": "authentic-akha-recipes",
      "items": [
        {
          "slug": "authentic-akha-mountain-salad-recipe",
          "name": "Akha Mountain Fresh Salad"
        },
        {
          "slug": "akha-spirit-detox-soup-recipe",
          "name": "Akha Spirit Soup"
        },
        {
          "slug": "traditional-akha-sapi-thong-recipe",
          "name": "Sapi Thong: Akha Tomato Dipping Sauce"
        }
      ]
    },
    {
      "category": "Fun Authentic Thai Snacks",
      "categorySlug": "thai-appetizers-recipes",
      "items": [
        {
          "slug": "crispy-thai-spring-rolls-recipe",
          "name": "Fried Spring Rolls"
        },
        {
          "slug": "authentic-som-tum-papaya-salad-recipe",
          "name": "Papaya Salad"
        }
      ]
    },
    {
      "category": "Sweet Traditional Thai Desserts",
      "categorySlug": "traditional-thai-desserts",
      "items": [
        {
          "slug": "authentic-mango-sticky-rice-recipe",
          "name": "Mango Sticky Rice"
        },
        {
          "slug": "thai-pumpkin-coconut-milk-recipe",
          "name": "Pumpkin in Coconut Milk"
        }
      ]
    },
    {
      "category": "Hand-Pounded Curry Pastes",
      "categorySlug": "authentic-thai-curry-recipes",
      "items": [
        {
          "slug": "authentic-thai-green-curry-recipe",
          "name": "Thai Green Curry"
        },
        {
          "slug": "authentic-thai-massaman-curry-recipe",
          "name": "Thai Massaman Curry"
        },
        {
          "slug": "authentic-thai-panang-curry-recipe",
          "name": "Thai Panang Curry"
        },
        {
          "slug": "authentic-thai-red-curry-recipe",
          "name": "Thai Red Curry"
        }
      ]
    },
    {
      "category": "Healing Restorative Broths & Soups",
      "categorySlug": "traditional-thai-soups",
      "items": [
        {
          "slug": "thai-clear-soup-egg-tofu-recipe",
          "name": "Clear Soup with Soft Tofu"
        },
        {
          "slug": "authentic-tom-kha-gai-recipe",
          "name": "Tom Kha (Coconut Milk)"
        },
        {
          "slug": "authentic-tom-yum-goong-recipe",
          "name": "Tom Yum"
        }
      ]
    },
    {
      "category": "The Wok & The Flame",
      "categorySlug": "thai-stir-fry-recipes",
      "items": [
        {
          "slug": "authentic-pad-thai-recipe-chiang-mai",
          "name": "Pad Thai"
        },
        {
          "slug": "authentic-pad-kra-pao-recipe",
          "name": "Stir Fry Holy Basil"
        },
        {
          "slug": "thai-chicken-cashew-nuts-recipe",
          "name": "Stir-fry Cashew Nuts"
        },
        {
          "slug": "thai-sweet-and-sour-vegetable-recipe",
          "name": "Sweet and Sour Vegetables"
        }
      ]
    },
    {
      "category": "Hand-Crafted Curry Pastes",
      "categorySlug": "curry-paste-recipes",
      "items": [
        {
          "slug": "authentic-thai-green-curry-paste-recipe",
          "name": "Authentic Green Curry Paste"
        },
        {
          "slug": "authentic-thai-massaman-curry-paste-recipe",
          "name": "Authentic Massaman Curry Paste"
        },
        {
          "slug": "authentic-thai-panang-curry-paste-recipe",
          "name": "Authentic Panang Curry Paste"
        },
        {
          "slug": "authentic-thai-red-curry-paste-recipe",
          "name": "Authentic Red Curry Paste"
        }
      ]
    }
  ],
  "diets": {
    "lifestyle": [
      "Regular Diet",
      "Vegan Diet",
      "Vegetarian Diet",
      "Pescatarian Diet",
      "Meat-Lover"
    ],
    "religious": [
      "Halal Friendly",
      "Kosher Friendly",
      "Rastafari (Ital)",
      "Jain Friendly",
      "Hindu Friendly"
    ],
    "allergies": [
      "Egg Allergy",
      "Fish Allergy",
      "Fish Sauce Allergy",
      "Gluten-Free",
      "Peanut Allergy",
      "Seafood Allergy",
      "Sesame Allergy",
      "Shellfish Allergy",
      "Soy Allergy",
      "Soy Sauce Allergy",
      "Tree Nut Allergy",
      "Other Allergies"
    ]
  }
};
