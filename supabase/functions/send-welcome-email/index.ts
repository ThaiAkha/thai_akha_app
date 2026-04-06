import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@3.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

interface WebhookPayload {
  type: string
  data: {
    user: {
      id: string
      email: string
      user_metadata: {
        full_name: string
      }
    }
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const payload: WebhookPayload = await req.json()

  // Verifica che sia un evento di signup
  if (payload.type !== "user_signup") {
    return new Response("Not a signup event", { status: 400 })
  }

  const user = payload.data.user
  const fullName = user.user_metadata?.full_name || "User"

  try {
    await resend.emails.send({
      from: "Thai Akha Kitchen <noreply@yourdomain.com>",
      to: user.email,
      subject: "Welcome to Thai Akha Kitchen!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f02539;">Welcome to Thai Akha Kitchen, ${fullName}!</h1>
          <p>We're excited to have you join our culinary community.</p>
          <p>Here's what you can explore:</p>
          <ul>
            <li>📚 Learn authentic Thai Akha recipes</li>
            <li>🎓 Take interactive cooking classes</li>
            <li>🍽️ Discover dietary insights</li>
            <li>🎯 Test your knowledge with quizzes</li>
          </ul>
          <a href="https://yourdomain.com" style="display: inline-block; background-color: #98C93C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px;">
            Start Cooking Now
          </a>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            © 2026 Thai Akha Kitchen. All rights reserved.
          </p>
        </div>
      `,
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error sending email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
