// Path: supabase/functions/send-booking-confirmation/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// Importiamo i template che abbiamo creato
import { getGuestEmailHtml, getAdminEmailHtml } from './templates.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        // 1. Leggi i dati dal Webhook di Supabase
        const payload = await req.json()
        const booking = payload.record // Il record nella tabella 'bookings'

        if (!booking) throw new Error("No booking record found")

        console.log(`📧 Processing email for booking ID: ${booking.id}`)

        const supabaseAdmin = createClient(SUPABASE_URL ?? '', SUPABASE_SERVICE_ROLE_KEY ?? '')

        // 2. RECUPERA DATI AGENZIA/BOOKER
        const { data: bookerProfile } = await supabaseAdmin
            .from('profiles')
            .select('full_name, email')
            .eq('id', booking.user_id)
            .single()

        // 3. RECUPERA DATI GUEST (se esiste account)
        let guestProfile = null
        if (booking.guest_user_id) {
            const { data } = await supabaseAdmin
                .from('profiles')
                .select('full_name, email')
                .eq('id', booking.guest_user_id)
                .single()
            guestProfile = data
        }

        const isAgency = booking.payment_method === 'agency_invoice';
        const isAccountMode = !!booking.guest_user_id;

        // Dati consolidati per il template
        const guestName = guestProfile?.full_name || booking.guest_name || 'Guest';
        const guestEmail = guestProfile?.email || booking.guest_email;
        const agencyName = bookerProfile?.full_name || 'Agency'

        const bookingData = {
            ...booking,
            guest_name: guestName,
            agency_name: agencyName,
            booking_ref: booking.internal_id?.slice(0, 8).toUpperCase() || booking.id?.slice(0, 8).toUpperCase()
        };

        const emailsToSend = []

        // --- A. SEMPRE ALL'ADMIN ---
        emailsToSend.push({
            from: 'Thai Akha Bot <bookings@thaiakhakitchen.com>',
            to: ['office@thaiakhakitchen.com'],
            subject: `🔔 New Booking: ${guestName} (${booking.booking_date})`,
            html: getAdminEmailHtml(bookingData, isAgency)
        })

        // --- B. ALL'AGENZIA (Solo se payment_method è agency_invoice) ---
        if (isAgency) {
            emailsToSend.push({
                from: 'Thai Akha Kitchen <bookings@thaiakhakitchen.com>',
                to: [bookerProfile?.email],
                subject: isAccountMode ? `B2B Receipt: ${guestName}` : `Booking Voucher: ${guestName}`,
                html: isAccountMode
                    ? `<p>Receipt for ${guestName}. Account created.</p>${getGuestEmailHtml(bookingData)}`
                    : getGuestEmailHtml(bookingData)
            })
        }

        // --- C. AL GUEST ---
        if (guestEmail) {
            if (isAccountMode) {
                // INVIO WELCOME EMAIL (Account creato da Agenzia o Admin)
                emailsToSend.push({
                    from: 'Thai Akha Kitchen <bookings@thaiakhakitchen.com>',
                    to: [guestEmail],
                    subject: `Welcome to Thai Akha Kitchen!`,
                    html: `<p>Sawasdee kha ${guestName}! Your account has been created by ${agencyName}.</p>${getGuestEmailHtml(bookingData)}<p>Login with your email and the temporary password provided.</p>`
                })
            } else if (!isAgency) {
                // INVIO CONFERMA STANDARD (Prenotazione normale senza creazione account)
                emailsToSend.push({
                    from: 'Thai Akha Kitchen <bookings@thaiakhakitchen.com>',
                    to: [guestEmail],
                    subject: `Confirmation: Cooking Class on ${booking.booking_date}`,
                    html: getGuestEmailHtml(bookingData)
                })
            }
        }

        // 4. INVIO REALE TRAMITE API RESEND
        const results = await Promise.all(emailsToSend.map(email =>
            fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`
                },
                body: JSON.stringify(email)
            })
        ))

        const responses = await Promise.all(results.map(r => r.json()));
        console.log("Resend responses:", responses);

        return new Response(JSON.stringify({ success: true, sent: emailsToSend.length, details: responses }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Error sending emails:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
