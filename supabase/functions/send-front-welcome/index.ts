// Path: supabase/functions/send-front-welcome/index.ts
// #172: welcome email brandizzata (EN/TH) alla registrazione di un cliente B2C sul front.
// Invocata via functions.invoke da front/services/auth.service.ts dopo signUp riuscito
// (non-blocking: un errore qui non ferma registrazione ne' booking).
// Specchio di send-admin-welcome: templates.ts copiato dal master brain 148/1481_02.
//
// Sicurezza (stesse regole di send-admin-welcome, audit 2026-08 #85):
//   - JWT obbligatorio: senza utente → 401
//   - l'email destinataria e' SEMPRE quella dell'utente autenticato (il body non la sceglie)
//   - cta_url solo verso origin in allowlist, altrimenti default
//   - rate limit per utente (2 / ora)

import { createClient } from 'npm:@supabase/supabase-js@2'
import { WELCOME_FRONT_EN_HTML, WELCOME_FRONT_TH_HTML, renderEmail } from './templates.ts'
import { isAllowedRedirect, rateLimit } from '../_shared/edgeGuard.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'
const DEFAULT_CTA_URL = 'https://www.thaiakha.com/thai-cooking-classes-chiang-mai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Lang = 'en' | 'th'

interface WelcomePayload {
  user_name?: string
  lang?: string
  cta_url?: string
}

const TEMPLATE: Record<Lang, string> = {
  en: WELCOME_FRONT_EN_HTML,
  th: WELCOME_FRONT_TH_HTML,
}

// Subject dal prompt master (148/1481_02/_prompts/welcome_CLAUDE_CODE_PROMPT)
const SUBJECT: Record<Lang, string> = {
  en: 'Welcome to Thai Akha Kitchen',
  th: 'ยินดีต้อนรับสู่ Thai Akha Kitchen',
}

const NAME_FALLBACK: Record<Lang, string> = { en: 'there', th: 'คุณ' }

async function sendResend(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  const detail = await res.json()
  return { ok: res.ok, id: (detail as { id?: string }).id, detail }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY non configurata')

    // Chi chiama? Il destinatario e' l'utente stesso.
    const authHeader = req.headers.get('Authorization') ?? ''
    const authClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData } = await authClient.auth.getUser()
    const user = userData?.user
    if (!user?.email) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    if (!rateLimit(`welcome-front:${user.id}`, 2, 60 * 60_000)) {
      return new Response(JSON.stringify({ ok: true, skipped: 'rate_limit' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const p: WelcomePayload = await req.json()
    const email = user.email

    // Il front ha 12 lingue: TH ha il suo template, tutte le altre ricadono su EN
    const lang: Lang = p.lang === 'th' ? 'th' : 'en'

    const html = renderEmail(TEMPLATE[lang], {
      user_name: (p.user_name ?? '').trim() || NAME_FALLBACK[lang],
      cta_url: (p.cta_url && isAllowedRedirect(p.cta_url)) ? p.cta_url.trim() : DEFAULT_CTA_URL,
    })

    const sent = await sendResend(email, SUBJECT[lang], html)
    if (!sent.ok) {
      console.error('send-front-welcome Resend error:', sent.detail)
      throw new Error('Resend invio fallito')
    }

    return new Response(JSON.stringify({ ok: true, id: sent.id, lang }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('send-front-welcome error:', error)
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
