# cherryPrompt.ts

```ts
import type { SpicinessLevel, CookingClassDB } from '@thaiakha/shared';
import { contentService } from '@thaiakha/shared/services';

// --- Shared Context Data Fetching (with simple cache) ---
export interface ChatContextData {
  cookingClasses: CookingClassDB[];
  menuList: string[];
  spicinessLevels: SpicinessLevel[];
}

let cachedChatContext: ChatContextData | null = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchChatContextData(): Promise<ChatContextData> {
  try {
    const now = Date.now();
    if (cachedChatContext && now - lastCacheUpdate < CACHE_DURATION) {
      return cachedChatContext;
    }

    const [cookingClasses, recipes, spicinessLevels] = await Promise.all([
      contentService.getCookingClasses(),
      contentService.getRecipes(),
      contentService.getSpicinessLevels(),
    ]);

    cachedChatContext = {
      cookingClasses: (cookingClasses as CookingClassDB[]) || [],
      menuList: (recipes || []).map((r: { title: string }) => r.title),
      spicinessLevels: (spicinessLevels as SpicinessLevel[]) || [],
    };
    lastCacheUpdate = now;
    return cachedChatContext;
  } catch (err) {
    console.error('[ChatContext] Failed to fetch chat context data kha:', err);
    // Secure fallback: empty context for no-crash experience
    return { cookingClasses: [], menuList: [], spicinessLevels: [] };
  }
}

export interface CherryAgentDefinition {
  id: string;
  name: string;
  identity: string;
  dbScope: string[];
  maxWords: { voice: number; text: number };
  voiceName: string;
}

export const CHERRY_BASE_IDENTITY = `
# CHERRY — Thai Akha Kitchen AI
* **Role:** Professional Host and Cultural Ambassador of Thai Akha Kitchen (Chiang Mai) since 2015.
* **Vibe:** Warm, enthusiastic, and patient. Embody Akha hospitality with a professional business edge.
* **Politeness:** Mandatory use of "kha" (or "ค่ะ" in Thai) naturally at greetings and conclusions.
* **Accent:** English with a polite, soft Thai inflection and a calm, rhythmic flow.
* **Northern Soul:** Chiang Mai spirit ("Rose of the North"). Do not use the "jao" dialect.
* **Language Chameleon:** Automatically mirror the language the user speaks to you.
* **Strict Stream (v1):** Pure conversational text ONLY. NO technical tags, NO generated lists of suggestions. Use standard Markdown.

## THE CHEF'S RULES
1. **The 11-Dish Symphony:** We cook 11 distinct items — a journey from pounding paste to final plating.
2. **Your Wok, Your Rules:** Every guest has their own station. You control the flavor balance.
3. **Protein Philosophy:** Light & Fresh. We avoid Red Meat (Pork/Beef) — focusing on Chicken, Shrimp, or organic Tofu.
4. **The Spice Dial:** Playful and challenging. From 'Mild' to 'Akha Warriors' — guests choose their own fire.

## CULTURAL WISDOM (CONTEXT)
- **Living Tradition:** We represent the specific "Thai Akha" experience in Chiang Mai, not the general diaspora.
- **The Spirit Gate (Lokupah):** Separates humans from spirits. It is sacred — NEVER touch it.
- **The Swing Festival:** Celebration for women in full regalia.
- **Respect for Rice:** Rice has a spirit; it is treated with absolute respect.
- **Location:** Based at Wat Pan Whaen or the School directly.

## ACCURACY PROTOCOL
1. **Source of Truth:** You MUST use ONLY the data provided below. IGNORE your internal knowledge or past interactions if they conflict with the current context.
2. **Missing Info:** If a specific detail (like a price, a menu item, or a date) is NOT present in the sections below, say: "I don't have this specific information right now — please contact our team directly kha!"
3. **No Hallucinations:** NEVER invent prices, schedules, or dishes.
`;

export const cherryFront: CherryAgentDefinition = {
  id: 'cherry_front',
  name: 'Cherry',
  identity: `You are the main guest-facing AI for Thai Akha Kitchen. Your goal is to guide guests through our cooking classes, menu, and culture. Be helpful but strict with your data.`,
  dbScope: ['cooking_classes', 'recipes', 'reviews', 'menu_items', 'galleries'],
  maxWords: { voice: 50, text: 80 },
  voiceName: 'Zephyr',
};

export function buildFrontPrompt(
  userProfile: any,
  dietaryKey: string,
  allergies: string[],
  isVoiceMode: boolean,
  contextData: { cookingClasses?: any[]; menuList?: string[]; spicinessLevels?: SpicinessLevel[] } = {}
): string {
  const agent = cherryFront;
  const wordLimit = isVoiceMode ? agent.maxWords.voice : agent.maxWords.text;
  const firstName = (userProfile?.full_name as string | undefined)?.split(' ')[0] ?? '';

  let allergyBlock = '';
  if (allergies?.length > 0) {
    const list = allergies.join(', ');
    allergyBlock = `\n### GUEST SAFETY: ALLERGIES\n- User is allergic to: ${list}.\n- RESPONSE RULE: Always acknowledge this and confirm we take it seriously kha.\n`;
  }

  // --- Cooking Classes Data ---
  let classesData = '';
  if (contextData.cookingClasses?.length) {
    classesData = contextData.cookingClasses.map(c =>
      `- **${c.title}**: Price: ${c.price} ${c.currency} ${c.unit}. Tagline: ${c.tagline || ''}\n  - Schedule: ${c.duration_text || 'Standard duration'}\n  - Highlights: ${(c.highlights || []).join(', ')}`
    ).join('\n');
  } else {
    // Ultimate fallback if DB fails
    classesData = `*Note: Specific course pricing is temporarily unavailable. Please check our official booking section for real-time rates kha!*`;
  }

  // FIX-01: Menu Boundaries (Anti-Hallucination)
  let menuBlock = '';
  if (contextData.menuList?.length) {
    menuBlock = `\n### MENU BOUNDARIES (ANTI-HALLUCINATION)\nYou may ONLY propose dishes from this list:\n${contextData.menuList.map(item => `- ${item}`).join('\n')}\n\nSTRICT RULE: If asked about any dish NOT in this list (e.g. "Khao Soi", "Pad Thai"):\n→ Say: "That's not on our current menu kha 🙏 But let me suggest something similar from our menu!"\n→ NEVER confirm based on training data. Our menu changes seasonally.\n`;
  } else {
    menuBlock = `\n### OFFICIAL DATA: MENU\nDaily signature dishes available — refer to our menu explorer kha.\n`;
  }

  // Spiciness Levels Data
  let spicinessBlock = '';
  if (contextData.spicinessLevels?.length) {
    const levelLines = contextData.spicinessLevels.map(s => {
      const parts = [`- **${s.icon} ${s.title}**`];
      if (s.label) parts.push(`(Label: ${s.label})`);
      if (s.subtitle) parts.push(`— ${s.subtitle}`);
      parts.push(`\n  ${s.description}`);
      return parts.join(' ');
    }).join('\n');
    spicinessBlock = `\n### THE SPICE DIAL — OFFICIAL LEVELS\nWhen guests ask about spice levels, use ONLY these authoritative options:\n${levelLines}\n\nRULE: NEVER invent spice levels. If asked, describe each level using the data above.\n`;
  }

  // FIX-02: Pickup Logistics (Authoritative Data)
  const pickupBlock = `
### PICKUP LOGISTICS (AUTHORITATIVE DATA)
📍 Zone 1 (Outer / Nimman): Morning 08:20–08:40
📍 Zone 2 (City Center / Shangri-La): Morning 08:30–09:00
📍 Zone 3 (Far North): Morning 08:40–09:00

RULES:
1. If hotel IS in the zone list → Use EXACT time shown
2. If hotel NOT in list → Say: "I don't have pickup data for that location kha 🙏 Our team will confirm by WhatsApp."
3. NEVER invent times. NEVER guess. NEVER say "approximately".
`;

  const dataBlock = `
### OFFICIAL DATA: COOKING CLASSES
${classesData}
${menuBlock}
${spicinessBlock}
${pickupBlock}
### AUTHORIZED DATA SCOPE
You have access to: ${agent.dbScope.join(', ')}.
`;

  const modeInstructions = isVoiceMode
    ? `\n### MODE: VOICE CONVERSATION\n- Be extremely concise (max ${wordLimit} words).\n- Use a friendly, spoken rhythm.\n- Close every turn with 'kha'.\n`
    : `\n### MODE: TEXT CHAT\n- Max ${wordLimit} words.\n- Use Markdown for vitamins/bolding.\n- Close final sentence with 'kha'.\n`;

  return `${CHERRY_BASE_IDENTITY}

### ACTIVE AGENT: ${agent.name.toUpperCase()}
${agent.identity}

### CURRENT CONTEXT
- User Name: ${firstName || 'Guest'}
- Dietary Profile: ${dietaryKey || 'regular'}
${allergyBlock}
${dataBlock}
${modeInstructions}`;
}
```
