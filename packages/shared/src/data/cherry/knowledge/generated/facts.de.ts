// GENERATO DA gen-cherry-facts - NON EDITARE A MANO
// lang: de | generato: 2026-09-07
// Sorgenti: cooking_classes, class_sessions, meeting_points, business_profile,
// recipes + content_categories, dietary_profiles e i sidecar *_translations
// (campo per campo, con ricaduta sull inglese). Per cambiare un fatto: aggiorna
// il database, poi `pnpm gen-cherry-facts`.

import type { CherryFacts } from '../types';

export const CHERRY_FACTS_DE: CherryFacts = {
  "lang": "de",
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
      "title": "Kochkurs am Vormittag",
      "badge": "Am beliebtesten",
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
      "capacityText": "12 pro Küche, bis zu 24 gemeinsam · private Gruppen bis 28",
      "inclusions": [
        "Abholung von und zurück zu deiner Unterkunft",
        "1 h Marktrundgang",
        "Eigene Kochstation",
        "Gedrucktes Kochbuch in Farbe (40 Seiten)",
        "Zutaten-Geschenkset für jeden Gast",
        "Unbegrenzt echter Akha-Bergkaffee",
        "Frisches Wasser und verschiedene Tees",
        "Kostenloses WLAN, Ladesteckdosen und mehr"
      ],
      "schedule": [
        {
          "label": "Abholservice inklusive",
          "time": "08:15 > 08:40",
          "description": "Die genaue Zeit hängt von der Lage deines Hotels ab. Gelbe Zone: 08:20. Grüne Zone (Old City): 08:30. Rosa/Azurblaue Zone: 08:40. Bitte sei in der Lobby bereit."
        },
        {
          "label": "Rundgang über den Markt",
          "time": "09:00 > 10:00",
          "description": "Wir nehmen dich mit auf den lokalen Markt, damit du das echte Leben der Menschen hier erlebst. Sieh und probier die vielen lokalen Produkte."
        },
        {
          "label": "Kurszeit",
          "time": "10:00 > 14:30",
          "description": "In der Kochschule angekommen, bereitest du mit Hilfe unserer Akha-Lehrerin eine Reihe von Gerichten zu."
        },
        {
          "label": "Rückfahrt",
          "time": "14:30 > 15:00",
          "description": "Zurück zu deinem Hotel, nachdem du deine 11 köstlichen Gerichte gegessen hast."
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
      "title": "Kochkurs am Nachmittag",
      "badge": "Perfekt zum Abendessen",
      "priceThb": 1300,
      "currency": "THB",
      "unit": "per person",
      "startTime": "17:00",
      "endTime": "21:00",
      "durationText": "5 h",
      "hasMarketTour": false,
      "marketTour": null,
      "capacityText": "12 pro Küche, bis zu 24 gemeinsam · private Gruppen bis 28",
      "inclusions": [
        "Abholung von und zurück zu deiner Unterkunft",
        "Eigene Kochstation",
        "Gedrucktes Kochbuch in Farbe (40 Seiten)",
        "Zutaten-Geschenkset für jeden Gast",
        "Unbegrenzt echter Akha-Bergkaffee",
        "Frisches Wasser und verschiedene Tees",
        "Kostenloses WLAN, Ladesteckdosen und mehr"
      ],
      "schedule": [
        {
          "label": "Abholservice inklusive",
          "time": "16:15 > 16:40",
          "description": "Die genaue Zeit hängt von der Lage deines Hotels ab. Gelbe Zone: 16:20. Grüne Zone (Old City): 16:30. Rosa/Azurblaue Zone: 16:40. Bitte sei in der Lobby bereit."
        },
        {
          "label": "Kurszeit",
          "time": "17:00 > 21:00",
          "description": "Bereite 11 köstliche Gerichte zu, die du nach jeder Kochrunde gleich isst."
        },
        {
          "label": "Rückfahrt",
          "time": "21:00 > 21:30",
          "description": "Zurück zu deinem Hotel."
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
      "name": "Rosa Zone",
      "description": "Erweiterte Abholzone für Hotels außerhalb. Bitte sei pünktlich in der Lobby bereit.",
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
      "name": "Grüne Zone",
      "description": "Übliche Abholzone rund um die Old City. Bitte sei in der Lobby bereit.",
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
      "name": "Azurblaue Zone",
      "description": "Erweiterte Abholzone für Hotels außerhalb. Bitte sei pünktlich in der Lobby bereit.",
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
      "name": "Gelbe Zone",
      "description": "Zone mit viel Verkehr, daher holen wir dich früher ab. Bitte sei in der Lobby bereit.",
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
      "description": "Warte vor dem Eingang Central Plaza Gate.",
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
      "description": "Warte an der Hauptstraße vor dem Bushaltestellen-Schild.",
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
      "name": "Flughafen Chiang Mai - Inlandsflüge",
      "type": "pickup",
      "description": "Inlandsflug: Warte draußen am Ausgang Gate 2. Hinweis: Die kostenlose Abholung ist nicht inbegriffen. Wir helfen dir gern, ein Grab-Taxi zu bestellen (~150-200 THB), das du dem Fahrer zahlst.",
      "dropoffDescription": "Wir bringen dich zum Flughafen Chiang Mai, Inlandsabflüge. Plane genug Zeit vor deinem Flug ein.",
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
      "name": "Flughafen Chiang Mai - Internationale Flüge",
      "type": "pickup",
      "description": "Internationaler Flug: Warte draußen am Ausgang Gate 8. Hinweis: Die kostenlose Abholung ist nicht inbegriffen. Wir helfen dir gern, ein Grab-Taxi zu bestellen (~150-200 THB), das du dem Fahrer zahlst.",
      "dropoffDescription": "Wir bringen dich zum internationalen Flughafen Chiang Mai, zur Abflugebene deines Terminals. Plane genug Zeit vor deinem Flug ein.",
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
      "name": "Bahnhof Chiang Mai",
      "type": "pickup",
      "description": "Warte vor dem Coffee and Drink Mini Mart, neben dem Uhrturm.",
      "dropoffDescription": "Wir setzen dich direkt am Eingang des Bahnhofs Chiang Mai ab, am Vorplatz: von dort ist dein Gleis leicht zu erreichen.",
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
      "description": "Warte an der Hauptstraße vor dem Eingang von ONE Nimman.",
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
      "description": "Warte an der Hauptstraße vor dem Eingang von McDonald's.",
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
      "name": "Nordtor - B2 Hotel",
      "type": "pickup",
      "description": "Warte an der Hauptstraße vor dem B2 Hotel.",
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
      "name": "Samstagsmarkt - Wualai",
      "type": "dropoff",
      "description": "Nachtbasar an der Wualai Road: samstags am Abend ab 17:00 geöffnet.",
      "dropoffDescription": null,
      "isDropoff": true,
      "morning": null,
      "evening": null
    },
    {
      "id": "mp_sunday_market",
      "name": "Sonntagsmarkt - Tha Phae",
      "type": "dropoff",
      "description": "Walking Street entlang der Th Wichayanon: sonntags am Abend ab 16:00 geöffnet.",
      "dropoffDescription": null,
      "isDropoff": true,
      "morning": null,
      "evening": null
    },
    {
      "id": "mp_school",
      "name": "Thai Akha Kitchen - Chiang Mai",
      "type": "walk_in",
      "description": "Komm direkt zur Schule. Bitte sei um 08:50 da für den Vormittagskurs oder um 17:00 für den Nachmittagskurs.",
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
      "name": "Wat Pan Whaen (Tempel)",
      "type": "walk_in",
      "description": "Treffpunkt für den Marktbesuch am Vormittag. Geh hinein, Richtung große weiße Pagode. Halte Ausschau nach dem Team in Thai Akha Kitchen Schürzen.",
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
      "category": "Das Authentische Stammesgerichte",
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
          "name": "Sapi Thong: Akha Tomaten-Dip"
        }
      ]
    },
    {
      "category": "Authentisch & Thai-Snacks",
      "categorySlug": "thai-appetizers-recipes",
      "items": [
        {
          "slug": "crispy-thai-spring-rolls-recipe",
          "name": "Frittierte Frühlingsrollen"
        },
        {
          "slug": "authentic-som-tum-papaya-salad-recipe",
          "name": "Papayasalat"
        }
      ]
    },
    {
      "category": "Süße Tradition Thai Desserts",
      "categorySlug": "traditional-thai-desserts",
      "items": [
        {
          "slug": "authentic-mango-sticky-rice-recipe",
          "name": "Mango Sticky Rice"
        },
        {
          "slug": "thai-pumpkin-coconut-milk-recipe",
          "name": "Kürbis in Kokosmilch"
        }
      ]
    },
    {
      "category": "Handgestoßen Currypasten",
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
      "category": "Heilende Brühen & Suppen",
      "categorySlug": "traditional-thai-soups",
      "items": [
        {
          "slug": "thai-clear-soup-egg-tofu-recipe",
          "name": "Klare Suppe mit weichem Tofu"
        },
        {
          "slug": "authentic-tom-kha-gai-recipe",
          "name": "Tom Kha (Kokosmilch)"
        },
        {
          "slug": "authentic-tom-yum-goong-recipe",
          "name": "Tom Yum"
        }
      ]
    },
    {
      "category": "Der Wok & Die Flamme",
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
          "name": "Süß-Sauer Gemüse"
        }
      ]
    },
    {
      "category": "Hand-Crafted Curry Pastes",
      "categorySlug": "curry-paste-recipes",
      "items": [
        {
          "slug": "authentic-thai-green-curry-paste-recipe",
          "name": "Authentische grüne Currypaste"
        },
        {
          "slug": "authentic-thai-massaman-curry-paste-recipe",
          "name": "Authentische Massaman Curry Paste"
        },
        {
          "slug": "authentic-thai-panang-curry-paste-recipe",
          "name": "Authentic Panang Curry Paste"
        },
        {
          "slug": "authentic-thai-red-curry-paste-recipe",
          "name": "Authentische rote Currypaste"
        }
      ]
    }
  ],
  "diets": {
    "lifestyle": [
      "Klassische Küche",
      "Vegan",
      "Vegetarisch",
      "Pescetarisch",
      "Fleischliebhaber"
    ],
    "religious": [
      "Halal-freundlich",
      "Koscher-freundlich",
      "Rastafari (Ital)",
      "Jain-freundlich",
      "Hindu-freundlich"
    ],
    "allergies": [
      "Ei-Allergie",
      "Fisch-Allergie",
      "Fischsaucen-Allergie",
      "Glutenfrei",
      "Erdnuss-Allergie",
      "Meeresfrüchte-Allergie",
      "Sesam-Allergie",
      "Schalentier-Allergie",
      "Soja-Allergie",
      "Sojasaucen-Allergie",
      "Baumnuss-Allergie",
      "Andere Allergien"
    ]
  }
};
