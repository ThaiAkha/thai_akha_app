// GENERATO DA gen-cherry-facts - NON EDITARE A MANO
// lang: it | generato: 2026-09-07
// Sorgenti: cooking_classes, class_sessions, meeting_points, business_profile,
// recipes + content_categories, dietary_profiles e i sidecar *_translations
// (campo per campo, con ricaduta sull inglese). Per cambiare un fatto: aggiorna
// il database, poi `pnpm gen-cherry-facts`.

import type { CherryFacts } from '../types';

export const CHERRY_FACTS_IT: CherryFacts = {
  "lang": "it",
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
      "title": "Corso del Mattino di cucina",
      "badge": "I più popolari",
      "priceThb": 1400,
      "currency": "THB",
      "unit": "per person",
      "startTime": "09:00",
      "endTime": "14:30",
      "durationText": "6 ore",
      "hasMarketTour": true,
      "marketTour": {
        "start": "09:00",
        "end": "10:00"
      },
      "capacityText": "12 persone per cucina, fino a 24 insieme - gruppi privati fino a 28",
      "inclusions": [
        "Ritiro e rientro presso il tuo alloggio",
        "1h tour del mercato",
        "Postazione di cucina individuale",
        "CookBook cartaceo a colori (40 pagine)",
        "Set di ingredienti in regalo per ogni studente",
        "Caffè di montagna Akha autentico illimitato",
        "Acqua fresca e vari tipi di tè",
        "Wifi gratuito, prese per caricabatterie e altro"
      ],
      "schedule": [
        {
          "label": "Ritiro in hotel incluso",
          "time": "8:15 am > 8:40 am",
          "description": "L'orario esatto dipende dalla posizione del tuo hotel. Zona Gialla: 8:20 am. Zona Verde (Old City): 8:30 am. Zona Rosa/Azzurra: 8:40 am. Per favore, attendi nella hall."
        },
        {
          "label": "Tour del mercato",
          "time": "9:00 am > 10:00 am",
          "description": "Ti porteremo al mercato locale per farti vivere lo stile di vita autentico della gente del posto. Potrai vedere e assaggiare tutti i diversi prodotti locali."
        },
        {
          "label": "Orario del corso",
          "time": "10:00 am > 2:30 pm",
          "description": "Una volta arrivato alla scuola di cucina, inizierai a preparare diversi piatti con l'aiuto del nostro istruttore Akha."
        },
        {
          "label": "Orario di rientro",
          "time": "2:30 pm > 3:00 pm",
          "description": "Rientro in hotel dopo aver mangiato i tuoi 11 deliziosi piatti."
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
      "title": "Corso del Pomeriggio di cucina",
      "badge": "Ottimo per cena",
      "priceThb": 1300,
      "currency": "THB",
      "unit": "per person",
      "startTime": "17:00",
      "endTime": "21:00",
      "durationText": "5 ore",
      "hasMarketTour": false,
      "marketTour": null,
      "capacityText": "12 persone per cucina, fino a 24 insieme - gruppi privati fino a 28",
      "inclusions": [
        "Ritiro e rientro presso il vostro alloggio",
        "Postazione di cucina individuale",
        "CookBook cartaceo a colori (40 pagine)",
        "Set regalo di ingredienti per ogni studente",
        "Caffè di montagna Akha autentico illimitato",
        "Acqua fresca e vari tipi di tè",
        "Wifi gratuito, prese per caricabatterie e altro"
      ],
      "schedule": [
        {
          "label": "Ritiro in hotel incluso",
          "time": "4:15 pm > 4:40 pm",
          "description": "L'orario esatto dipende dalla posizione del tuo hotel. Zona Gialla: 4:20 pm. Zona Verde (Old City): 4:30 pm. Zona Rosa/Azzurra: 4:40 pm. Ti preghiamo di essere pronti nella hall."
        },
        {
          "label": "Orario del corso",
          "time": "5:00 pm > 9:00 pm",
          "description": "Preparerai 11 piatti deliziosi che potrai gustare dopo ogni sessione di cucina."
        },
        {
          "label": "Orario di rientro",
          "time": "9:00 pm > 9:30 pm",
          "description": "Rientro al tuo hotel."
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
      "name": "Zona Rosa",
      "description": "Zona di pick-up estesa per gli hotel più lontani. Ti aspettiamo puntuale nella hall.",
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
      "name": "Zona Verde",
      "description": "Zona di pick-up standard, copre la Old City. Ti aspettiamo nella hall.",
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
      "name": "Zona Azzurra",
      "description": "Zona di pick-up estesa per gli hotel più lontani. Ti aspettiamo puntuale nella hall.",
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
      "name": "Zona Gialla",
      "description": "Zona molto trafficata: il pick-up è anticipato. Ti aspettiamo nella hall.",
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
      "description": "Aspetta davanti all'ingresso di Central Plaza Gate.",
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
      "description": "Aspetta sulla strada principale, davanti al cartello della fermata dell'autobus.",
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
      "name": "Aeroporto di Chiang Mai - Voli nazionali",
      "type": "pickup",
      "description": "Volo nazionale: aspetta fuori, all'uscita Gate 2. Nota: il pick-up gratuito non è incluso. Possiamo aiutarti a chiamare un taxi Grab (~150-200 THB) che paghi all'autista.",
      "dropoffDescription": "Ti lasciamo all'aeroporto di Chiang Mai, partenze nazionali. Calcola abbastanza tempo prima del volo.",
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
      "name": "Aeroporto di Chiang Mai - Voli internazionali",
      "type": "pickup",
      "description": "Volo internazionale: aspetta fuori, all'uscita Gate 8. Nota: il pick-up gratuito non è incluso. Possiamo aiutarti a chiamare un taxi Grab (~150-200 THB) che paghi all'autista.",
      "dropoffDescription": "Ti lasciamo all'aeroporto internazionale di Chiang Mai, al livello partenze del tuo terminal. Calcola abbastanza tempo prima del volo.",
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
      "name": "Stazione ferroviaria di Chiang Mai",
      "type": "pickup",
      "description": "Aspetta fuori dal Coffee and Drink Mini Mart, accanto alla torre dell'orologio.",
      "dropoffDescription": "Ti lasciamo proprio all'ingresso della stazione di Chiang Mai, sul piazzale principale: da lì raggiungi il binario in un attimo.",
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
      "description": "Aspetta sulla strada principale, davanti all'ingresso di ONE Nimman.",
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
      "description": "Aspetta sulla strada principale, davanti all'ingresso del McDonald's.",
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
      "name": "Porta Nord - B2 Hotel",
      "type": "pickup",
      "description": "Aspetta sulla strada principale, davanti al B2 Hotel.",
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
      "name": "Mercato del sabato - Wualai",
      "type": "dropoff",
      "description": "Bazar notturno di Wualai Road: apre il sabato nel tardo pomeriggio, dalle 17:00.",
      "dropoffDescription": null,
      "isDropoff": true,
      "morning": null,
      "evening": null
    },
    {
      "id": "mp_sunday_market",
      "name": "Mercato della domenica - Tha Phae",
      "type": "dropoff",
      "description": "Walking Street lungo Th Wichayanon: apre la domenica nel tardo pomeriggio, dalle 16:00.",
      "dropoffDescription": null,
      "isDropoff": true,
      "morning": null,
      "evening": null
    },
    {
      "id": "mp_school",
      "name": "Thai Akha Kitchen - Chiang Mai",
      "type": "walk_in",
      "description": "Vieni direttamente a scuola. Arriva per le 08:50 per il corso del mattino o per le 17:00 per il corso del pomeriggio.",
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
      "name": "Wat Pan Whaen (tempio)",
      "type": "walk_in",
      "description": "Punto d'incontro per il mercato del mattino. Entra e vai verso la grande pagoda bianca. Cerca il team con i grembiuli Thai Akha Kitchen.",
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
      "category": "I Piatti Tradizionali Piatti Tribali",
      "categorySlug": "authentic-akha-recipes",
      "items": [
        {
          "slug": "authentic-akha-mountain-salad-recipe",
          "name": "Insalata Fresca di Montagna Akha"
        },
        {
          "slug": "akha-spirit-detox-soup-recipe",
          "name": "Zuppa dello Spirito Akha"
        },
        {
          "slug": "traditional-akha-sapi-thong-recipe",
          "name": "Sapi Thong: Salsa di Pomodori Akha"
        }
      ]
    },
    {
      "category": "Sfiziosità Autentiche Snack Thai",
      "categorySlug": "thai-appetizers-recipes",
      "items": [
        {
          "slug": "crispy-thai-spring-rolls-recipe",
          "name": "Involtini di Primavera Fritti"
        },
        {
          "slug": "authentic-som-tum-papaya-salad-recipe",
          "name": "Insalata di Papaya"
        }
      ]
    },
    {
      "category": "Dolci Tradizionali Thai",
      "categorySlug": "traditional-thai-desserts",
      "items": [
        {
          "slug": "authentic-mango-sticky-rice-recipe",
          "name": "Mango Sticky Rice"
        },
        {
          "slug": "thai-pumpkin-coconut-milk-recipe",
          "name": "Zucca al Latte di Cocco"
        }
      ]
    },
    {
      "category": "Paste di Curry Paste di Curry",
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
      "category": "Brodi Rigeneranti Brodi & Zuppe",
      "categorySlug": "traditional-thai-soups",
      "items": [
        {
          "slug": "thai-clear-soup-egg-tofu-recipe",
          "name": "Zuppa Chiara con Tofu Morbido"
        },
        {
          "slug": "authentic-tom-kha-gai-recipe",
          "name": "Tom Kha (Latte di Cocco)"
        },
        {
          "slug": "authentic-tom-yum-goong-recipe",
          "name": "Tom Yum"
        }
      ]
    },
    {
      "category": "Il Wok & La Fiamma",
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
          "name": "Verdure Agrodolci"
        }
      ]
    },
    {
      "category": "Hand-Crafted Curry Pastes",
      "categorySlug": "curry-paste-recipes",
      "items": [
        {
          "slug": "authentic-thai-green-curry-paste-recipe",
          "name": "Pasta per Curry Verde Autentico"
        },
        {
          "slug": "authentic-thai-massaman-curry-paste-recipe",
          "name": "Autentica Pasta per Curry Massaman"
        },
        {
          "slug": "authentic-thai-panang-curry-paste-recipe",
          "name": "Pasta di Curry Panang Autentica"
        },
        {
          "slug": "authentic-thai-red-curry-paste-recipe",
          "name": "Pasta per Curry Rosso Autentica"
        }
      ]
    }
  ],
  "diets": {
    "lifestyle": [
      "Dieta regolare",
      "Dieta vegana",
      "Dieta vegetariana",
      "Dieta pescetariana",
      "Amante della carne"
    ],
    "religious": [
      "Halal friendly",
      "Kosher friendly",
      "Rastafari (Ital)",
      "Jain friendly",
      "Hindu friendly"
    ],
    "allergies": [
      "Allergia alle uova",
      "Allergia al pesce",
      "Allergia alla salsa di pesce",
      "Senza glutine",
      "Allergia alle arachidi",
      "Allergia ai frutti di mare",
      "Allergia al sesamo",
      "Allergia ai crostacei",
      "Allergia alla soia",
      "Allergia alla salsa di soia",
      "Allergia alla frutta a guscio",
      "Altre allergie"
    ]
  }
};
