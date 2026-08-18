// Path: supabase/functions/create-guest-user/index.ts
//
// Crea (o ritrova) un account GUEST per una prenotazione fatta dallo staff o da un'agenzia.
// Chiamanti: admin/hooks/useAdminBooking.ts, admin/pages/agency/AgencyBooking.tsx (functions.invoke → JWT utente).
//
// Sicurezza (audit 2026-08, P1):
//   - richiede il JWT dell'utente chiamante (la anon key da sola NON basta)
//   - il chiamante deve avere ruolo in ALLOWED_ROLES (profiles.role)
//   - status HTTP reali (400/401/403/500), niente 200 su errore
//   - "utente gia' registrato" → restituisce l'id SOLO a chiamanti autorizzati (riprenotazione ospite di ritorno)

import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_ROLES = ['admin', 'manager', 'agency']

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

        // 1) Chi chiama? Serve il JWT dell'utente (functions.invoke lo manda in Authorization).
        const authHeader = req.headers.get('Authorization') ?? ''
        const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
            global: { headers: { Authorization: authHeader } },
        })
        const { data: userData } = await authClient.auth.getUser()
        const callerId = userData?.user?.id
        if (!callerId) return json({ error: 'Unauthorized' }, 401)

        const { data: caller } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', callerId)
            .single()
        if (!caller || !ALLOWED_ROLES.includes(caller.role)) return json({ error: 'Forbidden' }, 403)

        // 2) Input
        const body = await req.json().catch(() => ({}))
        const { email, password, fullName, full_name, name, phone } = body ?? {}
        const displayName: string | undefined = name || fullName || full_name

        if (!email || !password) return json({ error: 'Email and password are required' }, 400)

        console.log(`[create-guest-user] caller=${callerId} role=${caller.role} email=${email}`)

        // 3) Crea l'utente
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: displayName, phone },
        })

        if (error) {
            // Ospite di ritorno: restituisci l'id esistente (chiamante gia' autorizzato sopra)
            if (error.message.includes('already been registered')) {
                const { data: existingUser } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle()
                if (existingUser) return json({ userId: existingUser.id, isNew: false })
            }
            console.error('[create-guest-user] createUser error:', error.message)
            return json({ error: `Auth Error: ${error.message}` }, 500)
        }

        // 4) Profilo guest
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: data.user.id,
                email,
                full_name: displayName,
                role: 'guest',
                dietary_profile: 'diet_regular',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })

        if (profileError) {
            console.error('[create-guest-user] profile upsert failed:', profileError.message)
            return json({ error: `User created but Profile failed: ${profileError.message}`, userId: data.user.id }, 500)
        }

        return json({ userId: data.user.id, isNew: true })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('[create-guest-user] system error:', message)
        return json({ error: `System Error: ${message}` }, 500)
    }
})
