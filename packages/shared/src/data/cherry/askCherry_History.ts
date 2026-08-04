// ─────────────────────────────────────────────────────────────────────────────
// askCherry — History & Culture — Akha culture, Zang, Dress, Festival, Spirit Gate, Philosophy, Origins, Learn Thai
// Modulo della ragnatela Cherry. Aggiungi qui nuovi nodi per questo tema.
// Merge automatico in chatFlowData.ts via spread.
// ─────────────────────────────────────────────────────────────────────────────
import type { ChatNode } from './chatFlowTypes';

export const flowHistory: Record<string, ChatNode> = {
  AKHA_CULTURE_HUB: {
    id: 'AKHA_CULTURE_HUB',
    shortLabel: '⛰️ Akha Culture',
    priority: 3,
    message: "**Akha Culture — A Living Tradition**\n\nThe Akha are a highland people who migrated from the Tibetan Plateau over centuries, settling across Myanmar, Laos, Yunnan, and Northern Thailand. Unlike many hill tribe traditions reduced to folklore, Akha culture is still actively practised — the Zang (the Akha Way) governs daily life, the Spirit Gate marks every village entrance, and the Swing Festival is celebrated every August.\n\nAt Thai Akha Kitchen, the food we cook is inseparable from this culture. Understanding where these recipes come from — the mountains, the forest, the communal field — changes how they taste. Choose a topic to explore:",
    options: [
      { label: '📜 Akha Zang',         nextId: 'AKHA_ZANG_L1',       priority: 3 },
      { label: '👘 Traditional Dress',  nextId: 'AKHA_DRESS_L1',      priority: 3 },
      { label: '🌿 Food Philosophy',    nextId: 'AKHA_PHILOSOPHY_L1', priority: 3 },
      { label: '⛰️ Origins & History',  nextId: 'AKHA_ORIGINS_L1',   priority: 3 },
    ],
  },

  AKHA_ZANG_L1: {
    id: 'AKHA_ZANG_L1',
    priority: 3,
    message: "**Akha Zang — The Akha Way of Life**\n\nAkha Zang is the oral constitution of the Akha people — an unwritten code that governs every aspect of life from agriculture to family structure to ritual. It has been passed from elders to youth for over 60 generations without a single written word. The term **Zang** roughly translates as \"the way\" or \"the path\" — analogous in scope to the Tao, though entirely distinct.\n\nIn practice, Akha Zang tells people when to plant, how to treat the forest, how to structure a marriage ceremony, and what obligations a child owes their ancestors. It is not a religion, but it has a spiritual dimension — the belief that human and spirit worlds exist in delicate balance.",
    options: [
      { label: '🔍 Go Deeper',          nextId: 'AKHA_ZANG_L2',       priority: 3 },
      { label: '👘 Traditional Dress',  nextId: 'AKHA_DRESS_L1',      priority: 3 },
      { label: '🚪 Spirit Gate',        nextId: 'AKHA_SPIRITGATE_L1', priority: 3 },
      { label: '🌿 Food Philosophy',    nextId: 'AKHA_PHILOSOPHY_L1', priority: 3 },
    ],
  },

  AKHA_ZANG_L2: {
    id: 'AKHA_ZANG_L2',
    priority: 3,
    message: "**Akha Zang — The Oral Constitution**\n\nAkha Zang covers six domains of life: agriculture (when to burn, plant, harvest), forest stewardship (which trees are sacred, which may be cut), family obligations (birth rituals, marriage rules, inheritance), social order (village leadership, dispute resolution), ritual calendar (festivals, ancestor offerings), and cosmology (the relationship between living, dead, and spirits).\n\nWhat makes Zang extraordinary is that it is carried entirely in living memory. Each community elder (the **Dzöma**) holds a section of this code and transmits it through storytelling, ceremonial chanting, and daily practice. There is no priest class, no temple institution — the knowledge lives in people.",
    options: [
      { label: '📖 Read: The Akha Way',  nextId: 'AKHA_ZANG_L3',       action: 'nav_culture', data: { slug: 'akha-zang' }, priority: 3 },
      { label: '🎓 Go Even Deeper',      nextId: 'AKHA_ZANG_L3',       priority: 3 },
      { label: '🚪 Spirit Gate',         nextId: 'AKHA_SPIRITGATE_L1', priority: 3 },
      { label: '⛰️ Origins & History',   nextId: 'AKHA_ORIGINS_L1',   priority: 3 },
    ],
  },

  AKHA_ZANG_L3: {
    id: 'AKHA_ZANG_L3',
    priority: 3,
    message: "**Akha Zang — The Living Archive**\n\nThe most remarkable feature of Akha Zang is its patrilineal genealogy system. Every Akha person can recite their ancestry back through 60 or more named generations — sometimes reaching over 1,500 years. This is not mythology: it is a verified social technology for maintaining identity across borders, migrations, and generations without any written records.\n\nAt the cosmological core of Zang is **Pyaw** — the principle of balance between the human world (**Ayoe**) and the spirit world (**Neh**). Disrupting Pyaw through taboo violation requires ritual correction. This belief is why certain trees must not be cut, why the Spirit Gate cannot be touched by outsiders, and why every meal begins with a small offering to ancestors. The food we cook in class is, in this sense, always connected to something larger.",
    options: [
      { label: '📖 Read Full Article',   nextId: 'QUIZ_TEASER',         action: 'nav_culture', data: { slug: 'akha-zang' }, priority: 3 },
      { label: '🎮 Test Your Knowledge', nextId: 'QUIZ_TEASER',         priority: 3 },
      { label: '🚪 Spirit Gate',         nextId: 'AKHA_SPIRITGATE_L1', priority: 3 },
      { label: '📅 Book & Experience',   nextId: 'BOOK_NOW',            action: 'nav_booking', priority: 1 },
    ],
  },

  AKHA_DRESS_L1: {
    id: 'AKHA_DRESS_L1',
    priority: 3,
    message: "**Traditional Akha Dress — An Identity Map**\n\nAkha clothing is not decorative — it is biographical. Every element of a woman's outfit communicates subgroup (Ulo or Loimi), village of origin, marital status, and stage of life. A stranger who knows Akha dress can read a woman's entire social identity without her saying a word.\n\nThe headdress is the most distinctive element: a tall silver-adorned construction that takes years to build and is passed between generations. It is never mass-produced. The embroidery patterns on the jacket and leggings use geometric codes specific to each family lineage — a textile form of genealogy.",
    options: [
      { label: '🔍 Go Deeper',          nextId: 'AKHA_DRESS_L2',    priority: 3 },
      { label: '📜 Akha Zang',          nextId: 'AKHA_ZANG_L1',     priority: 3 },
      { label: '🎡 Swing Festival',     nextId: 'AKHA_FESTIVAL_L1', priority: 3 },
      { label: '⛰️ Origins & History',  nextId: 'AKHA_ORIGINS_L1', priority: 3 },
    ],
  },

  AKHA_DRESS_L2: {
    id: 'AKHA_DRESS_L2',
    priority: 3,
    message: "**The Meaning of Silver**\n\nSilver is the dominant material in Akha jewellery — coins, discs, balls, and dangling ornaments cover the headdress, collar, and bracelets. The weight of silver worn is not a display of wealth in the economic sense. Silver is believed to hold protective energy: it deflects evil spirits, anchors the soul to the body, and marks the wearer as a person under ancestral protection.\n\nThe specific coins used in older headdresses are revealing: Burmese colonial rupees, French Indochinese piastres, and old Yunnan coins — a physical archive of the migration routes taken by Akha clans over the past two centuries. Reading a headdress is reading a map.",
    options: [
      { label: '📖 Read: Language of Silver', nextId: 'AKHA_DRESS_L3',    action: 'nav_culture', data: { slug: 'traditional-akha-dress-silver' }, priority: 3 },
      { label: '🎓 Go Even Deeper',           nextId: 'AKHA_DRESS_L3',    priority: 3 },
      { label: '📜 Akha Zang',                nextId: 'AKHA_ZANG_L1',     priority: 3 },
      { label: '🎡 Swing Festival',           nextId: 'AKHA_FESTIVAL_L1', priority: 3 },
    ],
  },

  AKHA_DRESS_L3: {
    id: 'AKHA_DRESS_L3',
    priority: 3,
    message: "**The Textile Code**\n\nIndigo-dyed cotton is the base fabric of Akha clothing. Indigo represents the earth's stability and is cultivated, harvested, and processed by Akha women using techniques passed down through Akha Zang. The deep blue-black colour darkens with each wash over years of wear — older garments are therefore darker and more prestigious than new ones.\n\nThe embroidery is stitched in a specific order: diagonal grid first, then animal motifs, then clan-specific geometric patterns. Each motif has a name in Akha and a corresponding belief. The rooster, for example, is always placed near the collar — it is the animal that calls the sun and keeps evil from crossing into daylight. No element is arbitrary.",
    options: [
      { label: '📖 Read Full Article',   nextId: 'QUIZ_TEASER',     action: 'nav_culture', data: { slug: 'traditional-akha-dress-silver' }, priority: 3 },
      { label: '🎮 Test Your Knowledge', nextId: 'QUIZ_TEASER',     priority: 3 },
      { label: '📜 Akha Zang',           nextId: 'AKHA_ZANG_L1',   priority: 3 },
      { label: '📅 Book & Experience',   nextId: 'BOOK_NOW',        action: 'nav_booking', priority: 1 },
    ],
  },

  AKHA_FESTIVAL_L1: {
    id: 'AKHA_FESTIVAL_L1',
    priority: 3,
    message: "**Yehkuja — The Akha Swing Festival**\n\nYehkuja is the Akha Swing Festival — a four-day celebration that takes place in August, calculated by the lunar calendar. It is often called the Women's New Year because it marks the spiritual renewal of the female principle in Akha cosmology, in contrast to the Men's New Year (Khawlawkhaweh) held later in the season.\n\nAt the centre of the festival stands a giant swing built from four bamboo poles tied at the apex — one for each cardinal direction. The swing is constructed in the middle of the village and becomes a ritual space for the duration of the festival.",
    options: [
      { label: '🔍 Go Deeper',          nextId: 'AKHA_FESTIVAL_L2',   priority: 3 },
      { label: '📜 Akha Zang',          nextId: 'AKHA_ZANG_L1',       priority: 3 },
      { label: '🚪 Spirit Gate',        nextId: 'AKHA_SPIRITGATE_L1', priority: 3 },
      { label: '👘 Traditional Dress',  nextId: 'AKHA_DRESS_L1',      priority: 3 },
    ],
  },

  AKHA_FESTIVAL_L2: {
    id: 'AKHA_FESTIVAL_L2',
    priority: 3,
    message: "**The Ritual of the Swing**\n\nSwinging during Yehkuja is not play — it is a ritual act. The higher a woman swings, the closer she comes to the celestial lands above, and the stronger her prayer for a good rice harvest. The motion is believed to synchronise the rhythms of the human body with the rhythms of the land, stimulating fertility for both women and fields.\n\nThe four poles represent the four directional spirits, and the act of building the swing is itself a ritual: specific prayers are recited, offerings are placed at each pole, and the construction must be completed in a single day without interruption. Men and older women build the swing; young women and adolescent girls use it during the festival days.",
    options: [
      { label: '📖 Read: Sacred Swing Festival', nextId: 'AKHA_FESTIVAL_L3', action: 'nav_culture', data: { slug: 'akha-swing-festival-yehkuja' }, priority: 3 },
      { label: '🎓 Go Even Deeper',              nextId: 'AKHA_FESTIVAL_L3', priority: 3 },
      { label: '👘 Traditional Dress',           nextId: 'AKHA_DRESS_L1',    priority: 3 },
      { label: '📜 Akha Zang',                   nextId: 'AKHA_ZANG_L1',     priority: 3 },
    ],
  },

  AKHA_FESTIVAL_L3: {
    id: 'AKHA_FESTIVAL_L3',
    priority: 3,
    message: "**Yehkuja — The Full Ritual Complex**\n\nBeyond the swing, Yehkuja encompasses a complete four-day ritual program: ancestral offerings on day one, where food prepared specifically for deceased family members is placed at the spirit gate and household altars; choral singing in call-and-response form on days two and three, in which women sing traditional compositions that recount Akha migration history and clan genealogy; and a communal feast on day four presided over by the village elder and dedicated to the Akha Agriculture Goddess (Yeha).\n\nThe feast food is prepared communally — every family contributes ingredients, and the cooking is done by groups of women using techniques specified in Akha Zang. This communal cooking is the direct ancestor of what we do at Thai Akha Kitchen every single day.",
    options: [
      { label: '📖 Read Full Article',   nextId: 'QUIZ_TEASER',         action: 'nav_culture', data: { slug: 'akha-swing-festival-yehkuja' }, priority: 3 },
      { label: '🎮 Test Your Knowledge', nextId: 'QUIZ_TEASER',         priority: 3 },
      { label: '🚪 Spirit Gate',         nextId: 'AKHA_SPIRITGATE_L1', priority: 3 },
      { label: '📅 Book & Experience',   nextId: 'BOOK_NOW',            action: 'nav_booking', priority: 1 },
    ],
  },

  AKHA_SPIRITGATE_L1: {
    id: 'AKHA_SPIRITGATE_L1',
    priority: 3,
    message: "**Loku-Pah — The Akha Spirit Gate**\n\nEvery traditional Akha village has a Spirit Gate — called *Loku-Pah* — positioned at the main entrance to the settlement. It marks the boundary between the human world inside the village and the spirit world beyond. Nothing crosses this threshold without ritual acknowledgement.\n\nThe gate is built from bamboo and carved wood, typically featuring small figurines representing protective spirits. It is not a permanent structure: the Spirit Gate is rebuilt every year during a village-wide ceremony as an act of renewal and gratitude to the protective spirits.",
    options: [
      { label: '🔍 Go Deeper',         nextId: 'AKHA_SPIRITGATE_L2', priority: 3 },
      { label: '📜 Akha Zang',         nextId: 'AKHA_ZANG_L1',       priority: 3 },
      { label: '🎡 Swing Festival',    nextId: 'AKHA_FESTIVAL_L1',   priority: 3 },
      { label: '🌿 Food Philosophy',   nextId: 'AKHA_PHILOSOPHY_L1', priority: 3 },
    ],
  },

  AKHA_SPIRITGATE_L2: {
    id: 'AKHA_SPIRITGATE_L2',
    priority: 3,
    message: "**The Gate as Metaphysical Filter**\n\nThe Loku-Pah functions as a metaphysical membrane — it lets certain energies through and blocks others. Protective spirits are invited in through specific prayers and offerings placed at the gate. Harmful spirits, disease, and misfortune are deflected by the carvings and the spiritual charge of the construction ritual.\n\nThe annual rebuilding is not merely maintenance — it is a complete renewal of the protective contract between the village and the spirit world. The old gate is not discarded carelessly: it must be disassembled in a specific order with specific prayers, and the materials returned to the forest. A gate improperly dismantled is believed to leave the village spiritually exposed.",
    options: [
      { label: '📖 Read: The Sacred Spirit Gate', nextId: 'AKHA_SPIRITGATE_L3', action: 'nav_culture', data: { slug: 'sacred-akha-spirit-gate-meaning' }, priority: 3 },
      { label: '🎓 Go Even Deeper',               nextId: 'AKHA_SPIRITGATE_L3', priority: 3 },
      { label: '📜 Akha Zang',                    nextId: 'AKHA_ZANG_L1',       priority: 3 },
      { label: '⛰️ Origins & History',            nextId: 'AKHA_ORIGINS_L1',   priority: 3 },
    ],
  },

  AKHA_SPIRITGATE_L3: {
    id: 'AKHA_SPIRITGATE_L3',
    priority: 3,
    message: "**The Carved Guardians**\n\nFlanking the Spirit Gate are carved wooden figures — male and female — that represent the guardian principles of fertility and continuity. The male figure holds a spear or agricultural tool; the female figure holds a basket or weaving implement. Together they embody the complete social and cosmic order of the Akha world.\n\n⚠️ **Important for visitors:** The Spirit Gate is a living sacred object, not a cultural artefact. Outsiders must never touch it, lean against it, or walk beneath its beam — this is a serious taboo in Akha Zang. Taking photographs is generally acceptable if you ask permission, but entering the village gate without acknowledgment of its purpose is disrespectful. Understanding this boundary is part of what we teach at Thai Akha Kitchen — cultural respect begins before the food.",
    options: [
      { label: '📖 Read Full Article',   nextId: 'QUIZ_TEASER',     action: 'nav_culture', data: { slug: 'sacred-akha-spirit-gate-meaning' }, priority: 3 },
      { label: '🎮 Test Your Knowledge', nextId: 'QUIZ_TEASER',     priority: 3 },
      { label: '📜 Akha Zang',           nextId: 'AKHA_ZANG_L1',   priority: 3 },
      { label: '📅 Book & Experience',   nextId: 'BOOK_NOW',        action: 'nav_booking', priority: 1 },
    ],
  },

  AKHA_PHILOSOPHY_L1: {
    id: 'AKHA_PHILOSOPHY_L1',
    shortLabel: '🌿 Food Philosophy',
    priority: 3,
    message: "**The Forest-to-Table Philosophy of Akha Cooking**\n\nFor the Akha, food is medicine before it is flavour. Every ingredient on the table was chosen for a purpose that predates the concept of cuisine — the forest was their pantry, and the plants growing at altitude their pharmacy. This philosophy is not poetic licence: it is encoded in Akha Zang and practised in every household that follows the traditional way.\n\nWhat you encounter in our kitchen is the edible expression of this worldview. The Sapi Thong chili paste you pound, the herbal soup you simmer without any animal broth, the mountain salad you dress with lime instead of oil — each carries a story of highland ecology and accumulated nutritional knowledge that took centuries to develop.",
    options: [
      { label: '🔍 Go Deeper',          nextId: 'AKHA_PHILOSOPHY_L2', priority: 3 },
      { label: '🌶️ Sapi Thong',         nextId: 'SAPI_THONG_DETAIL',  priority: 2 },
      { label: '📜 Akha Zang',          nextId: 'AKHA_ZANG_L1',       priority: 3 },
      { label: '⛰️ Origins & History',  nextId: 'AKHA_ORIGINS_L1',   priority: 3 },
    ],
  },

  AKHA_PHILOSOPHY_L2: {
    id: 'AKHA_PHILOSOPHY_L2',
    priority: 3,
    message: "**Coffee, Forest, and the Healing Table**\n\nTwo expressions of the Akha food philosophy are especially visible today: the coffee revolution and the jungle pantry. Akha farmers in Northern Thailand were among the first hill tribe communities to cultivate arabica coffee at altitude — initially as part of a royal project to replace opium, but developed over decades into a distinct highland coffee identity that is now exported worldwide.\n\nThe jungle pantry is the older tradition: wild herbs, edible roots, leaves, and flowers that Akha foragers have harvested for centuries and that appear in dishes well before they found their way into any cookbook. Many of these plants have documented medicinal properties. The full story of how Akha food philosophy connects the forest, the body, and the table is covered in our culture articles.",
    options: [
      { label: '📖 Read: Sapi Thong Philosophy', nextId: 'AKHA_CULTURE_HUB', action: 'nav_culture', data: { slug: 'akha-sapi-thong-spice-philosophy' }, priority: 3 },
      { label: '☕ Coffee Culture',               nextId: 'AKHA_CULTURE_HUB', action: 'nav_culture', data: { slug: 'coffee-culture' }, priority: 3 },
      { label: '🌿 Akha Dishes',                  nextId: 'AKHA_DISHES_INFO', priority: 2 },
      { label: '📅 Book & Experience',            nextId: 'BOOK_NOW',         action: 'nav_booking', priority: 1 },
    ],
  },

  AKHA_ORIGINS_L1: {
    id: 'AKHA_ORIGINS_L1',
    shortLabel: '⛰️ Origins',
    priority: 3,
    message: "**Where the Akha People Come From**\n\nThe Akha are believed to have originated on the Tibetan Plateau, migrating south over many centuries through Yunnan province in China, into Myanmar and Laos, and finally into Northern Thailand's highlands. This migration — spanning roughly six centuries — is not just remembered in oral tradition: it is embedded in the patterns of the headdress, the currency coins used in jewellery, and the Sipsongpanna myths that form the cosmological foundation of Akha identity.\n\nToday approximately 80,000 Akha people live in Northern Thailand, primarily in the mountain districts of Chiang Rai and Chiang Mai provinces. They are one of the most culturally cohesive of Thailand's hill tribe peoples — maintaining their language, rituals, and dress code at a level unusual for a diaspora community.",
    options: [
      { label: '🔍 Go Deeper',         nextId: 'AKHA_ORIGINS_L2',   priority: 3 },
      { label: '📜 Akha Zang',         nextId: 'AKHA_ZANG_L1',      priority: 3 },
      { label: '🌿 Food Philosophy',   nextId: 'AKHA_PHILOSOPHY_L1',priority: 3 },
      { label: '⛰️ Culture Hub',       nextId: 'AKHA_CULTURE_HUB',  priority: 3 },
    ],
  },

  AKHA_ORIGINS_L2: {
    id: 'AKHA_ORIGINS_L2',
    priority: 3,
    message: "**Three Subgroups, One Migration**\n\nThe Akha are divided into three primary subgroups — Ulo, Loimi, and Phami — each with slightly different traditions, dress codes, and dialectal variations. All three trace a shared ancestry to the Sipsongpanna region of Yunnan, and all three practise the core principles of Akha Zang. In Northern Thailand, the Ulo and Loimi subgroups are most numerous.\n\nThe migration routes are not recorded in books — they exist in the genealogy chants recited at ceremonies, in the coins sewn into headdresses, and in the place names embedded in Akha oral poetry. Researchers studying Akha history must work with elders and community knowledge-keepers, since written records from outside communities rarely captured Akha movement accurately.",
    options: [
      { label: '📖 Read: The Highland Mosaic',    nextId: 'AKHA_CULTURE_HUB', action: 'nav_culture', data: { slug: 'northern-thailand-hill-tribes-guide' }, priority: 3 },
      { label: '📖 Read: Migration Routes',        nextId: 'AKHA_CULTURE_HUB', action: 'nav_culture', data: { slug: 'akha-migration-history-routes' }, priority: 3 },
      { label: '📜 Akha Zang',                    nextId: 'AKHA_ZANG_L1',     priority: 3 },
      { label: '📅 Book & Experience',            nextId: 'BOOK_NOW',          action: 'nav_booking', priority: 1 },
    ],
  },

  LEARN_THAI_HUB: {
    id: 'LEARN_THAI_HUB',
    shortLabel: '🗣️ Learn Thai',
    priority: 3,
    message: "**Learn a Little Thai Before Your Class**\n\nA few words in Thai go an extraordinarily long way in Chiang Mai — locals genuinely appreciate the effort, and knowing even basic food words enriches the market experience. Thai is a tonal language (5 tones in standard Thai, 6 in Northern Thai dialect), so pronunciation matters — but don't let that stop you.\n\nDuring class, your chef will teach you to say each dish name in Thai and will correct your pronunciation with a smile. The most important word to know before you arrive: *Aroi mak* — very delicious. You will use it constantly.",
    options: [
      { label: '🙏 Greetings',        nextId: 'LEARN_THAI_GREETINGS', priority: 3 },
      { label: '🍜 Food Words',       nextId: 'LEARN_THAI_FOOD',      priority: 3 },
      { label: '🔢 Numbers',          nextId: 'LEARN_THAI_NUMBERS',   priority: 3 },
      { label: '⛰️ Akha Culture',     nextId: 'AKHA_CULTURE_HUB',    priority: 3 },
    ],
  },

  LEARN_THAI_GREETINGS: {
    id: 'LEARN_THAI_GREETINGS',
    priority: 3,
    message: "**Thai Greetings**\n\n- **Sawasdee kha / krub** — Hello. Kha for women, krub for men. Always with a slight bow, palms pressed together.\n- **Khob khun kha / krub** — Thank you.\n- **Sabai dee mai?** — How are you? · **Sabai dee** — I'm well.\n- **Mai pen rai** — No problem / Never mind — the most Thai phrase imaginable.\n\nThe kha / krub particle at the end of any sentence makes you sound instantly polite. Thais will appreciate it every time.",
    options: [
      { label: '🍜 Food Words',       nextId: 'LEARN_THAI_FOOD',      priority: 3 },
      { label: '🔢 Numbers',          nextId: 'LEARN_THAI_NUMBERS',   priority: 3 },
      { label: '⛰️ Akha Culture',     nextId: 'AKHA_CULTURE_HUB',    priority: 3 },
      { label: '📅 Book a Class',     nextId: 'BOOK_NOW',             action: 'nav_booking', priority: 1 },
    ],
  },

  LEARN_THAI_FOOD: {
    id: 'LEARN_THAI_FOOD',
    priority: 3,
    message: "**Thai Food Words for Class**\n\n- **Aroi** — Delicious · **Aroi mak!** — Very delicious — say this constantly\n- **Phet** — Spicy · **Mai phet** — Not spicy · **Nit noi phet** — A little spicy\n- **Kaao** (ข้าว) — Rice · **Kaao nieow** — Sticky rice (essential in the North)\n- **Nam** — Water · **Nam man** — Oil\n- **Pak** — Vegetables · **Nua** — Meat · **Tao hoo** — Tofu\n\nAt the market: point and say **Nii arai kha?** (What is this?) — vendors are always happy to explain their produce.",
    options: [
      { label: '🙏 Greetings',        nextId: 'LEARN_THAI_GREETINGS', priority: 3 },
      { label: '🔢 Numbers',          nextId: 'LEARN_THAI_NUMBERS',   priority: 3 },
      { label: '⛰️ Akha Culture',     nextId: 'AKHA_CULTURE_HUB',    priority: 3 },
      { label: '📅 Book a Class',     nextId: 'BOOK_NOW',             action: 'nav_booking', priority: 1 },
    ],
  },

  LEARN_THAI_NUMBERS: {
    id: 'LEARN_THAI_NUMBERS',
    priority: 3,
    message: "**Thai Numbers 1–10**\n\n- **1–5:** Neung · Song · Sam · See · Ha\n- **6–10:** Hok · Jet · Paet · Kao · Sip\n\nFun fact: Thais write laughter as **555** online — because Ha Ha Ha sounds like 5 5 5. You'll see this everywhere in Line messages and Instagram comments.\n\nAt the market, **Tao rai kha?** means How much? — useful for prices and quantities. Using even one Thai number gets you a warmer response.",
    options: [
      { label: '🙏 Greetings',        nextId: 'LEARN_THAI_GREETINGS', priority: 3 },
      { label: '🍜 Food Words',       nextId: 'LEARN_THAI_FOOD',      priority: 3 },
      { label: '⛰️ Akha Culture',     nextId: 'AKHA_CULTURE_HUB',    priority: 3 },
      { label: '📅 Book a Class',     nextId: 'BOOK_NOW',             action: 'nav_booking', priority: 1 },
    ],
  },
};
