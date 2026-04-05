// packages/admin/src/prompts/adminPrompt.ts

export interface CherryAgentDefinition {
  id: string;
  name: string;
  identity: string;
  dbScope: string[];
  maxWords: { voice: number; text: number };
  voiceName: string;
}

export interface BookingDaySummary {
  date: string;
  session: string;
  pax: number;
  visitors: number;
  status: string;
  bookingRef?: string;
  hotelName?: string;
  pickupTime?: string;
  pickupZone?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  totalPrice?: number;
  specialRequests?: string;
  customerNote?: string;
}

export interface GuestAlert {
  name: string;
  date: string;
  session: string;
  dietary: string;
  allergies: string[];
  curryChoice?: string;
  soupChoice?: string;
  stirfryChoice?: string;
  spicinessLevel?: string;
}

export const CHERRY_BASE_IDENTITY = `
# CHERRY COPILOT — Thai Akha Kitchen Team AI
* **Politeness:** Always use "kha" (or "ค่ะ" in Thai) naturally at greetings and conclusions.
* **Warmth:** Embody Akha hospitality — gentle, patient, proud.
* **Northern Soul:** Chiang Mai spirit ("Rose of the North"). Do not use the "jao" dialect.
* **Language Chameleon:** Automatically mirror the language the user speaks to you.
* **Strict Stream (v6):** Pure conversational text ONLY. NO technical tags, NO generated lists of suggestions. Use standard Markdown.

## STAFF PROTOCOL
1. **Supportive Role:** You are here to support our staff and operators.
2. **Be Precise:** Provide accurate data insights from the database.
3. **No Hallucinations:** Use only the authorized data. IGNORE internal knowledge if it conflicts.
4. **Accuracy Protocol:** If info is missing, say: "I don't have this record right now kha."
`;

export const cherryAdmin: CherryAgentDefinition = {
  id: 'cherry_admin',
  name: 'Cherry Copilot',
  identity: `You are the expert assistant for the Thai Akha Kitchen management. You aid with bookings, class logistics, and staff operations. Use professional language with a soft Northern Thai touch.`,
  dbScope: ['bookings', 'cooking_classes', 'menu_selections', 'profiles', 'quiz_rewards'],
  maxWords: { voice: 50, text: 150 },
  voiceName: 'Charon',
};

export function buildAdminPrompt(
  userProfile: any,
  isVoiceMode: boolean,
  contextData: {
    cookingClasses?: any[];
    bookingSnapshot?: BookingDaySummary[];
    guestAlerts?: GuestAlert[];
  } = {}
): string {
  const agent = cherryAdmin;
  const wordLimit = isVoiceMode ? agent.maxWords.voice : agent.maxWords.text;
  const firstName = (userProfile?.full_name as string | undefined)?.split(' ')[0] ?? '';
  const role = userProfile?.role ?? 'operator';

  // --- Cooking Classes Data ---
  let classesData = '';
  if (contextData.cookingClasses?.length) {
    classesData = contextData.cookingClasses.map(c =>
      `- ID: ${c.id} | **${c.title}** | Price: ${c.price} ${c.currency ?? 'THB'} ${c.unit ?? 'per person'}\n  Tagline: ${c.tagline || ''}\n  Status: ${c.is_active ? 'ACTIVE' : 'INACTIVE'}`
    ).join('\n');
  } else {
    classesData = `- **Morning Cooking Class**: 1,400 THB per person\n- **Evening Cooking Class**: 1,300 THB per person`;
  }

  // --- Booking Intelligence (for admin/manager/staff) ---
  let operationalBlock = '';
  if (contextData.bookingSnapshot?.length) {
    const snapshotLines = contextData.bookingSnapshot.map(b => {
      const session = b.session.includes('evening') ? 'Evening' : 'Morning';
      const visitorNote = b.visitors > 0 ? ` + ${b.visitors} visitor${b.visitors > 1 ? 's' : ''}` : '';
      const lines = [`- **${b.date} ${session}** | ${b.pax} paying pax${visitorNote} | ${b.status}`];
      if (b.hotelName || b.pickupTime) {
        lines.push(`  Pickup: ${b.pickupTime ?? '—'} · ${b.hotelName ?? '—'}${b.pickupZone ? ` (${b.pickupZone})` : ''}`);
      }
      if (b.paymentMethod || b.paymentStatus) {
        lines.push(`  Payment: ${b.paymentMethod ?? '—'} · ${b.totalPrice ? `${b.totalPrice.toLocaleString()} THB` : '—'} · ${b.paymentStatus ?? '—'}`);
      }
      if (b.bookingRef) lines.push(`  Booking ref: ${b.bookingRef}`);
      if (b.specialRequests) lines.push(`  Special requests: "${b.specialRequests}"`);
      if (b.customerNote) lines.push(`  Customer note: "${b.customerNote}"`);
      return lines.join('\n');
    }).join('\n');

    let alertLines = '';
    if (contextData.guestAlerts?.length) {
      alertLines = contextData.guestAlerts.map(g => {
        const allergyText = g.allergies.length ? ` + Allergic to: ${g.allergies.join(', ')}` : '';
        const session = g.session.includes('evening') ? 'Evening' : 'Morning';
        const lines = [`- [${g.name}] ${session} ${g.date} — ${g.dietary}${allergyText}`];
        if (g.curryChoice || g.soupChoice || g.stirfryChoice || g.spicinessLevel) {
          const menuItems = [g.curryChoice, g.soupChoice, g.stirfryChoice].filter(Boolean).join(' · ');
          lines.push(`  Menu pre-selection: ${menuItems || '—'} · Spice: ${g.spicinessLevel ?? '—'}`);
        }
        return lines.join('\n');
      }).join('\n');
    }

    operationalBlock = `
### OPERATIONAL INTELLIGENCE (live data)
**Bookings — next 7 days:**
${snapshotLines}

**Guest Dietary Alerts (upcoming classes):**
${alertLines || 'No dietary alerts for upcoming sessions kha.'}
`;
  } else {
    operationalBlock = `\n### OPERATIONAL INTELLIGENCE\nNo upcoming bookings found in the next 7 days kha.\n`;
  }

  const dataBlock = `
### OFFICIAL DATA: COOKING CLASSES
${classesData}

### BUSINESS TERMS
- Cancellation: Free cancellation with 48h notice
- Payment: Cash or bank transfer on arrival
- Group discount: Available for 5+ pax — contact our team
- Private class: Available on request (max 16 pax)

### AUTHORIZED DATA SCOPE
You have access to: ${agent.dbScope.join(', ')}.
`;

  const modeInstructions = isVoiceMode
    ? `\n### MODE: VOICE CONVERSATION\n- Be extremely concise (max ${wordLimit} words).\n- Use a professional, spoken rhythm.\n- Close every turn with 'kha'.\n`
    : `\n### MODE: TEXT CHAT\n- Max ${wordLimit} words.\n- Use Markdown for bolding key data.\n- Close final sentence with 'kha'.\n`;

  return `${CHERRY_BASE_IDENTITY}

### ACTIVE AGENT: ${agent.name.toUpperCase()}
${agent.identity}

### OPERATIONAL CONTEXT
- Staff Name: ${firstName || 'Staff Member'}
- Staff Role: ${role}
${operationalBlock}
${dataBlock}
${modeInstructions}`;
}
