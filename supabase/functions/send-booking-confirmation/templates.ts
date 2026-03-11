// Path: supabase/functions/send-booking-confirmation/templates.ts

interface BookingData {
    guest_name: string;
    booking_date: string;
    pax_count: number;
    total_price: number;
    booking_ref: string;
    session_id: string;
}

// Stile Base (CSS inline per email)
const style = `
  font-family: 'Helvetica', sans-serif;
  color: #333;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
`;

const header = (title: string) => `
  <div style="background-color: #FB2E58; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
  </div>
`;

// TEMPLATE 1: Email per il Cliente (GUEST)
export const getGuestEmailHtml = (b: BookingData) => `
  <div style="${style}">
    ${header("Booking Confirmed! ✅")}
    <div style="padding: 20px;">
      <p>Sawasdee kha <strong>${b.guest_name}</strong>,</p>
      <p>Thank you for booking with Thai Akha Kitchen! We are excited to cook with you.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${b.booking_date}</p>
        <p style="margin: 5px 0;"><strong>🍳 Class:</strong> ${b.session_id.includes('morning') ? 'Morning Market Tour' : 'Evening Sunset Feast'}</p>
        <p style="margin: 5px 0;"><strong>👥 Pax:</strong> ${b.pax_count} People</p>
        <p style="margin: 5px 0;"><strong>💰 Total:</strong> ${b.total_price.toLocaleString()} THB (Pay on Arrival)</p>
      </div>

      <p>Please refer to your Booking Ref: <strong>#${b.booking_ref || 'PENDING'}</strong></p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">Thai Akha Kitchen - Chiang Mai</p>
    </div>
  </div>
`;

// TEMPLATE 2: Email per l'Ufficio (ADMIN)
export const getAdminEmailHtml = (b: BookingData, isAgency: boolean) => `
  <div style="${style}">
    ${header("🔔 New Booking Alert")}
    <div style="padding: 20px;">
      <h2 style="margin-top: 0;">${b.guest_name}</h2>
      ${isAgency ? '<p style="color: #FB2E58; font-weight: bold;">[AGENCY BOOKING]</p>' : ''}
      
      <ul>
        <li><strong>Date:</strong> ${b.booking_date}</li>
        <li><strong>Pax:</strong> ${b.pax_count}</li>
        <li><strong>Total:</strong> ${b.total_price} THB</li>
      </ul>
      
      <a href="https://tuo-sito-admin.com/admin-logistics" style="display: inline-block; background: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Console</a>
    </div>
  </div>
`;
