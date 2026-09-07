// GENERATO DA gen-cherry-facts - NON EDITARE A MANO
// lang: ko | generato: 2026-09-07
// Sorgenti: cooking_classes, class_sessions, meeting_points, business_profile,
// recipes + content_categories, dietary_profiles e i sidecar *_translations
// (campo per campo, con ricaduta sull inglese). Per cambiare un fatto: aggiorna
// il database, poi `pnpm gen-cherry-facts`.

import type { CherryFacts } from '../types';

export const CHERRY_FACTS_KO: CherryFacts = {
  "lang": "ko",
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
      "title": "오전 쿠킹 클래스",
      "badge": "가장 인기 있어요",
      "priceThb": 1400,
      "currency": "THB",
      "unit": "per person",
      "startTime": "09:00",
      "endTime": "14:30",
      "durationText": "6시간",
      "hasMarketTour": true,
      "marketTour": {
        "start": "09:00",
        "end": "10:00"
      },
      "pickupWindows": {
        "pink": "08:40",
        "green": "08:30",
        "yellow": "08:20"
      },
      "capacityText": "주방당 12명, 함께 최대 24명 · 프라이빗 그룹 최대 28명",
      "inclusions": [
        "숙소 왕복 픽업",
        "1시간 시장 투어",
        "개인 조리대",
        "올컬러 종이 레시피북 (40페이지)",
        "모든 수강생을 위한 재료 선물 세트",
        "진짜 아카 산악 커피 무제한",
        "시원한 물과 다양한 차",
        "무료 와이파이, 충전 콘센트 등"
      ],
      "schedule": [
        {
          "label": "픽업 서비스 포함",
          "time": "08:15 > 08:40",
          "description": "정확한 시간은 호텔 위치에 따라 달라져요. 옐로 존: 08:20. 그린 존(Old City): 08:30. 핑크/아주르 존: 08:40. 로비에서 준비하고 기다려 주세요."
        },
        {
          "label": "현지 시장 투어",
          "time": "09:00 > 10:00",
          "description": "현지 시장으로 안내해 이곳 사람들의 진짜 일상을 만나게 해 드려요. 다양한 현지 물산을 보고 맛보세요."
        },
        {
          "label": "수업 시간",
          "time": "10:00 > 14:30",
          "description": "쿠킹 스쿨에 도착하면 아카 선생님의 도움을 받아 여러 요리를 준비하기 시작해요."
        },
        {
          "label": "귀가 시간",
          "time": "14:30 > 15:00",
          "description": "맛있는 11가지 요리를 다 드신 뒤 호텔로 모셔다 드려요."
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
      "title": "오후 쿠킹 클래스",
      "badge": "저녁 식사로 완벽해요",
      "priceThb": 1300,
      "currency": "THB",
      "unit": "per person",
      "startTime": "17:00",
      "endTime": "21:00",
      "durationText": "5시간",
      "hasMarketTour": false,
      "marketTour": null,
      "pickupWindows": {
        "pink": "16:40",
        "green": "16:30",
        "yellow": "16:20"
      },
      "capacityText": "주방당 12명, 함께 최대 24명 · 프라이빗 그룹 최대 28명",
      "inclusions": [
        "숙소 왕복 픽업",
        "개인 조리대",
        "올컬러 종이 레시피북 (40페이지)",
        "모든 수강생을 위한 재료 선물 세트",
        "진짜 아카 산악 커피 무제한",
        "시원한 물과 다양한 차",
        "무료 와이파이, 충전 콘센트 등"
      ],
      "schedule": [
        {
          "label": "픽업 서비스 포함",
          "time": "16:15 > 16:40",
          "description": "정확한 시간은 호텔 위치에 따라 달라져요. 옐로 존: 16:20. 그린 존(Old City): 16:30. 핑크/아주르 존: 16:40. 로비에서 준비하고 기다려 주세요."
        },
        {
          "label": "수업 시간",
          "time": "17:00 > 21:00",
          "description": "맛있는 11가지 요리를 만들고, 만들 때마다 바로 맛보세요."
        },
        {
          "label": "귀가 시간",
          "time": "21:00 > 21:30",
          "description": "호텔로 모셔다 드려요."
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
  "meetingPoints": [
    {
      "id": "mp_cen_airport",
      "name": "Central Airport Plaza",
      "type": "pickup",
      "description": "Central Plaza Gate 입구 앞에서 기다려 주세요.",
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
      "description": "큰길가 버스 정류장 표지판 앞에서 기다려 주세요.",
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
      "name": "치앙마이 공항 - 국내선",
      "type": "pickup",
      "description": "국내선: Gate 2 출구 밖에서 기다려 주세요. 참고: 무료 픽업은 포함되지 않아요. 그랩(Grab) 택시 호출을 도와드릴 수 있고(약 150-200바트), 요금은 기사님께 직접 내시면 돼요.",
      "dropoffDescription": "치앙마이 공항 국내선 출발층에 모셔다 드려요. 비행기 시간 전에 여유를 두고 계획해 주세요.",
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
      "name": "치앙마이 공항 - 국제선",
      "type": "pickup",
      "description": "국제선: Gate 8 출구 밖에서 기다려 주세요. 참고: 무료 픽업은 포함되지 않아요. 그랩(Grab) 택시 호출을 도와드릴 수 있고(약 150-200바트), 요금은 기사님께 직접 내시면 돼요.",
      "dropoffDescription": "치앙마이 국제공항, 이용하시는 터미널의 출발층에 모셔다 드려요. 비행기 시간 전에 여유를 두고 계획해 주세요.",
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
      "name": "치앙마이 기차역",
      "type": "pickup",
      "description": "시계탑 옆 Coffee and Drink Mini Mart 앞에서 기다려 주세요.",
      "dropoffDescription": "치앙마이 기차역 입구 앞 광장에 바로 내려 드려요. 거기서 승강장까지 가기 편해요.",
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
      "name": "MAYA 쇼핑센터",
      "type": "pickup",
      "description": "큰길가 ONE Nimman 입구 앞에서 기다려 주세요.",
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
      "name": "맥도날드 - 타패 게이트",
      "type": "pickup",
      "description": "큰길가 맥도날드 입구 앞에서 기다려 주세요.",
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
      "name": "북문 - B2 Hotel",
      "type": "pickup",
      "description": "큰길가 B2 Hotel 앞에서 기다려 주세요.",
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
      "name": "토요 야시장 - 우아라이",
      "type": "dropoff",
      "description": "우아라이 로드 야시장이에요. 토요일 저녁 17:00부터 열려요.",
      "dropoffDescription": null,
      "isDropoff": true,
      "morning": null,
      "evening": null
    },
    {
      "id": "mp_sunday_market",
      "name": "일요 야시장 - 타패",
      "type": "dropoff",
      "description": "Th Wichayanon 일대의 일요 워킹 스트리트예요. 일요일 저녁 16:00부터 열려요.",
      "dropoffDescription": null,
      "isDropoff": true,
      "morning": null,
      "evening": null
    },
    {
      "id": "mp_school",
      "name": "Thai Akha Kitchen - 치앙마이",
      "type": "walk_in",
      "description": "학교로 바로 오세요. 오전 수업은 08:50까지, 오후 수업은 17:00까지 도착해 주세요.",
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
      "name": "왓 판웬 (사원)",
      "type": "walk_in",
      "description": "오전 시장 투어 집합 장소예요. 안으로 들어와 큰 흰색 탑 근처로 오세요. Thai Akha Kitchen 앞치마를 두른 스태프를 찾으시면 돼요.",
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
      "category": "정통의 부족 요리",
      "categorySlug": "authentic-akha-recipes",
      "items": [
        {
          "slug": "authentic-akha-mountain-salad-recipe",
          "name": "Akha 산악 신선 샐러드"
        },
        {
          "slug": "akha-spirit-detox-soup-recipe",
          "name": "Akha Spirit Soup"
        },
        {
          "slug": "traditional-akha-sapi-thong-recipe",
          "name": "사피 통: Akha 토마토 딥핑 소스"
        }
      ]
    },
    {
      "category": "즐거운 정통 타이 간식",
      "categorySlug": "thai-appetizers-recipes",
      "items": [
        {
          "slug": "crispy-thai-spring-rolls-recipe",
          "name": "튀긴 스프링 롤"
        },
        {
          "slug": "authentic-som-tum-papaya-salad-recipe",
          "name": "파파야 샐러드"
        }
      ]
    },
    {
      "category": "달콤한 전통 타이 디저트",
      "categorySlug": "traditional-thai-desserts",
      "items": [
        {
          "slug": "authentic-mango-sticky-rice-recipe",
          "name": "망고 스티키 라이스"
        },
        {
          "slug": "thai-pumpkin-coconut-milk-recipe",
          "name": "Pumpkin in Coconut Milk"
        }
      ]
    },
    {
      "category": "손으로 찧은 커리 페이스트",
      "categorySlug": "authentic-thai-curry-recipes",
      "items": [
        {
          "slug": "authentic-thai-green-curry-recipe",
          "name": "Thai Green Curry"
        },
        {
          "slug": "authentic-thai-massaman-curry-recipe",
          "name": "타이 마사만 커리"
        },
        {
          "slug": "authentic-thai-panang-curry-recipe",
          "name": "Thai Panang Curry"
        },
        {
          "slug": "authentic-thai-red-curry-recipe",
          "name": "타이 레드 커리"
        }
      ]
    },
    {
      "category": "힐링 리스토레이티브 육수 및 수프",
      "categorySlug": "traditional-thai-soups",
      "items": [
        {
          "slug": "thai-clear-soup-egg-tofu-recipe",
          "name": "부드러운 두부 맑은 국"
        },
        {
          "slug": "authentic-tom-kha-gai-recipe",
          "name": "Tom Kha (코코넛 밀크)"
        },
        {
          "slug": "authentic-tom-yum-goong-recipe",
          "name": "Tom Yum"
        }
      ]
    },
    {
      "category": "wok & 불꽃",
      "categorySlug": "thai-stir-fry-recipes",
      "items": [
        {
          "slug": "authentic-pad-thai-recipe-chiang-mai",
          "name": "팟타이"
        },
        {
          "slug": "authentic-pad-kra-pao-recipe",
          "name": "홀리 바질 볶음"
        },
        {
          "slug": "thai-chicken-cashew-nuts-recipe",
          "name": "캐슈넛 볶음"
        },
        {
          "slug": "thai-sweet-and-sour-vegetable-recipe",
          "name": "스위트 앤 사워 베지터블"
        }
      ]
    },
    {
      "category": "Hand-Crafted Curry Pastes",
      "categorySlug": "curry-paste-recipes",
      "items": [
        {
          "slug": "authentic-thai-green-curry-paste-recipe",
          "name": "정통 그린 커리 페이스트"
        },
        {
          "slug": "authentic-thai-massaman-curry-paste-recipe",
          "name": "정통 마사만 커리 페이스트"
        },
        {
          "slug": "authentic-thai-panang-curry-paste-recipe",
          "name": "정통 파냉 커리 페이스트"
        },
        {
          "slug": "authentic-thai-red-curry-paste-recipe",
          "name": "정통 레드 커리 페이스트"
        }
      ]
    }
  ],
  "diets": {
    "lifestyle": [
      "일반 식단",
      "비건 식단",
      "채식 식단",
      "페스코 채식",
      "고기 러버"
    ],
    "religious": [
      "할랄 프렌들리",
      "코셔 프렌들리",
      "라스타파리 (Ital)",
      "자이나 프렌들리",
      "힌두 프렌들리"
    ],
    "allergies": [
      "달걀 알레르기",
      "생선 알레르기",
      "피시소스 알레르기",
      "글루텐 프리",
      "땅콩 알레르기",
      "해산물 알레르기",
      "참깨 알레르기",
      "갑각류 알레르기",
      "대두 알레르기",
      "간장 알레르기",
      "견과류 알레르기",
      "기타 알레르기"
    ]
  }
};
