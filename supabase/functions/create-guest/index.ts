// Path: supabase/functions/create-guest/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. Gestione CORS (necessaria per chiamate dal browser)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Crea il client Supabase con permessi ADMIN (Service Role)
        // Questo permette di creare utenti senza essere loggati come loro.
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Leggi i dati inviati dalla App React
        const { email, password, fullName, phone } = await req.json()

        if (!email || !password) {
            throw new Error("Email and password are required")
        }

        // 4. Crea l'utente "Ghost" (Auto-confirm per permettere login immediato)
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // ✅ L'utente è subito attivo
            user_metadata: {
                full_name: fullName,
                phone: phone
            }
        })

        if (error) throw error

        // 5. Ritorna l'ID del nuovo utente all'Agenzia
        return new Response(
            JSON.stringify({ userId: data.user.id }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
