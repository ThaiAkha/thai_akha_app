// Path: supabase/functions/send-booking-confirmation/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { getGuestEmailHtml, getAdminEmailHtml } from './templates.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    // 1. GESTIONE CORS
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        // 2. VALIDAZIONE ENVIRONMENT
        if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is missing")
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config is missing")

        // 3. ESTRAZIONE DATI
        const payload = await req.json()
        const booking = payload.record || payload
        
        if (!booking || (!booking.id && !booking.internal_id)) {
            throw new Error("Invalid booking data")
        }

        console.log(`📧 [EMAIL] Processing booking: ${booking.internal_id || booking.id}`)

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 4. RECUPERO PROFILI
        const { data: booker } = await supabaseAdmin
            .from('profiles')
            .select('full_name, email, role')
            .eq('id', booking.user_id)
            .maybeSingle()

        let guest = null
        if (booking.guest_user_id) {
            const { data } = await supabaseAdmin
                .from('profiles')
                .select('full_name, email')
                .eq('id', booking.guest_user_id)
                .maybeSingle()
            guest = data
        }

        // 5. MAPPING DATI
        const isAgency = booking.payment_method === 'agency_invoice' || booker?.role === 'agency';
        const guestName = guest?.full_name || booking.guest_name || 'Guest';
        const guestEmail = guest?.email || booking.guest_email;
        
        const bookingData = {
            ...booking,
            guest_name: guestName,
            booking_ref: (booking.internal_id || booking.id || "00000000").slice(0, 8).toUpperCase()
        };

        const emails = []

        // --- A. ADMIN EMAIL ---
        emails.push({
            from: 'Thai Akha Bot <bookings@thaiakhakitchen.com>',
            to: ['office@thaiakhakitchen.com'],
            subject: `🔔 ${isAgency ? '[AGENCY]' : ''} New Booking: ${guestName} (${booking.booking_date})`,
            html: getAdminEmailHtml(bookingData, isAgency)
        })

        // --- B. GUEST EMAIL ---
        if (guestEmail) {
            emails.push({
                from: 'Thai Akha Kitchen <bookings@thaiakhakitchen.com>',
                to: [guestEmail],
                subject: `Confirmed: Your Cooking Class on ${booking.booking_date} ✅`,
                html: getGuestEmailHtml(bookingData)
            })
        }

        // 6. INVIO TRAMITE RESEND
        const validEmails = emails.filter(e => e.to && e.to[0]);

        if (validEmails.length === 0) {
            return new Response(JSON.stringify({ success: true, message: "No valid recipients" }), { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            })
        }

        const results = await Promise.all(validEmails.map(async (email) => {
            try {
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${RESEND_API_KEY}`
                    },
                    body: JSON.stringify(email)
                })
                const data = await res.json()
                return { success: res.ok, data, to: email.to[0] }
            } catch (e: any) {
                return { success: false, error: e.message || String(e), to: email.to[0] }
            }
        }))

        const totalSuccess = results.filter(r => r.success).length

        return new Response(JSON.stringify({ 
            success: true, 
            sent_count: totalSuccess, 
            results 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error("❌ [CRITICAL ERROR]:", error.message || String(error))
        return new Response(JSON.stringify({ error: error.message || String(error) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
