// Path: supabase/functions/send-password-reset/index.ts
// Password reset brandizzato (EN/TH) — NON usa l'email di recovery di default di Supabase.
//   1) genera il recovery link via auth.admin.generateLink (service-role) → NON invia nulla
//   2) costruisce un link token_hash (PKCE-safe, immune ai prefetch GET) → {{reset_url}} + {{expiry_minutes}}
//   3) invia con Resend dal dominio verificato office@thaiakhakitchen.com
// Specchio di send-driver-payout-confirmation. Template embeddati in ./templates.ts (shell dal brain).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { PASSWORD_RESET_EN_HTML, PASSWORD_RESET_TH_HTML, renderEmail } from './templates.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const FROM = 'Thai Akha Kitchen <office@thaiakhakitchen.com>'

// TODO: allineare alla config Auth `mailer_otp_exp` (OTP/recovery expiry, in secondi).
// Non è leggibile a runtime senza Management API → costante mantenuta in sync a mano.
const RESET_LINK_EXP_MIN = 60

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Lang = 'en' | 'th'

interface ResetPayload {
  email?: string
  lang?: string
  redirectTo?: string
}

const TEMPLATE: Record<Lang, string> = {
  en: PASSWORD_RESET_EN_HTML,
  th: PASSWORD_RESET_TH_HTML,
}

const SUBJECT: Record<Lang, string> = {
  en: 'Reset your password — Thai Akha Kitchen',
  th: 'ตั้งรหัสผ่านใหม่ — Thai Akha Kitchen',
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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Service-role env non disponibile')

    const p: ResetPayload = await req.json()
    const email = (p.email ?? '').trim()
    if (!email) throw new Error('email mancante')

    const lang: Lang = p.lang === 'th' ? 'th' : 'en' // es/zh → fallback EN (template non ancora tradotti)

    // 1) Recovery link SENZA invio email di default
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: p.redirectTo ? { redirectTo: p.redirectTo } : undefined,
    })

    if (error) throw error

    // Use the PKCE-safe token_hash flow instead of the GET magic-link (action_link).
    // Email scanners / browser prefetchers fire a GET on action_link and CONSUME the
    // one-time token before the user clicks (logs showed 303 then 403 "One-time token
    // not found"). A token_hash link points straight at the app; the token is only
    // consumed by the client-side verifyOtp() POST, which a GET prefetch can't trigger.
    // Bonus: no Supabase /verify redirect → no Redirect-URL allowlist dependency.
    const tokenHash = data?.properties?.hashed_token
    if (!tokenHash) throw new Error('hashed_token non generato')
    const base = (p.redirectTo ?? '').replace(/[?#].*$/, '').replace(/\/$/, '')
    if (!base) throw new Error('redirectTo mancante')
    const resetUrl = `${base}?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`

    // 2) Render template per lingua
    const html = renderEmail(TEMPLATE[lang], {
      reset_url: resetUrl,
      expiry_minutes: RESET_LINK_EXP_MIN,
    })

    // 3) Invio Resend
    const sent = await sendResend(email, SUBJECT[lang], html)
    if (!sent.ok) {
      console.error('send-password-reset Resend error:', sent.detail)
      throw new Error('Resend invio fallito')
    }

    return new Response(JSON.stringify({ ok: true, id: sent.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('send-password-reset error:', error)
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
