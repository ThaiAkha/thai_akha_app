// Path: supabase/functions/create-guest-user/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    console.log(`[EdgeFunc] Incoming Request: ${req.method} ${new URL(req.url).pathname}`);

    // 1. Gestione CORS (necessaria per chiamate dal browser)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { email, password, fullName, name, phone } = await req.json()

        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: "Email and password are required" }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        console.log(`[EdgeFunc] Attempting to create user: ${email}`);
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: name || fullName,
                phone: phone
            }
        })

        if (error) {
            // 🟢 FIX: Se l'utente esiste già, cercalo e restituisci il suo ID invece di lanciare errore
            if (error.message.includes("already been registered")) {
                console.log("[EdgeFunc] User exists, fetching ID...");
                const { data: existingUser } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle(); // Usa maybeSingle per evitare errori se non trovato

                if (existingUser) {
                    console.log(`[EdgeFunc] Existing user found: ${existingUser.id}`);
                    return new Response(
                        JSON.stringify({ userId: existingUser.id, isNew: false }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
                    )
                }
            }

            console.error("[EdgeFunc] Admin createUser error:", error.message);
            return new Response(
                JSON.stringify({ error: `Auth Error: ${error.message}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        console.log(`[EdgeFunc] User created: ${data.user.id}. Inserting profile...`);

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: data.user.id,
                email: email,
                full_name: name || fullName,
                role: 'guest',
                dietary_profile: 'diet_regular',
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

        if (profileError) {
            console.error("[EdgeFunc] Profile creation failed:", profileError.message);
            return new Response(
                JSON.stringify({ error: `User created but Profile failed: ${profileError.message}`, userId: data.user.id }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        console.log("[EdgeFunc] Success!");
        return new Response(
            JSON.stringify({ userId: data.user.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: `System Error: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
