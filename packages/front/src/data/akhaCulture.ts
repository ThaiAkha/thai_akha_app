/**
 * 🍒 THAI AKHA KITCHEN - HERITAGE & CULINARY DATABASE
 * Version: 2.0
 * Type: TypeScript Master Database
 */

export interface AkhaCultureDatabase {
  akha_culture_master_database: {
    metadata: Metadata;
    sections: Section[];
    summary: Summary;
  };
}

interface Metadata {
  app_name: string;
  author: string;
  version: string;
  total_sections: number;
  primary_language: string;
  target_audience: string;
}

export type SectionTag = 
  | "REGIONAL_CONTEXT" 
  | "HISTORICAL_ROOTS" 
  | "CULTURAL_IDENTITY" 
  | "TRADITION_FESTIVAL" 
  | "SIGNATURE_EXPERIENCE" 
  | "THAI_AKHA_KITCHEN" 
  | "GASTRONOMY_AKHA" 
  | "MODERN_LIFE_ECONOMY";

export interface Section {
  id: string;
  tag: SectionTag;
  order: number;
  title: string;
  subtitle: string;
  content: string;
  featured?: boolean;
  // Campi opzionali specifici per sezione
  ethnic_sections?: EthnicGroup[];
  key_stats?: KeyStats;
  ui_quote?: string;
  symbolism?: Record<string, string>;
  recipes?: Recipe[];
  quote?: string;
  principles?: string[];
  ui_highlight?: string;
  instrument_focus?: string;
  tech_specs?: TechSpecs;
  gender_roles?: GenderRoles;
  sacred_figures?: string[];
}

interface EthnicGroup {
  group: string;
  origins: string;
  cultural_depth: string;
  quote: string;
  distinction: string;
}

interface KeyStats {
  global_population: string;
  thailand_population: string;
  origins: string;
  settlement: string;
}

interface Recipe {
  name: string;
  description: string;
  chef_secret: string;
}

interface TechSpecs {
  altitude: string;
  method: string;
  impact: string;
}

interface GenderRoles {
  women: string;
  men: string;
}

interface Summary {
  key_themes: string[];
  school_mission: string;
}

export const AKHA_CULTURE_DB: AkhaCultureDatabase = {
  akha_culture_master_database: {
    metadata: {
      app_name: "Thai Akha Kitchen - Heritage & Culinary School",
      author: "Cultural History Specialist",
      version: "2.0",
      total_sections: 13,
      primary_language: "English",
      target_audience: "Tourists, Students, Cultural Visitors"
    },
    sections: [
      {
        id: "hill_tribes_overview",
        tag: "REGIONAL_CONTEXT",
        order: 0,
        title: "The Highland Mosaic: Northern Thailand’s Ethnic Groups",
        subtitle: "An anthropological guide to the diverse ethnic minorities of the Golden Triangle",
        content: "Northern Thailand serves as a cultural crossroads for several ethnic minorities, each with a distinct migratory history and cosmological framework. Known collectively as 'Hill Tribes' or 'Chao Khao,' these groups—primarily the Karen, Hmong, Lahu, Akha, Mien, and Lisu—belong to three major linguistic families: Tibeto-Burman, Hmong-Mien, and Austroasiatic. Their presence in the highlands has shaped the region's agricultural landscape, particularly through the traditional 'swidden' (rotational) farming techniques. Beyond survival, their material culture—expressed through intricate silverwork, complex indigo dyeing, and geometric embroidery—serves as a visual language that encodes their history, social status, and spiritual beliefs.",
        ethnic_sections: [
          {
            group: "Karen (Pwa Ka Nyaw)",
            origins: "Tibeto-Burman / Myanmar",
            cultural_depth: "As the most populous group in Thailand, the Karen are esteemed for their ecological stewardship. They practice a sophisticated form of rotational farming that respects forest regeneration. Their textile tradition is famous for the 'white dress' (unmarried women’s tunic), symbolizing purity.",
            quote: "If the forest dies, the Karen cannot live; if the water dries, the Karen cannot breathe.",
            distinction: "Renowned for their harmonious relationship with elephants and sustainable terrace rice cultivation."
          },
          {
            group: "Hmong (Miao)",
            origins: "Hmong-Mien / Southern China",
            cultural_depth: "Celebrated for their entrepreneurial spirit and textile arts. They are masters of wax-resist indigo batik and intricate appliqué. Hmong society is organized into strong patrilineal clans where the shaman (Ua Neeb) mediates between worlds.",
            quote: "A man without a clan is like a bird without a wing; a woman without a needle is like a field without rain.",
            distinction: "Famous for the 'hundred-pleat' skirts and heavy, ornate silver neck rings."
          },
          {
            group: "Lahu (Mussur)",
            origins: "Tibeto-Burman / Yunnan",
            cultural_depth: "Historically 'The Great Hunters,' their spiritual life centers on 'G’ui-sha' (a supreme deity). Their aesthetics feature bold geometric patterns in red, white, and black, reflecting a history of forest-dwelling.",
            quote: "The forest is our mother, the crossbow is our father, and the community is our heart.",
            distinction: "Renowned for their mastery of the 'Khene' (bamboo organ) and egalitarian social structure."
          },
          {
            group: "Mien (Yao)",
            origins: "Hmong-Mien / China",
            cultural_depth: "Unique among hill tribes for adopting Chinese characters and Taoist practices. Mien women are famous for distinctive red pom-pom collars and embroidery worked from the back of the fabric.",
            quote: "A needle is our pen, and thread is our ink, writing the history of our ancestors on the cloth of today.",
            distinction: "The only group to possess ancient hand-written ritual books and a complex pantheon of Taoist deities."
          },
          {
            group: "Lisu (Lisaw)",
            origins: "Tibeto-Burman / Tibetan Plateau",
            cultural_depth: "Known as the 'Rainbow People' for neon-bright multi-layered tunics. They value individual freedom and competitive social display. Their New Year festival involves circle dancing to the sound of the 'subu' lute.",
            quote: "We wear the colors of the sunrise so the spirits may always find us happy.",
            distinction: "Distinguished by highly competitive 'merit-feasts' and thousands of tiny silver buttons on festive garments."
          }
        ]
      },
      {
        id: "historical_roots",
        tag: "HISTORICAL_ROOTS",
        order: 1,
        title: "The Journey from the Tibetan Plateau",
        subtitle: "Centuries of migration from Southern China into the Golden Triangle",
        content: "The Akha are a Tibeto-Burman ethnic group whose ethno-historical narrative describes a centuries-long southward migration from the high-altitude regions of the Tibetan Plateau. Anthropological evidence suggests their presence in the Sipsongpanna region of Yunnan Province for over 1,500 years before political shifts prompted further movement. They followed a geographic arc through Myanmar, Laos, and Vietnam, reaching Northern Thailand in the early 1900s. Today, approximately 80,000 Akha live in Thailand and about 600,000 worldwide, maintaining a resilient identity forged through migration.",
        key_stats: {
          global_population: "600,000+",
          thailand_population: "~80,000",
          origins: "Yunnan Province / Tibetan Plateau",
          settlement: "Early 1900s (Chiang Rai) from Kathmandu"
        }
      },
      {
        id: "akha_zang",
        tag: "CULTURAL_IDENTITY",
        order: 2,
        title: "The 'Akha Way' (Akha Zang)",
        subtitle: "The oral constitution governing morality, social law, and cosmic balance",
        content: "Akha Zang, or 'The Akha Way,' is an oral constitution that integrates religion, law, and social custom into a singular lifestyle. Lacking a traditional written script, the Akha rely on the transmission of stories and rituals from elders to youth. Akha Zang provides a blueprint for 'correct living,' encompassing agricultural techniques, forest management, and kinship obligations. Central to this is the recitation of patrilineal lineage, often tracing back over 60 generations. This continuity sustains the 'Pyaw' (balance) between the human and spirit worlds, ensuring community health and fertile land.",
        ui_quote: "To follow Akha Zang is to live in balance with the seen and unseen worlds."
      },
      {
        id: "traditional_dress",
        tag: "CULTURAL_IDENTITY",
        order: 3,
        title: "The Language of Beads and Silver",
        subtitle: "Visual semiotics: Identity and status encoded in textile and metal",
        content: "Traditional Akha attire serves as a sophisticated semiotic system. Every bead, coin, and piece of silver has meaning. The woman’s headdress is a hand-crafted record of identity, subgroup (Ulo, Loimi, or Akha Phae), and life stage. Silver is highly prized for its apotropaic properties, believed to deflect evil spirits and sickness. The coins—ranging from old Burmese rupees to French Indochinese piastres—act as a portable family bank and a historical map of ancestral trade routes. Heavy headdresses signify responsibility and adulthood, while indigo-dyed fabrics represent the stability of the earth.",
        symbolism: {
          silver: "Protection and ritual purity",
          coins: "Ancestral wealth and trade history",
          indigo: "Grounding element of the earth",
          red_white: "Vitality and celebratory protection"
        }
      },
      {
        id: "swing_festival",
        tag: "TRADITION_FESTIVAL",
        order: 4,
        title: "The Swing Festival (Yehkuja)",
        subtitle: "Celebrating the 'Women's New Year' and agricultural renewal",
        content: "The Swing Festival, known as 'Yehkuja,' is a four-day ritual held in late August. Often recognized as the 'Women's New Year,' it celebrates the female role in sustaining life and culture. The centerpiece is a massive four-pillared wooden swing. As participants swing at high altitudes, it symbolizes a prayer for ripening rice and a connection between the terrestrial and celestial realms. The rhythmic motion is believed to stimulate fertility for both the women and the land. The festival includes ancestral offerings, choral singing, and communal feasting to secure the favor of the Goddess of Agriculture.",
        ui_quote: "When the swing flies high, the rice grows strong and the ancestors smile."
      },
      {
        id: "featured_recipes",
        tag: "SIGNATURE_EXPERIENCE",
        order: 5,
        featured: true,
        title: "The Akha Tradidional food: Signature Recipes of Our School",
        subtitle: "The three pillars of Akha Gastronomy: Foraged, Pounded, and Boiled",
        content: "At Thai Akha Kitchen, we teach the three essential dishes that define a traditional meal. These recipes are an education in mountain survival and ancestral flavor. By mastering the Akha Salad, Sapi Thong, and Akha Soup, you gain a deep understanding of how indigenous people transform forest herbs into a medicinal feast. This is the heart of our kitchen: the balance of the highlands on your plate.",
        recipes: [
          {
            name: "Akha Salad (Phak Chi Doi Salad)",
            description: "A vibrant explosion of mountain coriander, ginger, and roasted peanuts. It represents the 'Fresh' pillar of our kitchen.",
            chef_secret: "Master the 'bruising' technique to release oils without crushing the leaves."
          },
          {
            name: "Akha Sapi Thong (Chili Paste)",
            description: "A hand-pounded paste of fire-roasted chilies and 'Mak Khen' (wild pepper). It is the umami anchor of every meal.",
            chef_secret: "Never use a blender. The slow rhythm of the wooden mortar is the secret to its smoky depth."
          },
          {
            name: "Akha Herbal Soup (Restorative Broth)",
            description: "A clear, medicinal broth using roots and bitter greens to restore the body's 'Pyaw' (balance).",
            chef_secret: "Gently boil the herbs to extract healing properties without overwhelming bitterness."
          }
        ],
        quote: "We don't cook for the tongue alone, but for the spirit and the health of the family."
      },
      {
        id: "thai_akha_fusion",
        tag: "THAI_AKHA_KITCHEN",
        order: 6,
        title: "Thai Akha Kitchen: The Fusion of Two Worlds",
        subtitle: "Blending Thailand’s iconic flavors with Akha ancestral soul",
        content: "Our school is a cultural bridge. While we master the world-renowned Thai classics (Pad Thai, Curries, Tom Yum), we infuse every class with the spirit of the Akha people. We teach the master balance of Thai flavors while introducing the 'fifth element': the earthy, herbal, and smoky notes of the highlands. We use Thai ingredients and Akha hearts to create a celebration of the diversity that makes Northern Thailand’s food unique.",
        ui_quote: "We cook with Thai ingredients and Akha hearts."
      },
      {
        id: "foragers_pantry",
        tag: "GASTRONOMY_AKHA",
        order: 7,
        title: "The Forager's Pantry",
        subtitle: "Indigenous ingredients and the forest-to-table philosophy",
        content: "For the Akha, food comes from the forest, not the market. Foraging is governed by Akha Zang—harvesting with respect and taking only what is needed. Akha cooking is elemental: grilling over fire, boiling wild plants, and pounding by hand. Ingredients like Mak Khen (wild pepper), bitter leaves, and mountain ginger are valued for their medicinal properties. Every meal is a gift from the forest that must be treated with care and gratitude.",
        principles: [
          "Sustainable forest-to-table sourcing",
          "Minimalist seasoning to preserve natural flavors",
          "Food as medicine to maintain bodily balance"
        ]
      },
      {
        id: "spirit_gate",
        tag: "TRADITION_FESTIVAL",
        order: 8,
        title: "The Spirit Gate (Loku-Pah)",
        subtitle: "The sacred boundary between the human and spirit worlds",
        content: "The 'Loku-Pah' is the most vital architectural feature of an Akha village. Constructed from wood and bamboo, it acts as a metaphysical filter, barring harmful spirits and illness while keeping protective energy inside. It features carved figures representing male and female principles to ensure fertility. Rebuilt annually, it signifies renewal. It is strictly taboo for outsiders to touch the gate, as it maintains the 'Pyaw' (balance) of the entire community.",
        ui_highlight: "TABOO: Do not touch the Spirit Gate; it protects the village's spiritual health."
      },
      {
        id: "music_folklore",
        tag: "CULTURAL_IDENTITY",
        order: 9,
        title: "Music and Oral Folklore",
        subtitle: "Preserving history through song and the Pii Pa leaf",
        content: "History for the Akha is sung and spoken, not written. Songs carry knowledge of rituals, farming, and courtship across generations. A unique highlight is the 'Pii Pa,' a masterclass in acoustic simplicity where a single fresh forest leaf is transformed into a wind instrument. By vibrating the leaf between the lips, a player produces haunting, flute-like melodies that mimic the sounds of nature, symbolizing the deep Akha connection to the environment.",
        instrument_focus: "Pii Pa: The ephemeral music of the forest leaf."
      },
      {
        id: "coffee_culture",
        tag: "MODERN_LIFE_ECONOMY",
        order: 10,
        title: "The Akha Coffee Revolution",
        subtitle: "Transitioning from opium to sustainable specialty Arabica",
        content: "Akha communities have pioneered a transition from opium cultivation to world-class coffee. Grown at 1,200m–1,500m under a natural forest canopy (shade-grown), Akha Arabica preserves biodiversity and protects mountain watersheds. This agroforestry model allows coffee cherries to ripen slowly, concentrating sugars and resulting in notes of citrus and chocolate. This industry has empowered a new generation of Akha entrepreneurs, roasters, and baristas to compete on the global stage.",
        tech_specs: {
          altitude: "1,200m - 1,500m",
          method: "100% Sustainable Shade-Grown",
          impact: "Environmental reforestation and economic sovereignty"
        },
        ui_quote: "We grow the bean of awakening to thrive and protect our forest."
      },
      {
        id: "communal_dining",
        tag: "GASTRONOMY_AKHA",
        order: 11,
        title: "Ritual Feasting and Etiquette",
        subtitle: "How food strengthens community bonds and lineage",
        content: "In Akha society, eating is a ritualized social event. During weddings and funerals, the whole village participates in cooking and serving. Hierarchy is respected: elders are served first. Sharing dishes from a central tray reinforces the idea that the individual is part of a larger whole. Etiquette is strictly observed—waste is avoided, and gratitude is shown through quiet participation. These communal meals are where Akha values are passed to the younger generation.",
        gender_roles: {
          women: "Managers of grain, vegetables, and seasoning",
          men: "Responsible for ritual slaughter and fire management"
        }
      },
      {
        id: "religion_beliefs",
        tag: "CULTURAL_IDENTITY",
        order: 12,
        title: "The Akha Cosmos: Religion and Belief",
        subtitle: "Ancestors, nature spirits, and the maintenance of balance",
        content: "Akha spirituality is an intricate web of animism and ancestor veneration inseparable from daily existence. The universe is populated by spirits (Ne), and humans must maintain a clear separation between the human domain and the 'wild' domain. Ritual specialists like the 'Dzo-ma' (spiritual leader) and 'Phu-mo' (shaman) manage this balance. While many have adopted Christianity or Buddhism, a unique syncretism often occurs, blending new faiths with ancestral customs to preserve Akha identity.",
        sacred_figures: [
          "Dzo-ma: Spiritual village head",
          "Phu-mo: Master of chants and soul-calling",
          "Baji: The sacred blacksmith"
        ]
      }
    ],
    summary: {
      key_themes: ["Akha Zang", "Ancestor worship", "Ecological stewardship", "Cultural Fusion", "Agroforestry Coffee"],
      school_mission: "Translating Akha heritage into a global culinary language."
    }
  }
};