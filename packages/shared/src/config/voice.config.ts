// packages/shared/src/config/voice.config.ts

export interface VoiceConfig {
  voiceName: string;
  accentPrompt: string;
  fallbackTTSPreferences?: string[];
}

const VOICE_PRESETS: Record<string, VoiceConfig> = {
  default: {
    voiceName: 'Zephyr',
    accentPrompt: `You are Cherry, a warm Thai host with a gentle Northern Thai accent. Your English is fluent but spoken with a soft Thai rhythm, using polite particles like 'kha'. Never lose your accent — it's part of your charm.`,
    fallbackTTSPreferences: ['Google th-TH', 'Kanya', 'Narisa'],
  },
  child: {
    voiceName: 'Puck',
    accentPrompt: `You are a magical storyteller. Use a playful, high-energy voice. Your Thai accent is very light. Keep sentences short, full of wonder, and end with a cheerful question.`,
    fallbackTTSPreferences: ['Google th-TH', 'Kanya', 'Narisa'],
  },
  teen: {
    voiceName: 'Zephyr',
    accentPrompt: `Speak with energy and a modern vibe. Your Thai accent is subtle, but you can use words like 'awesome' and 'cool'. Keep it fun and engaging.`,
    fallbackTTSPreferences: ['Google th-TH', 'Kanya', 'Narisa'],
  },
  agency_en: {
    voiceName: 'Kore',
    accentPrompt: `You are a professional Thai assistant. Speak clearly with a gentle Thai accent, using polite particles 'kha'. Be precise, data-driven, and business-oriented.`,
    fallbackTTSPreferences: ['Google th-TH', 'Kanya', 'Narisa'],
  },
  agency_th: {
    voiceName: 'Kore',
    accentPrompt: `คุณเป็นผู้ช่วยมืออาชีพชาวไทย พูดภาษาไทยให้ชัดเจนและสุภาพ ใช้คำลงท้าย 'ค่ะ' (kha) อย่างเหมาะสม ให้ข้อมูลที่ถูกต้องและเป็นประโยชน์`,
    fallbackTTSPreferences: ['Google th-TH', 'Kanya', 'Narisa'],
  },
  staff: {
    voiceName: 'Charon',
    accentPrompt: `Be direct and efficient. Your Thai accent is light. Focus on summaries, numbers, and actionable insights.`,
    fallbackTTSPreferences: ['Google th-TH', 'Kanya', 'Narisa'],
  },
  aoide: {
    voiceName: 'Aoide',
    accentPrompt: `You are Cherry in storytelling mode. Use a warm, melodic voice with gentle Thai inflections. Your pace is unhurried and musical, perfect for cultural narratives and cooking instructions.`,
    fallbackTTSPreferences: ['Google th-TH', 'Kanya', 'Narisa'],
  },
};

/**
 * Returns a VoiceConfig for a specific agent preset key.
 * Falls back to 'default' if the preset key is not found.
 */
export function getVoiceConfigByPreset(presetKey: string): VoiceConfig {
  return VOICE_PRESETS[presetKey] ?? VOICE_PRESETS.default;
}

export function getVoiceConfig(
  userProfile: any,
  appContext: 'front' | 'admin'
): VoiceConfig {
  const age = userProfile?.age;
  const role = userProfile?.role;
  const lang = userProfile?.preferred_language || 'en';

  if (role === 'agency' && lang === 'th') return VOICE_PRESETS.agency_th;
  if (role === 'agency') return VOICE_PRESETS.agency_en;
  if (role && ['admin', 'manager', 'kitchen', 'driver'].includes(role)) return VOICE_PRESETS.staff;
  if (appContext === 'admin') return VOICE_PRESETS.staff;
  if (role === 'user' && age !== undefined) {
    if (age < 13) return VOICE_PRESETS.child;
    if (age >= 13 && age <= 18) return VOICE_PRESETS.teen;
  }
  return VOICE_PRESETS.default;
}
