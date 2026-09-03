// Path: supabase/functions/_shared/agencyEmailI18n.ts
// #142: testi delle email agenzia nelle 4 lingue agenzia EN·TH·ES·ZH (085_02_Flow §Politica lingue):
// 1421_30 conferma all'agenzia, 1421_31 reminder 24h, 1421_32 invito al cliente.
// La lingua viene da profiles.preferred_language dell'agenzia (default 'en'); l'invito al
// cliente resta EN finche' l'agenzia non chiede altro (Consegna_142, decisione 3).
// I testi sono copiati dalla Consegna_142 del brain: mai ritradurre qui, correggere li' e ricopiare.
// Master dei template: brain 142_Email_Flow/1421_Email_Agencies.

export type Lang = 'en' | 'th' | 'es' | 'zh'
type Session = 'morning_class' | 'evening_class'

const LANGS: readonly Lang[] = ['en', 'th', 'es', 'zh']

export function pickLang(value: string | null | undefined): Lang {
  return LANGS.includes(value as Lang) ? (value as Lang) : 'en'
}

export interface EmailBooking {
  internal_id: string
  booking_ref: string | null
  reservation_id_agency: string | null
  session_id: string
  booking_date: string
  pax_count: number
  hotel_name: string | null
  pickup_time: string | null
  guest_name: string | null
}

const LOCALE: Record<Lang, string> = { en: 'en-GB', th: 'th-TH', es: 'es-ES', zh: 'zh-CN' }

export function fmtDate(ymd: string, lang: Lang): string {
  const d = new Date(`${ymd}T00:00:00`)
  return d.toLocaleDateString(LOCALE[lang], { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

// EN in 12h (8:15 am); le altre lingue in 24h (regola R6 della consegna)
export function fmtTime(hms: string, lang: Lang): string {
  const [h, m] = hms.split(':').map(Number)
  const mm = String(m).padStart(2, '0')
  if (lang !== 'en') return `${h}:${mm}`
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${mm} ${ampm}`
}

export function escapeHtml(s: string): string {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

interface Pack {
  classLabel: Record<Session, string>
  classShort: Record<Session, string>
  guestFallback: string
  labels: { bookingRef: string; yourRef: string; class: string; date: string; guests: string; pickup: string; meetingAtKitchen: string }
  pickup: {
    ready: Record<Session, string>
    window: Record<Session, string>
    kitchen: Record<Session, string>
    hotel: (hotel: string, ready: string, window: string) => string
    around: (time: string) => string
  }
  confirm: {
    subject: (cls: string, date: string, guest: string, n: number) => string
    greeting: (name: string) => string
    thanks: string
    forward: string
    confirmed: string
    choose: string
    cookbookPre: string
    cookbookPost: string
    terms: string
    changes: string
    signoff: string
  }
  reminder: {
    subject: (cls: string, date: string, guest: string) => string
    greeting: (name: string) => string
    intro: string
    ready: string
    headline: string
    shoes: string
    cannot: string
    signoff: string
  }
  guest: {
    subject: string
    greeting: (name: string) => string
    goodNews: (cls: string, date: string) => string
    intro: string
    bullets: [string, string, string]
    start: string
    marketTour: string
    questions: string
    signoff: string
  }
}

// Finestre pickup canoniche (015_Canonical_Facts): morning 08:15-09:00, evening 16:15-17:00
const PACKS: Record<Lang, Pack> = {
  en: {
    classLabel: { morning_class: 'Morning Cooking Class (includes the 1 hour market tour)', evening_class: 'Evening Cooking Class' },
    classShort: { morning_class: 'Morning Cooking Class', evening_class: 'Evening Cooking Class' },
    guestFallback: 'guest',
    labels: { bookingRef: 'Booking reference', yourRef: 'Your reference', class: 'Class', date: 'Date', guests: 'Guests', pickup: 'Pickup', meetingAtKitchen: 'meeting at our kitchen' },
    pickup: {
      ready: { morning_class: '8:15 am', evening_class: '4:15 pm' },
      window: { morning_class: 'between 8:15 am and 9:00 am', evening_class: 'between 4:15 pm and 5:00 pm' },
      kitchen: { morning_class: 'We look forward to welcoming you at our kitchen at 9:00 am.', evening_class: 'We look forward to welcoming you at our kitchen at 5:00 pm.' },
      hotel: (hotel, ready, window) => `Please be ready in the lobby of ${hotel} at ${ready}. Our driver will arrive ${window}.`,
      around: (time) => `around ${time}`,
    },
    confirm: {
      subject: (cls, date, guest, n) => `Booking confirmed - ${cls}, ${date} - ${guest}, ${n} guests`,
      greeting: (name) => `Dear ${name},`,
      thanks: 'Thank you for your booking. It is now in our calendar, and our kitchen is ready.',
      forward: 'Please forward this to your client:',
      confirmed: 'Your Thai cooking class with Thai Akha Kitchen is confirmed!',
      choose: 'Before class, you can pick the dishes you want to cook here:',
      cookbookPre: 'Our cookbook, with every recipe we teach and the stories behind them, is waiting for you at',
      cookbookPost: '(password: ThaiAkhaBook).',
      terms: 'Cancellation: free up to 48 hours before the class start (Thailand time). Within 48 hours, and for no-shows, the net rate stays due. Full terms:',
      changes: 'If anything changes, just reply to this email and we will take care of it.',
      signoff: 'With warm regards,',
    },
    reminder: {
      subject: (cls, date, guest) => `Tomorrow - ${cls}, ${date} - ${guest}`,
      greeting: (name) => `Dear ${name},`,
      intro: 'A quick reminder: your guests cook with us tomorrow.',
      ready: 'Please make sure your clients are ready:',
      headline: 'See you tomorrow at Thai Akha Kitchen!',
      shoes: 'Wear comfortable shoes, bring your appetite, and leave the rest to us.',
      cannot: 'If your clients cannot make it, reply to this email as soon as you can and we will find a solution together.',
      signoff: 'With warm regards,',
    },
    guest: {
      subject: 'Your Thai cooking class is booked - come tell us how you like to cook',
      greeting: (name) => `Dear ${name},`,
      goodNews: (cls, date) => `Great news: your ${cls} at Thai Akha Kitchen on ${date} is booked.`,
      intro: 'We are a small Akha family kitchen in Chiang Mai, and we like to know our guests before they walk in. Create your free account and you can:',
      bullets: [
        'pick the dishes you want to cook from our menu',
        'tell us what you do not eat, so we cook every dish to suit you',
        'keep your recipes and your Digital Passport after class',
      ],
      start: 'Start here:',
      marketTour: 'Your class begins with a 1 hour tour of the local fresh market, walking with your teacher among the herbs, spices and morning colors of Chiang Mai.',
      questions: 'If you have any questions before class, just reply to this email. A real person from our kitchen reads it.',
      signoff: 'See you soon,',
    },
  },
  es: {
    classLabel: { morning_class: 'Clase de cocina por la mañana (incluye 1 hora de visita al mercado)', evening_class: 'Clase de cocina por la tarde' },
    classShort: { morning_class: 'Clase de cocina por la mañana', evening_class: 'Clase de cocina por la tarde' },
    guestFallback: 'huésped',
    labels: { bookingRef: 'Referencia de la reserva', yourRef: 'Tu referencia', class: 'Clase', date: 'Fecha', guests: 'Personas', pickup: 'Recogida', meetingAtKitchen: 'encuentro en nuestra escuela' },
    pickup: {
      ready: { morning_class: '8:15', evening_class: '16:15' },
      window: { morning_class: 'entre las 8:15 y las 9:00', evening_class: 'entre las 16:15 y las 17:00' },
      kitchen: { morning_class: 'Te esperamos en nuestra escuela a las 9:00.', evening_class: 'Te esperamos en nuestra escuela a las 17:00.' },
      hotel: (hotel, ready, window) => `Espera preparado en el vestíbulo de ${hotel} a las ${ready}. Nuestro conductor llegará ${window}.`,
      around: (time) => `alrededor de las ${time}`,
    },
    confirm: {
      subject: (cls, date, guest, n) => `Reserva confirmada - ${cls}, ${date} - ${guest}, ${n} personas`,
      greeting: (name) => `Estimado ${name}:`,
      thanks: 'Gracias por tu reserva. Ya está en nuestro calendario, y nuestra cocina está lista.',
      forward: 'Por favor, reenvía esto a tu cliente:',
      confirmed: '¡Tu clase de cocina tailandesa con Thai Akha Kitchen está confirmada!',
      choose: 'Antes de la clase, puedes elegir aquí los platos que quieres cocinar:',
      cookbookPre: 'Nuestro recetario, con todas las recetas que enseñamos y las historias detrás de ellas, te espera en',
      cookbookPost: '(contraseña: ThaiAkhaBook).',
      terms: 'Cancelación: gratuita hasta 48 horas antes del inicio de la clase (hora de Tailandia). Dentro de las 48 horas, y en caso de no presentarse, la tarifa neta sigue siendo debida. Condiciones completas:',
      changes: 'Si algo cambia, responde a este email y nos ocupamos de todo.',
      signoff: 'Un cordial saludo,',
    },
    reminder: {
      subject: (cls, date, guest) => `Mañana - ${cls}, ${date} - ${guest}`,
      greeting: (name) => `Estimado ${name}:`,
      intro: 'Un breve recordatorio: tus clientes cocinan con nosotros mañana.',
      ready: 'Por favor, asegúrate de que estén preparados:',
      headline: '¡Nos vemos mañana en Thai Akha Kitchen!',
      shoes: 'Calzado cómodo, buen apetito, y del resto nos ocupamos nosotros.',
      cannot: 'Si tus clientes no pueden venir, responde a este email lo antes posible y encontraremos una solución juntos.',
      signoff: 'Un cordial saludo,',
    },
    guest: {
      subject: 'Tu clase de cocina tailandesa está reservada: cuéntanos cómo te gusta cocinar',
      greeting: (name) => `Estimado ${name}:`,
      goodNews: (cls, date) => `Buenas noticias: tu ${cls} en Thai Akha Kitchen el ${date} está reservada.`,
      intro: 'Somos una pequeña cocina familiar akha en Chiang Mai, y nos gusta conocer a nuestros huéspedes antes de que entren por la puerta. Crea tu cuenta gratuita y podrás:',
      bullets: [
        'elegir de nuestro menú los platos que quieres cocinar',
        'contarnos lo que no comes, para que cocinemos cada plato a tu medida',
        'conservar tus recetas y tu Pasaporte Digital después de la clase',
      ],
      start: 'Empieza aquí:',
      marketTour: 'Tu clase empieza con una visita de 1 hora al mercado local, caminando con tu profesor entre las hierbas, especias y colores de la mañana de Chiang Mai.',
      questions: 'Si tienes alguna pregunta antes de la clase, responde a este email. Lo lee una persona real de nuestra cocina.',
      signoff: 'Hasta pronto,',
    },
  },
  th: {
    classLabel: { morning_class: 'คลาสทำอาหารช่วงเช้า (รวมทัวร์ตลาดสด 1 ชั่วโมง)', evening_class: 'คลาสทำอาหารช่วงบ่าย' },
    classShort: { morning_class: 'คลาสทำอาหารช่วงเช้า', evening_class: 'คลาสทำอาหารช่วงบ่าย' },
    guestFallback: 'ลูกค้า',
    labels: { bookingRef: 'รหัสการจอง', yourRef: 'รหัสอ้างอิงของคุณ', class: 'คลาส', date: 'วันที่', guests: 'จำนวนท่าน', pickup: 'จุดรับ', meetingAtKitchen: 'พบกันที่ครัวของเรา' },
    pickup: {
      ready: { morning_class: '8:15', evening_class: '16:15' },
      window: { morning_class: 'ระหว่าง 8:15 ถึง 9:00', evening_class: 'ระหว่าง 16:15 ถึง 17:00' },
      kitchen: { morning_class: 'เราตั้งตารอต้อนรับคุณที่ครัวของเราเวลา 9:00', evening_class: 'เราตั้งตารอต้อนรับคุณที่ครัวของเราเวลา 17:00' },
      hotel: (hotel, ready, window) => `กรุณารอที่ล็อบบี้ของ ${hotel} เวลา ${ready} คนขับของเราจะมาถึง${window}`,
      around: (time) => `ประมาณ ${time}`,
    },
    confirm: {
      subject: (cls, date, guest, n) => `ยืนยันการจองแล้ว - ${cls}, ${date} - ${guest}, ${n} ท่าน`,
      greeting: (name) => `เรียน ${name}`,
      thanks: 'ขอบคุณสำหรับการจอง ตอนนี้อยู่ในปฏิทินของเราแล้ว และครัวของเราพร้อมต้อนรับ',
      forward: 'กรุณาส่งต่อข้อความนี้ให้ลูกค้าของคุณ:',
      confirmed: 'คลาสทำอาหารไทยกับ Thai Akha Kitchen ของคุณได้รับการยืนยันแล้ว!',
      choose: 'ก่อนถึงวันคลาส เลือกเมนูที่อยากทำได้ที่นี่:',
      cookbookPre: 'สมุดสูตรอาหารของเรา พร้อมทุกสูตรที่เราสอนและเรื่องราวเบื้องหลัง รอคุณอยู่ที่',
      cookbookPost: '(รหัสผ่าน: ThaiAkhaBook)',
      terms: 'การยกเลิก: ยกเลิกได้ฟรีจนถึง 48 ชั่วโมงก่อนเวลาเริ่มคลาส (เวลาประเทศไทย) หากยกเลิกภายใน 48 ชั่วโมงหรือไม่มาตามนัด ยังคงต้องชำระราคาสุทธิ เงื่อนไขฉบับเต็ม:',
      changes: 'หากมีการเปลี่ยนแปลง ตอบกลับอีเมลนี้ได้เลย เราจะดูแลให้',
      signoff: 'ด้วยความนับถือ',
    },
    reminder: {
      subject: (cls, date, guest) => `พรุ่งนี้ - ${cls}, ${date} - ${guest}`,
      greeting: (name) => `เรียน ${name}`,
      intro: 'ขอแจ้งเตือนสั้น ๆ: ลูกค้าของคุณจะมาทำอาหารกับเราพรุ่งนี้',
      ready: 'กรุณาช่วยให้ลูกค้าของคุณพร้อม:',
      headline: 'แล้วพบกันพรุ่งนี้ที่ Thai Akha Kitchen!',
      shoes: 'สวมรองเท้าสบาย ๆ พกความหิวมาด้วย ที่เหลือให้เราดูแลเอง',
      cannot: 'หากลูกค้าของคุณมาไม่ได้ ตอบกลับอีเมลนี้โดยเร็วที่สุด แล้วเราจะหาทางออกร่วมกัน',
      signoff: 'ด้วยความนับถือ',
    },
    guest: {
      subject: 'จองคลาสทำอาหารไทยของคุณแล้ว มาบอกเราหน่อยว่าคุณชอบทำอาหารแบบไหน',
      greeting: (name) => `เรียน ${name}`,
      goodNews: (cls, date) => `ข่าวดี: ${cls} ของคุณที่ Thai Akha Kitchen วันที่ ${date} จองเรียบร้อยแล้ว`,
      intro: 'เราคือครัวครอบครัวอาข่าเล็ก ๆ ในเชียงใหม่ และเราชอบทำความรู้จักแขกของเราก่อนก้าวเข้าประตู สร้างบัญชีฟรีของคุณแล้วคุณจะสามารถ:',
      bullets: [
        'เลือกเมนูที่อยากทำจากเมนูของเรา',
        'บอกเราว่าคุณไม่ทานอะไร เราจะได้ปรุงทุกจานให้เหมาะกับคุณ',
        'เก็บสูตรอาหารและ Digital Passport ของคุณไว้หลังคลาส',
      ],
      start: 'เริ่มที่นี่:',
      marketTour: 'คลาสของคุณเริ่มด้วยทัวร์ตลาดสด 1 ชั่วโมง เดินไปกับครูของคุณท่ามกลางสมุนไพร เครื่องเทศ และสีสันยามเช้าของเชียงใหม่',
      questions: 'หากมีคำถามก่อนคลาส ตอบกลับอีเมลนี้ได้เลย คนจริง ๆ จากครัวของเราเป็นคนอ่าน',
      signoff: 'แล้วพบกันเร็ว ๆ นี้',
    },
  },
  zh: {
    classLabel: { morning_class: '上午烹饪课（含 1 小时市场之旅）', evening_class: '下午烹饪课' },
    classShort: { morning_class: '上午烹饪课', evening_class: '下午烹饪课' },
    guestFallback: '客人',
    labels: { bookingRef: '预订编号', yourRef: '你的编号', class: '课程', date: '日期', guests: '人数', pickup: '接车点', meetingAtKitchen: '在我们厨房集合' },
    pickup: {
      ready: { morning_class: '8:15', evening_class: '16:15' },
      window: { morning_class: '在 8:15 至 9:00 之间', evening_class: '在 16:15 至 17:00 之间' },
      kitchen: { morning_class: '我们期待 9:00 在厨房迎接你。', evening_class: '我们期待 17:00 在厨房迎接你。' },
      hotel: (hotel, ready, window) => `请于 ${ready} 在 ${hotel} 大堂等候，司机将${window}到达。`,
      around: (time) => `在 ${time} 左右`,
    },
    confirm: {
      subject: (cls, date, guest, n) => `预订已确认 - ${cls}，${date} - ${guest}，${n} 位`,
      greeting: (name) => `尊敬的 ${name}：`,
      thanks: '感谢你的预订。它已排入我们的日程，厨房也准备好了。',
      forward: '请把以下内容转发给你的客人：',
      confirmed: '你在 Thai Akha Kitchen 的泰式烹饪课已确认！',
      choose: '开课前，你可以在这里挑选想做的菜：',
      cookbookPre: '我们的食谱书收录了课上教的每道菜和它们背后的故事，在',
      cookbookPost: '等你（密码：ThaiAkhaBook）。',
      terms: '取消：距开课 48 小时以上（泰国时间）可免费取消；不足 48 小时取消或未到场，仍需支付净价。完整条款：',
      changes: '如有任何变动，回复这封邮件即可，我们来处理。',
      signoff: '谨致问候',
    },
    reminder: {
      subject: (cls, date, guest) => `明天 - ${cls}，${date} - ${guest}`,
      greeting: (name) => `尊敬的 ${name}：`,
      intro: '简短提醒：你的客人明天与我们一起做菜。',
      ready: '请确保你的客人准备就绪：',
      headline: '明天 Thai Akha Kitchen 见！',
      shoes: '穿双舒服的鞋，带上好胃口，其余交给我们。',
      cannot: '如果你的客人无法前来，请尽快回复这封邮件，我们一起想办法。',
      signoff: '谨致问候',
    },
    guest: {
      subject: '你的泰式烹饪课已预订，来告诉我们你喜欢怎么做菜',
      greeting: (name) => `亲爱的 ${name}：`,
      goodNews: (cls, date) => `好消息：你 ${date} 在 Thai Akha Kitchen 的${cls}已经订好了。`,
      intro: '我们是清迈一间小小的阿卡家庭厨房，喜欢在客人进门之前就认识他们。创建免费账户，你就可以：',
      bullets: [
        '从菜单里挑选想做的菜',
        '告诉我们你不吃什么，我们把每道菜做成适合你的样子',
        '课后保留你的食谱和数字护照（Digital Passport）',
      ],
      start: '从这里开始：',
      marketTour: '你的课程从 1 小时的本地市场之旅开始，跟着老师走过清迈清晨的香草、香料与色彩。',
      questions: '开课前有任何问题，回复这封邮件即可。读信的是我们厨房里真实的人。',
      signoff: '很快见',
    },
  },
}

function session(b: EmailBooking): Session {
  return b.session_id === 'evening_class' ? 'evening_class' : 'morning_class'
}

function classShort(b: EmailBooking, lang: Lang): string {
  return PACKS[lang].classShort[session(b)]
}

export function pickupLine(b: EmailBooking, lang: Lang): string {
  const p = PACKS[lang].pickup
  const s = session(b)
  if (b.hotel_name) {
    const ready = b.pickup_time ? fmtTime(b.pickup_time, lang) : p.ready[s]
    const window = b.pickup_time ? p.around(fmtTime(b.pickup_time, lang)) : p.window[s]
    return p.hotel(escapeHtml(b.hotel_name), ready, window)
  }
  return p.kitchen[s]
}

function detailsTable(b: EmailBooking, lang: Lang): string {
  const t = PACKS[lang]
  const rows: Array<[string, string]> = [
    [t.labels.bookingRef, b.booking_ref ?? b.internal_id],
    [t.labels.yourRef, b.reservation_id_agency ?? '-'],
    [t.labels.class, t.classLabel[session(b)]],
    [t.labels.date, fmtDate(b.booking_date, lang)],
    [t.labels.guests, String(b.pax_count ?? 1)],
    [t.labels.pickup, b.hotel_name ? escapeHtml(b.hotel_name) : t.labels.meetingAtKitchen],
  ]
  const inner = rows
    .map(([k, v]) => `<tr><td style="padding:4px 0;width:150px;color:#5E6464;">${k}</td><td style="padding:4px 0;"><strong>${v}</strong></td></tr>`)
    .join('\n')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${inner}</table>`
}

function wrap(inner: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;background:#f7f5f2;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="background:#E31F33;padding:16px 24px;color:#ffffff;font-size:18px;font-weight:bold;">Thai Akha Kitchen</td></tr>
      <tr><td style="padding:24px;font-size:14px;color:#222827;line-height:1.6;">${inner}</td></tr>
    </table>
  </td></tr>
</table>`
}

const LINK = (href: string, label: string) => `<a href="${href}" style="color:#E31F33;">${label}</a>`

export interface EmailContent { subject: string; html: string }

// 1421_30 - conferma all'agenzia
export function buildAgencyConfirmation(b: EmailBooking, agencyName: string, lang: Lang): EmailContent {
  const t = PACKS[lang]
  const c = t.confirm
  const subject = c.subject(classShort(b, lang), fmtDate(b.booking_date, lang), b.guest_name ?? b.booking_ref ?? '', b.pax_count ?? 1)
  const html = wrap(`
<p>${c.greeting(escapeHtml(agencyName))}</p>
<p>${c.thanks}</p>
${detailsTable(b, lang)}
<p style="margin-top:12px;font-size:13px;color:#5E6464;">${c.terms} ${LINK('https://admin.thaiakha.com/agency-terms', 'admin.thaiakha.com/agency-terms')}</p>
<p style="margin-top:16px;">${c.forward}</p>
<div style="padding:16px;background:#f7f5f2;border-radius:6px;">
  <p style="margin:0 0 8px;"><strong>${c.confirmed}</strong></p>
  <p style="margin:0 0 8px;">${pickupLine(b, lang)}</p>
  <p style="margin:0 0 8px;">${c.choose}<br />
  ${LINK('https://www.thaiakhakitchen.com/choose-your-dishes/', 'thaiakhakitchen.com/choose-your-dishes')}</p>
  <p style="margin:0;">${c.cookbookPre} ${LINK('https://www.thaiakhakitchen.com/cookbook/', 'thaiakhakitchen.com/cookbook')} ${c.cookbookPost}</p>
</div>
<p>${c.changes}</p>
<p>${c.signoff}<br />Thai Akha Kitchen</p>`)
  return { subject, html }
}

// 1421_31 - reminder 24h all'agenzia
export function buildAgencyReminder(b: EmailBooking, agencyName: string, lang: Lang): EmailContent {
  const t = PACKS[lang]
  const r = t.reminder
  const subject = r.subject(classShort(b, lang), fmtDate(b.booking_date, lang), b.guest_name ?? b.booking_ref ?? '')
  const html = wrap(`
<p>${r.greeting(escapeHtml(agencyName))}</p>
<p>${r.intro}</p>
${detailsTable(b, lang)}
<p style="margin-top:16px;">${r.ready}</p>
<div style="padding:16px;background:#f7f5f2;border-radius:6px;">
  <p style="margin:0 0 8px;"><strong>${r.headline}</strong></p>
  <p style="margin:0 0 8px;">${pickupLine(b, lang)}</p>
  <p style="margin:0;">${r.shoes}</p>
</div>
<p>${r.cannot}</p>
<p>${r.signoff}<br />Thai Akha Kitchen</p>`)
  return { subject, html }
}

// 1421_32 - invito al cliente (solo se guest_email presente)
export function buildGuestInvite(b: EmailBooking, lang: Lang): EmailContent {
  const t = PACKS[lang]
  const g = t.guest
  const marketTour = session(b) === 'morning_class' ? `<p>${g.marketTour}</p>` : ''
  const html = wrap(`
<p>${g.greeting(escapeHtml(b.guest_name ?? t.guestFallback))}</p>
<p>${g.goodNews(classShort(b, lang), fmtDate(b.booking_date, lang))}</p>
<p>${g.intro}</p>
<ul style="margin:0 0 12px;padding-left:20px;">
  <li>${g.bullets[0]}</li>
  <li>${g.bullets[1]}</li>
  <li>${g.bullets[2]}</li>
</ul>
<p>${g.start} ${LINK('https://www.thaiakha.com/', 'thaiakha.com')}</p>
${marketTour}
<p>${g.questions}</p>
<p>${g.signoff}<br />Thai Akha Kitchen</p>`)
  return { subject: g.subject, html }
}
