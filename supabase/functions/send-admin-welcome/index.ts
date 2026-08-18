// Path: supabase/functions/send-admin-welcome/index.ts
// Welcome email brandizzata (EN/TH) alla registrazione di un partner agency (admin side).
// Invocata via functions.invoke da SignUpForm dopo signup riuscito (non-blocking).
// Specchio di send-password-reset (Resend + templates.ts dal brain). Niente admin client.
//
// Sicurezza (audit 2026-08, #85): dopo signUp la sessione esiste (email confirmations
// disabilitate: le RPC di consenso legale la usano gia'), quindi:
//   - JWT obbligatorio: senza utente → 401
//   - l'email destinataria e' SEMPRE quella dell'utente autenticato (il body non la sceglie):
//     niente invio di email brandizzate a indirizzi arbitrari
//   - login_url solo verso origin in allowlist
//   - rate limit per utente (2 / ora)

import { createClient } from 'npm:@supabase/supabase-js@2'
import { WELCOME_ADMIN_EN_HTML, WELCOME_ADMIN_TH_HTML, renderEmail } from './templates.ts'
import { isAllowedRedirect, rateLimit } from '../_shared/edgeGuard.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'
const DEFAULT_LOGIN_URL = 'https://admin.thaiakha.com/signin'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Lang = 'en' | 'th'

interface WelcomePayload {
  email?: string
  user_name?: string
  lang?: string
  login_url?: string
}

const TEMPLATE: Record<Lang, string> = {
  en: WELCOME_ADMIN_EN_HTML,
  th: WELCOME_ADMIN_TH_HTML,
}

const SUBJECT: Record<Lang, string> = {
  en: 'Welcome to Thai Akha Kitchen',
  th: 'ยินดีต้อนรับสู่ Thai Akha Kitchen',
}

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
    if (!rateLimit(`welcome:${user.id}`, 2, 60 * 60_000)) {
      return new Response(JSON.stringify({ ok: true, skipped: 'rate_limit' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const p: WelcomePayload = await req.json()
    const email = user.email

    const lang: Lang = p.lang === 'th' ? 'th' : 'en' // es/zh → fallback EN (template non ancora tradotti)

    const html = renderEmail(TEMPLATE[lang], {
      user_name: (p.user_name ?? '').trim() || 'there',
      account_email: email,
      login_url: (p.login_url && isAllowedRedirect(p.login_url)) ? p.login_url.trim() : DEFAULT_LOGIN_URL,
    })

    const sent = await sendResend(email, SUBJECT[lang], html)
    if (!sent.ok) {
      console.error('send-admin-welcome Resend error:', sent.detail)
      throw new Error('Resend invio fallito')
    }

    return new Response(JSON.stringify({ ok: true, id: sent.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('send-admin-welcome error:', error)
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
