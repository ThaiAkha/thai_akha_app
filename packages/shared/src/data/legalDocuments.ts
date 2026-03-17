/**
 * 🍵 THAI AKHA KITCHEN - LEGAL DOCUMENTS
 * Version: 2.0
 * Terms of Service and Privacy Policy for B2B Portal
 * Last Updated: 2026-03-14
 */

import type { LegalDocument, TermsAcceptance } from '../types/legal.types';

// ============================================================================
// TERMS OF SERVICE
// ============================================================================

export const TERMS_OF_SERVICE: LegalDocument = {
  id: 'terms_of_service',
  version: '2.0',
  title: 'Terms of Service - B2B Partner Portal',
  effectiveDate: '2026-03-14',
  lastUpdated: '2026-03-14',
  supersedes: '1.0',
  sections: [
    {
      title: 'Definitions',
      content: [
        '"Agency Partner" refers to the registered business entity using this portal.',
        '"Platform" means the Thai Akha Kitchen B2B Partner Portal, including all associated services and APIs.',
        '"Customer" means the end-user booking cooking classes through your agency.',
        '"Booking" means a reservation for a cooking class made through the Platform.',
        '"Settlement Period" means the monthly payment cycle for commissions, typically within 30 days of class completion.',
        '"Confidential Information" means all non-public information disclosed by either party.',
      ],
    },
    {
      title: '1. Introduction & Acceptance',
      content: 'Welcome to the Thai Akha Kitchen B2B Partner Portal. By registering as an agency partner, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (the "Agreement"). If you do not agree to these terms, do not proceed with registration or use of the Platform. This Agreement constitutes a legally binding contract between your agency and Thai Akha Kitchen Co. Ltd.',
    },
    {
      title: '2. User Accounts & Registration',
      content: [
        '2.1 Agency partners must provide accurate, complete, and current information during registration, including legal business name, tax ID/VAT number, and authorized representative details.',
        '2.2 You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
        '2.3 You agree to notify us immediately within 24 hours of any unauthorized access or use of your account.',
        '2.4 One account per legal entity is permitted. Multiple accounts for the same entity are prohibited and may result in termination.',
        '2.5 Accounts are non-transferable without our prior written consent.',
        '2.6 We reserve the right to refuse registration or terminate accounts at our discretion, with or without cause.',
      ],
    },
    {
      title: '3. Agency Partner Responsibilities',
      content: [
        '3.1 As an agency partner, you agree to promote Thai Akha Kitchen cooking classes professionally, ethically, and in accordance with our brand guidelines.',
        '3.2 You must comply with all applicable local, national, and international laws and regulations, including but not limited to consumer protection, data privacy, and anti-corruption laws.',
        '3.3 You are fully responsible for all customer interactions, communications, inquiries, and disputes arising from bookings made through your agency.',
        '3.4 You must maintain professional standards and respond to customer inquiries within 24 hours.',
        '3.5 You agree not to engage in any activities that damage the reputation, brand, or goodwill of Thai Akha Kitchen.',
        '3.6 You may not make false or misleading statements about our classes, pricing, or availability.',
        '3.7 You are responsible for ensuring your customers comply with class requirements, including dietary restrictions and arrival times.',
      ],
    },
    {
      title: '4. Booking & Reservation Terms',
      content: [
        '4.1 All bookings are subject to availability and final confirmation by Thai Akha Kitchen.',
        '4.2 Pricing displayed on the Platform is in Thai Baht (THB) and includes applicable taxes unless otherwise specified.',
        '4.3 Bookings are confirmed once payment is received and processed by your agency, and you have submitted the booking through the Platform.',
        '4.4 Your agency is responsible for clearly communicating all booking details, requirements, and policies to your customers.',
        '4.5 Maximum group sizes per class are specified on the Platform. For groups exceeding standard sizes, please contact us at least 7 days in advance.',
        '4.6 We reserve the right to cancel or reschedule classes due to insufficient enrollment, inclement weather, or operational requirements. In such cases, affected customers will receive full refunds or rebooking options.',
      ],
    },
    {
      title: '5. Payment & Pricing',
      content: [
        '5.1 Agencies are responsible for collecting all payments from their customers.',
        '5.2 Payment to Thai Akha Kitchen must be made according to the agreed settlement schedule, typically within 30 calendar days of class completion (the "Settlement Period").',
        '5.3 Commission structures are provided in your partner agreement and cannot be unilaterally modified by either party without written consent.',
        '5.4 Thai Akha Kitchen reserves the right to adjust pricing with 30 days written notice.',
        '5.5 Invoices will be issued electronically at the end of each Settlement Period and are payable within 14 days of receipt.',
        '5.6 Late payments may incur interest at 1.5% per month or the maximum rate permitted by law.',
        '5.7 All bank transfer fees are the responsibility of the paying party.',
      ],
    },
    {
      title: '6. Cancellation & Refund Policy',
      content: [
        '6.1 Customers may cancel bookings up to 48 hours before the class start time for a full refund, less any payment processing fees.',
        '6.2 Cancellations made less than 48 hours before the class are non-refundable.',
        '6.3 "No-shows" (customers who do not arrive within 15 minutes of class start time) are not eligible for refunds or rescheduling.',
        '6.4 If Thai Akha Kitchen cancels a class due to insufficient enrollment, weather, or other operational reasons, affected customers will receive:',
        '   - A full refund processed within 5-7 business days, or',
        '   - The option to reschedule to another available date.',
        '6.5 Agency partners are responsible for processing refunds to their customers in accordance with this policy.',
        '6.6 Refund requests due to medical emergencies or extraordinary circumstances may be considered on a case-by-case basis.',
      ],
    },
    {
      title: '7. Intellectual Property Rights',
      content: [
        '7.1 All content on the Thai Akha Kitchen Platform, including but not limited to images, text, logos, designs, recipes, videos, and class materials, is the exclusive intellectual property of Thai Akha Kitchen or its licensors.',
        '7.2 You may not reproduce, distribute, modify, create derivative works of, publicly display, or commercially exploit any content without explicit written permission.',
        '7.3 Class materials and recipes provided during courses are for customer educational use only and may not be reproduced or used for commercial purposes.',
        '7.4 The name "Thai Akha Kitchen" and related logos are registered trademarks. Use requires prior written approval.',
        '7.5 You grant us a non-exclusive, royalty-free license to use your agency name and logo in marketing materials, subject to your approval.',
      ],
    },
    {
      title: '8. Confidentiality',
      content: [
        '8.1 Both parties agree to maintain the confidentiality of all non-public information disclosed during the course of this Agreement.',
        '8.2 Confidential Information includes, but is not limited to: commission structures, business strategies, customer data, and unpublished class materials.',
        '8.3 This obligation survives termination of this Agreement for a period of three (3) years.',
        '8.4 Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was rightfully in the receiving party\'s possession before disclosure; or (c) is independently developed by the receiving party.',
      ],
    },
    {
      title: '9. Limitation of Liability',
      content: [
        '9.1 Thai Akha Kitchen is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied.',
        '9.2 We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.',
        '9.3 To the maximum extent permitted by law, Thai Akha Kitchen shall not be liable for any indirect, incidental, consequential, special, or punitive damages, including but not limited to loss of profits, data, or goodwill.',
        '9.4 Our total cumulative liability arising from or related to this Agreement shall not exceed the total commissions paid to your agency in the 12 months preceding the claim.',
        '9.5 Some jurisdictions do not allow limitations on implied warranties or liability for certain damages, so these limitations may not apply to you.',
      ],
    },
    {
      title: '10. Indemnification',
      content: 'You agree to indemnify, defend, and hold harmless Thai Akha Kitchen, its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys\' fees) arising from: (a) your use of the Platform; (b) your violation of these Terms; (c) your breach of any applicable law or regulation; or (d) your customers\' experience with your agency.',
    },
    {
      title: '11. Dispute Resolution',
      content: [
        '11.1 Any disputes arising from or relating to these Terms of Service shall first be addressed through good-faith negotiation between the parties.',
        '11.2 If negotiation fails to resolve the dispute within 30 days, disputes shall be resolved through binding arbitration administered by the Thailand Arbitration Center (THAC) in accordance with its rules.',
        '11.3 Arbitration proceedings shall take place in Chiang Mai, Thailand, and be conducted in English.',
        '11.4 Each party bears its own costs of arbitration, including attorneys\' fees, unless the arbitrator determines that a party acted in bad faith or without substantial justification.',
        '11.5 The arbitration award shall be final and binding, and judgment may be entered in any court having jurisdiction.',
        '11.6 These terms do not prevent either party from seeking injunctive relief in a court of competent jurisdiction to protect its intellectual property or confidential information.',
        '11.7 This Agreement shall be governed by and construed in accordance with the laws of Thailand, without regard to its conflict of laws principles.',
      ],
    },
    {
      title: '12. Term & Termination',
      content: [
        '12.1 This Agreement commences upon your acceptance and continues until terminated by either party.',
        '12.2 Either party may terminate this Agreement with 30 days written notice for any reason or no reason.',
        '12.3 Thai Akha Kitchen may terminate immediately if you: (a) breach any material term of this Agreement; (b) violate applicable laws; (c) engage in conduct damaging to our reputation; or (d) become insolvent or bankrupt.',
        '12.4 Upon termination: (a) all outstanding payments become due immediately; (b) your access to the Platform will cease; (c) you must return or destroy all confidential information; and (d) surviving provisions (Intellectual Property, Confidentiality, Limitation of Liability, Dispute Resolution) remain in effect.',
      ],
    },
    {
      title: '13. Changes to Terms',
      content: 'Thai Akha Kitchen reserves the right to modify these Terms of Service at any time. Changes become effective upon posting to the Platform, with a 14-day notice period for material changes. Your continued use of the Platform after the effective date constitutes acceptance of the modified terms. We will notify you of material changes via email and platform notification. You may terminate this Agreement without penalty if you do not accept material changes.',
    },
    {
      title: '14. Contact Information',
      content: [
        'For questions regarding these Terms of Service:',
        '',
        '📧 Email: legal@thaiakha.com',
        '📞 Phone: +66 61 325 4611 (8:00-22:00 Thailand Time)',
        '📍 Address: 14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Chiang Mai 50100, Thailand',
        '🕒 Response Time: Within 48 business hours',
        '',
        'For legal notices and service of process: legal@thaiakha.com (Subject: LEGAL NOTICE)',
      ],
    },
  ],
};

// ============================================================================
// PRIVACY POLICY
// ============================================================================

export const PRIVACY_POLICY: LegalDocument = {
  id: 'privacy_policy',
  version: '2.0',
  title: 'Privacy Policy - B2B Partner Portal',
  effectiveDate: '2026-03-14',
  lastUpdated: '2026-03-14',
  supersedes: '1.0',
  sections: [
    {
      title: '1. Introduction',
      content: 'Thai Akha Kitchen Co. Ltd. ("we," "us," or "our") is committed to protecting your privacy and handling your personal data with transparency and care. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our B2B Partner Portal and associated services (collectively, the "Platform"). By accessing or using the Platform, you consent to the practices described in this policy.',
    },
    {
      title: '2. Information We Collect',
      subsections: [
        {
          title: '2.1 Account Information',
          content: 'When you register as an agency partner, we collect: legal business name, trading name, tax ID/VAT number, business registration number, physical address, authorized representative name and title, email address, phone number, and bank account details for settlements (bank name, account number, SWIFT/BIC code).',
        },
        {
          title: '2.2 Booking & Transaction Data',
          content: 'We collect information about bookings you make, including: customer names, contact information (email, phone), class preferences, dietary restrictions, special requests, booking dates and times, payment amounts, transaction IDs, and booking history. This data is necessary to process bookings, manage settlements, and maintain accurate records.',
        },
        {
          title: '2.3 Usage Analytics',
          content: 'We automatically collect technical information about how you use the Platform: IP address, browser type and version, device type and model, operating system, pages visited, time spent on pages, click patterns, referral sources, and navigation paths. This helps us optimize performance, fix errors, and improve user experience.',
        },
        {
          title: '2.4 Communication Data',
          content: 'When you contact us via email, phone, chat, or through the Platform, we retain copies of those communications, including recordings of customer service calls for training and quality assurance purposes. This data is retained for dispute resolution and service improvement.',
        },
        {
          title: '2.5 Cookies & Tracking Technologies',
          content: 'We use cookies, web beacons, and similar tracking technologies to enhance your experience, remember preferences, analyze usage, and deliver relevant content. You can manage cookie preferences through your browser settings.',
        },
      ],
    },
    {
      title: '3. How We Use Your Information',
      content: [
        '3.1 Process and manage your bookings and payments',
        '3.2 Generate invoices, process settlements, and manage financial records',
        '3.3 Verify your identity and business credentials',
        '3.4 Provide customer support and respond to your inquiries',
        '3.5 Prevent fraud, detect unauthorized transactions, and enhance security',
        '3.6 Improve Platform functionality, user experience, and develop new features',
        '3.7 Send administrative communications (booking confirmations, policy updates, security alerts)',
        '3.8 Send marketing and promotional communications (with your consent, which you may withdraw at any time)',
        '3.9 Comply with legal obligations, including tax and accounting requirements',
        '3.10 Analyze usage patterns and trends to optimize our services',
        '3.11 Protect our rights, property, or safety, and that of our users and the public',
      ],
    },
    {
      title: '4. Legal Basis for Processing (GDPR)',
      content: [
        'If you are located in the European Economic Area (EEA) or United Kingdom, our legal bases for processing your personal data are:',
        '• Contract performance: Processing necessary to perform our agreement with you (Art. 6(1)(b))',
        '• Legal obligation: Processing necessary to comply with tax, accounting, and other legal requirements (Art. 6(1)(c))',
        '• Legitimate interests: Processing for fraud prevention, network security, and business improvement (Art. 6(1)(f))',
        '• Consent: Marketing communications and optional data collection (Art. 6(1)(a))',
      ],
    },
    {
      title: '5. Data Sharing & Third Parties',
      content: [
        '5.1 We do not sell, rent, or trade your personal data to third parties for marketing purposes.',
        '5.2 We share data with payment processors and financial institutions necessary to process settlements and payments.',
        '5.3 We may share aggregated, anonymized data for analytics, reporting, and business intelligence purposes.',
        '5.4 If required by law, we may disclose information to government authorities, law enforcement, or regulatory bodies.',
        '5.5 In case of acquisition, merger, or sale of assets, your data may be transferred to the acquiring entity, subject to this Privacy Policy.',
        '5.6 Service providers (hosting, email delivery, analytics, customer support) have access to data only as necessary to perform their functions and are contractually bound to maintain confidentiality and comply with data protection laws.',
        '5.7 We may share information with your consent or as otherwise disclosed at the time of collection.',
      ],
    },
    {
      title: '6. International Data Transfers',
      content: [
        'Your data may be processed and stored in Thailand and potentially other countries where we or our service providers operate. These countries may have data protection laws different from your country of residence.',
        'For transfers from the EEA to countries without adequate protection, we implement Standard Contractual Clauses (SCCs) approved by the European Commission to ensure appropriate safeguards.',
        'By using our Platform, you consent to the transfer of your data to countries outside your country of residence, including Thailand.',
        'For transfers to the United States, we rely on the EU-US Data Privacy Framework where applicable.',
      ],
    },
    {
      title: '7. Data Security & Storage',
      content: [
        '7.1 We implement industry-standard security measures including:',
        '   - Encryption of data in transit (TLS 1.3) and at rest (AES-256)',
        '   - Firewalls and intrusion detection systems',
        '   - Regular security audits and penetration testing',
        '   - Access controls and multi-factor authentication for staff',
        '   - Employee training on data protection',
        '7.2 All data is stored on secure servers in ISO 27001 certified data centers with regular backups.',
        '7.3 Staff access to personal data is limited to personnel who need it to perform their job functions and is logged and monitored.',
        '7.4 While we strive to protect your data, no method of transmission or storage is 100% secure. You acknowledge the inherent security risks of internet communications.',
        '7.5 Payment information is processed directly through PCI-DSS Level 1 compliant payment gateways; we do not store full credit card numbers.',
      ],
    },
    {
      title: '8. Data Retention',
      content: [
        'We retain your personal data for as long as your account is active and for the following periods after termination:',
        '• Account information: 5 years (to comply with tax and accounting obligations)',
        '• Transaction records: 7 years (Thai tax law requirement)',
        '• Communications: 3 years (for dispute resolution)',
        '• Usage logs: 12 months (for security analysis)',
        '• Marketing preferences: Until consent withdrawal',
        'After these periods, data is securely deleted or anonymized for analytical purposes.',
      ],
    },
    {
      title: '9. Your Privacy Rights',
      subsections: [
        {
          title: '9.1 Access & Correction',
          content: 'You have the right to access, review, and correct inaccurate personal data. Log into your account dashboard or contact us to exercise this right.',
        },
        {
          title: '9.2 Data Deletion ("Right to be Forgotten")',
          content: 'You may request deletion of your account and associated data, subject to legal retention obligations. Some data may be retained for tax, accounting, and fraud prevention purposes. We will respond within 30 days.',
        },
        {
          title: '9.3 Data Portability',
          content: 'You can request a copy of your personal data in a structured, machine-readable format (JSON). We will provide this within 30 days of request, free of charge.',
        },
        {
          title: '9.4 Withdrawal of Consent',
          content: 'For any processing based on your consent (e.g., marketing emails), you may withdraw consent at any time by clicking "unsubscribe" in emails or contacting us. This does not affect the lawfulness of processing prior to withdrawal.',
        },
        {
          title: '9.5 Restriction & Objection',
          content: 'You have the right to restrict or object to processing of your data where our processing is based on legitimate interests. We will comply unless we have compelling legitimate grounds.',
        },
        {
          title: '9.6 Lodge a Complaint',
          content: 'You have the right to lodge a complaint with a data protection supervisory authority, particularly in your habitual residence, place of work, or place of alleged infringement.',
        },
      ],
    },
    {
      title: '10. Cookies & Tracking Technologies',
      content: [
        '10.1 Essential Cookies: Required for Platform functionality, including authentication, security, and session management. Cannot be disabled.',
        '10.2 Analytics Cookies: Help us understand how visitors interact with the Platform, which pages are most popular, and identify issues. We use Google Analytics and Supabase Analytics. You can opt out via browser settings.',
        '10.3 Functional Cookies: Remember your preferences and settings to enhance your experience.',
        '10.4 Marketing Cookies: May be used to deliver relevant advertisements and measure campaign effectiveness. You can manage these in your account preferences.',
        '10.5 Third-Party Cookies: Some embedded content (e.g., videos, maps) may place cookies from their own domains. We do not control these.',
        '10.6 Cookie Consent: Upon first visit, you may accept or customize cookie preferences. You can change preferences at any time through your account settings.',
      ],
    },
    {
      title: '11. Children\'s Privacy',
      content: 'Our Platform is not intended for children under 18 years of age, and we do not knowingly collect personal data from minors. If you are under 18, do not use or provide any information on this Platform. If we become aware that we have collected data from a child under 18 without verification of parental consent, we will delete it immediately. Parents or guardians who believe their child has provided information should contact us at privacy@thaiakha.com.',
    },
    {
      title: '12. GDPR Compliance (EEA & UK Partners)',
      content: [
        'If you are located in the European Economic Area (EEA) or United Kingdom, you have additional rights:',
        '• Our Data Protection Officer (DPO) can be reached at dpo@thaiakha.com.',
        '• A Data Processing Agreement (DPA) is available upon request for EEA partners.',
        '• Our EU representative for GDPR purposes: [to be appointed]',
        '• We conduct Data Protection Impact Assessments (DPIAs) for high-risk processing.',
        '• You may request a copy of our Binding Corporate Rules or Standard Contractual Clauses.',
      ],
    },
    {
      title: '13. California Privacy Rights (CCPA/CPRA)',
      content: [
        'If you are a California resident, the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA) provide additional rights:',
        '• Right to know what personal information we collect, use, disclose, and sell.',
        '• Right to delete personal information (subject to exceptions).',
        '• Right to opt out of the sale or sharing of personal information (we do not sell data).',
        '• Right to correct inaccurate personal information.',
        '• Right to limit use of sensitive personal information.',
        '• Right to non-discrimination for exercising your privacy rights.',
        'To exercise these rights, please contact privacy@thaiakha.com with "California Privacy Request" in the subject line.',
      ],
    },
    {
      title: '14. Data Breach Notification',
      content: 'In the event of a data breach that poses a risk to your rights and freedoms, we will notify affected individuals and relevant supervisory authorities within 72 hours of becoming aware of the breach, as required by applicable law. Notifications will include: nature of the breach, categories of data affected, likely consequences, and measures taken.',
    },
    {
      title: '15. Policy Updates',
      content: 'We may update this Privacy Policy to reflect changes in our practices, technologies, or applicable laws. We will notify you of material changes via email (to the address associated with your account) and through a prominent notice on the Platform at least 30 days before they become effective. Your continued use of the Platform after the effective date constitutes acceptance of the updated policy. Previous versions are available upon request.',
    },
    {
      title: '16. Contact Information',
      content: [
        'For privacy concerns, data requests, or to exercise your privacy rights:',
        '',
        '📧 Email: privacy@thaiakha.com',
        '📧 Data Protection Officer (DPO): dpo@thaiakha.com',
        '📞 Phone: +66 61 325 4611 (8:00-22:00 Thailand Time)',
        '📍 Address: Thai Akha Kitchen Co. Ltd., 14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Chiang Mai 50100, Thailand',
        '🕒 Response Time: We will respond to all legitimate requests within 30 days.',
        '',
        'For urgent security issues: security@thaiakha.com',
      ],
    },
  ],
};

// ============================================================================
// TERMS OF SERVICE - THAI
// ============================================================================

export const TERMS_OF_SERVICE_TH: LegalDocument = {
  id: 'terms_of_service_th',
  version: '2.0',
  title: 'ข้อกำหนดในการให้บริการ - พอร์ทัลพันธมิตรธุรกิจ B2B',
  effectiveDate: '2026-03-14',
  lastUpdated: '2026-03-14',
  supersedes: '1.0',
  sections: [
    {
      title: 'คำจำกัดความ',
      content: [
        '"พันธมิตรเอเจนซี่" หมายถึง นิติบุคคลที่จดทะเบียนซึ่งใช้พอร์ทัลนี้',
        '"แพลตฟอร์ม" หมายถึง พอร์ทัลพันธมิตรธุรกิจ B2B ของไทยอาข่าคิทเช่น รวมถึงบริการและ API ที่เกี่ยวข้องทั้งหมด',
        '"ลูกค้า" หมายถึง ผู้ใช้ปลายทางที่ทำการจองคลาสทำอาหารผ่านเอเจนซี่ของท่าน',
        '"การจอง" หมายถึง การสำรองที่นั่งคลาสทำอาหารผ่านแพลตฟอร์ม',
        '"ช่วงเวลาการชำระเงิน" หมายถึง รอบการชำระค่าคอมมิชชั่นรายเดือน โดยปกติภายใน 30 วันหลังจากคลาสสิ้นสุด',
        '"ข้อมูลที่เป็นความลับ" หมายถึง ข้อมูลที่ไม่เป็นสาธารณะซึ่งเปิดเผยโดยฝ่ายใดฝ่ายหนึ่ง',
      ],
    },
    {
      title: '1. บทนำและการยอมรับข้อกำหนด',
      content: 'ยินดีต้อนรับสู่พอร์ทัลพันธมิตรธุรกิจ B2B ของไทยอาข่าคิทเช่น การลงทะเบียนเป็นพันธมิตรเอเจนซี่ถือว่าท่านได้อ่าน ทำความเข้าใจ และตกลงที่จะปฏิบัติตามข้อกำหนดในการให้บริการฉบับนี้ ("ข้อตกลง") หากท่านไม่ตกลงตามข้อกำหนดเหล่านี้ กรุณาหยุดการลงทะเบียนหรือการใช้งานแพลตฟอร์ม ข้อตกลงนี้ถือเป็นสัญญาผูกพันทางกฎหมายระหว่างเอเจนซี่ของท่านและบริษัท ไทยอาข่าคิทเช่น จำกัด',
    },
    {
      title: '2. บัญชีผู้ใช้และการลงทะเบียน',
      content: [
        '2.1 พันธมิตรเอเจนซี่ต้องให้ข้อมูลที่ถูกต้อง ครบถ้วน และเป็นปัจจุบัน ในระหว่างการลงทะเบียน รวมถึงชื่อธุรกิจตามกฎหมาย เลขประจำตัวผู้เสียภาษี และรายละเอียดผู้แทนที่ได้รับมอบอำนาจ',
        '2.2 ท่านมีความรับผิดชอบแต่เพียงผู้เดียวในการรักษาความลับของข้อมูลประจำตัวบัญชี และกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของท่าน',
        '2.3 ท่านตกลงที่จะแจ้งให้เราทราบทันทีภายใน 24 ชั่วโมงหากมีการเข้าถึงหรือการใช้งานบัญชีของท่านโดยไม่ได้รับอนุญาต',
        '2.4 อนุญาตให้มีบัญชีเดียวต่อนิติบุคคล การมีหลายบัญชีสำหรับนิติบุคคลเดียวกันเป็นสิ่งต้องห้ามและอาจส่งผลให้ถูกยุติการใช้งาน',
        '2.5 บัญชีไม่สามารถโอนย้ายได้โดยไม่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากเราล่วงหน้า',
        '2.6 เราขอสงวนสิทธิ์ในการปฏิเสธการลงทะเบียนหรือยุติบัญชีตามดุลพินิจของเรา',
      ],
    },
    {
      title: '3. ความรับผิดชอบของพันธมิตรเอเจนซี่',
      content: [
        '3.1 ในฐานะพันธมิตรเอเจนซี่ ท่านตกลงที่จะส่งเสริมคลาสทำอาหารของไทยอาข่าคิทเช่นอย่างมืออาชีพ มีจริยธรรม และสอดคล้องกับแนวทางแบรนด์ของเรา',
        '3.2 ท่านต้องปฏิบัติตามกฎหมายและข้อบังคับที่เกี่ยวข้องทั้งหมด ทั้งในระดับท้องถิ่น ระดับชาติ และระดับนานาชาติ',
        '3.3 ท่านมีความรับผิดชอบทั้งหมดสำหรับการปฏิสัมพันธ์กับลูกค้า การสื่อสาร การสอบถาม และข้อพิพาทที่เกิดจากการจองผ่านเอเจนซี่ของท่าน',
        '3.4 ท่านต้องรักษามาตรฐานวิชาชีพและตอบกลับการสอบถามของลูกค้าภายใน 24 ชั่วโมง',
        '3.5 ท่านตกลงที่จะไม่ดำเนินกิจกรรมใดๆ ที่ทำลายชื่อเสียง แบรนด์ หรือความนิยมของไทยอาข่าคิทเช่น',
        '3.6 ท่านต้องไม่ให้ข้อมูลเท็จหรือทำให้เข้าใจผิดเกี่ยวกับคลาส ราคา หรือความพร้อมของเรา',
        '3.7 ท่านมีหน้าที่รับผิดชอบในการตรวจสอบให้ลูกค้าปฏิบัติตามข้อกำหนดของคลาส รวมถึงข้อจำกัดด้านอาหารและเวลาเดินทางมาถึง',
      ],
    },
    {
      title: '4. ข้อกำหนดการจองและการสำรองที่นั่ง',
      content: [
        '4.1 การจองทั้งหมดขึ้นอยู่กับความพร้อมและการยืนยันขั้นสุดท้ายจากไทยอาข่าคิทเช่น',
        '4.2 ราคาที่แสดงบนแพลตฟอร์มเป็นสกุลเงินบาทไทย (THB) และรวมภาษีที่เกี่ยวข้องเว้นแต่จะระบุไว้เป็นอย่างอื่น',
        '4.3 การจองได้รับการยืนยันเมื่อมีการรับและประมวลผลการชำระเงินโดยเอเจนซี่ของท่าน และท่านได้ส่งการจองผ่านแพลตฟอร์ม',
        '4.4 เอเจนซี่ของท่านมีหน้าที่ในการสื่อสารรายละเอียดการจอง ข้อกำหนด และนโยบายทั้งหมดให้ลูกค้าของท่านทราบอย่างชัดเจน',
        '4.5 ขนาดกลุ่มสูงสุดต่อคลาสระบุไว้บนแพลตฟอร์ม สำหรับกลุ่มที่เกินขนาดมาตรฐาน กรุณาติดต่อเราล่วงหน้าอย่างน้อย 7 วัน',
        '4.6 เราขอสงวนสิทธิ์ในการยกเลิกหรือเปลี่ยนเวลาคลาสเนื่องจากจำนวนผู้ลงทะเบียนไม่เพียงพอ สภาพอากาศ หรือข้อกำหนดในการดำเนินงาน ในกรณีดังกล่าว ลูกค้าที่ได้รับผลกระทบจะได้รับการคืนเงินเต็มจำนวนหรือตัวเลือกการจองใหม่',
      ],
    },
    {
      title: '5. การชำระเงินและการกำหนดราคา',
      content: [
        '5.1 เอเจนซี่มีหน้าที่รับผิดชอบในการเก็บเงินทั้งหมดจากลูกค้า',
        '5.2 การชำระเงินให้ไทยอาข่าคิทเช่นต้องดำเนินการตามกำหนดการชำระเงินที่ตกลงกัน โดยปกติภายใน 30 วันตามปฏิทินหลังจากคลาสสิ้นสุด',
        '5.3 โครงสร้างค่าคอมมิชชั่นระบุไว้ในข้อตกลงพันธมิตรของท่าน และไม่สามารถแก้ไขโดยฝ่ายใดฝ่ายหนึ่งโดยไม่ได้รับความยินยอมเป็นลายลักษณ์อักษร',
        '5.4 ไทยอาข่าคิทเช่นขอสงวนสิทธิ์ในการปรับราคาโดยแจ้งล่วงหน้าเป็นลายลักษณ์อักษร 30 วัน',
        '5.5 ใบแจ้งหนี้จะออกทางอิเล็กทรอนิกส์เมื่อสิ้นสุดแต่ละช่วงเวลาการชำระเงิน และต้องชำระภายใน 14 วันหลังจากได้รับ',
        '5.6 การชำระเงินล่าช้าอาจถูกคิดดอกเบี้ยในอัตรา 1.5% ต่อเดือน หรืออัตราสูงสุดที่กฎหมายกำหนด',
        '5.7 ค่าธรรมเนียมการโอนเงินทางธนาคารทั้งหมดเป็นความรับผิดชอบของฝ่ายผู้ชำระเงิน',
      ],
    },
    {
      title: '6. นโยบายการยกเลิกและการคืนเงิน',
      content: [
        '6.1 ลูกค้าสามารถยกเลิกการจองได้ภายใน 48 ชั่วโมงก่อนเวลาเริ่มคลาสเพื่อรับเงินคืนเต็มจำนวน หักค่าธรรมเนียมการประมวลผลการชำระเงิน',
        '6.2 การยกเลิกที่ทำน้อยกว่า 48 ชั่วโมงก่อนคลาสไม่สามารถคืนเงินได้',
        '6.3 "การไม่มาปรากฏตัว" (ลูกค้าที่ไม่มาถึงภายใน 15 นาทีหลังเวลาเริ่มคลาส) ไม่มีสิทธิ์ได้รับการคืนเงินหรือการจองใหม่',
        '6.4 หากไทยอาข่าคิทเช่นยกเลิกคลาสเนื่องจากจำนวนผู้ลงทะเบียนไม่เพียงพอ สภาพอากาศ หรือเหตุผลในการดำเนินงานอื่นๆ ลูกค้าที่ได้รับผลกระทบจะได้รับ: การคืนเงินเต็มจำนวนภายใน 5-7 วันทำการ หรือตัวเลือกในการจองใหม่เป็นวันที่อื่น',
        '6.5 พันธมิตรเอเจนซี่มีหน้าที่รับผิดชอบในการดำเนินการคืนเงินให้ลูกค้าตามนโยบายนี้',
        '6.6 คำขอคืนเงินเนื่องจากเหตุฉุกเฉินทางการแพทย์หรือสถานการณ์พิเศษอาจได้รับการพิจารณาเป็นกรณีๆ ไป',
      ],
    },
    {
      title: '7. สิทธิ์ในทรัพย์สินทางปัญญา',
      content: [
        '7.1 เนื้อหาทั้งหมดบนแพลตฟอร์มไทยอาข่าคิทเช่น รวมถึงแต่ไม่จำกัดเพียง รูปภาพ ข้อความ โลโก้ การออกแบบ สูตรอาหาร วิดีโอ และวัสดุประกอบคลาส เป็นทรัพย์สินทางปัญญาแต่เพียงผู้เดียวของไทยอาข่าคิทเช่นหรือผู้อนุญาต',
        '7.2 ท่านต้องไม่ทำซ้ำ แจกจ่าย แก้ไข สร้างงานดัดแปลง แสดงต่อสาธารณะ หรือใช้ประโยชน์เชิงพาณิชย์จากเนื้อหาใดๆ โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรอย่างชัดแจ้ง',
        '7.3 วัสดุประกอบคลาสและสูตรอาหารที่ให้ระหว่างคลาสมีไว้เพื่อการศึกษาของลูกค้าเท่านั้น และต้องไม่ทำซ้ำหรือนำไปใช้เพื่อวัตถุประสงค์ทางการค้า',
        '7.4 ชื่อ "Thai Akha Kitchen" และโลโก้ที่เกี่ยวข้องเป็นเครื่องหมายการค้าจดทะเบียน การใช้งานต้องได้รับการอนุมัติเป็นลายลักษณ์อักษรล่วงหน้า',
        '7.5 ท่านมอบสิทธิ์การใช้งานแบบไม่ผูกขาดและปลอดค่าสิทธิ์แก่เราในการใช้ชื่อและโลโก้เอเจนซี่ของท่านในสื่อการตลาด ขึ้นอยู่กับการอนุมัติของท่าน',
      ],
    },
    {
      title: '8. การรักษาความลับ',
      content: [
        '8.1 ทั้งสองฝ่ายตกลงที่จะรักษาความลับของข้อมูลที่ไม่เป็นสาธารณะทั้งหมดที่เปิดเผยในระหว่างข้อตกลงนี้',
        '8.2 ข้อมูลที่เป็นความลับรวมถึงแต่ไม่จำกัดเพียง: โครงสร้างค่าคอมมิชชั่น กลยุทธ์ทางธุรกิจ ข้อมูลลูกค้า และวัสดุประกอบคลาสที่ยังไม่ได้เผยแพร่',
        '8.3 ภาระผูกพันนี้มีผลต่อเนื่องหลังสิ้นสุดข้อตกลงนี้เป็นระยะเวลาสาม (3) ปี',
        '8.4 ข้อมูลที่เป็นความลับไม่รวมถึงข้อมูลที่: (ก) กลายเป็นสาธารณะโดยไม่ใช่ความผิดของฝ่ายผู้รับ; (ข) อยู่ในความครอบครองของฝ่ายผู้รับก่อนการเปิดเผย; หรือ (ค) ได้รับการพัฒนาอย่างอิสระโดยฝ่ายผู้รับ',
      ],
    },
    {
      title: '9. ข้อจำกัดความรับผิด',
      content: [
        '9.1 ไทยอาข่าคิทเช่นให้บริการตามสภาพที่เป็นอยู่ ("as is") และตามความพร้อมที่มี ("as available") โดยไม่มีการรับประกันใดๆ ทั้งโดยชัดแจ้งหรือโดยนัย',
        '9.2 เราไม่รับประกันว่าแพลตฟอร์มจะทำงานต่อเนื่อง ปราศจากข้อผิดพลาด หรือปราศจากไวรัสหรือส่วนประกอบที่เป็นอันตราย',
        '9.3 ไทยอาข่าคิทเช่นจะไม่รับผิดชอบต่อความเสียหายทางอ้อม โดยบังเอิญ ผลสืบเนื่อง พิเศษ หรือเชิงลงโทษ รวมถึงการสูญเสียผลกำไร ข้อมูล หรือความนิยม',
        '9.4 ความรับผิดสะสมทั้งหมดของเราที่เกิดจากหรือเกี่ยวข้องกับข้อตกลงนี้จะไม่เกินค่าคอมมิชชั่นรวมที่จ่ายให้เอเจนซี่ของท่านใน 12 เดือนก่อนการเรียกร้อง',
        '9.5 เขตอำนาจศาลบางแห่งไม่อนุญาตให้จำกัดการรับประกันโดยนัยหรือความรับผิดสำหรับความเสียหายบางประเภท ดังนั้นข้อจำกัดเหล่านี้อาจไม่มีผลบังคับใช้กับท่าน',
      ],
    },
    {
      title: '10. การชดใช้ค่าเสียหาย',
      content: 'ท่านตกลงที่จะชดใช้ค่าเสียหาย ปกป้อง และระงับโทษไทยอาข่าคิทเช่น เจ้าหน้าที่ กรรมการ พนักงาน และตัวแทน จากการเรียกร้อง ความรับผิด ความเสียหาย การสูญเสีย ค่าใช้จ่าย หรือค่าธรรมเนียม (รวมถึงค่าทนายความ) ที่เกิดขึ้นจาก: (ก) การใช้แพลตฟอร์มของท่าน; (ข) การละเมิดข้อกำหนดเหล่านี้; (ค) การละเมิดกฎหมายหรือข้อบังคับที่เกี่ยวข้อง; หรือ (ง) ประสบการณ์ของลูกค้าท่านกับเอเจนซี่ของท่าน',
    },
    {
      title: '11. การระงับข้อพิพาท',
      content: [
        '11.1 ข้อพิพาทใดๆ ที่เกิดจากหรือเกี่ยวข้องกับข้อกำหนดในการให้บริการฉบับนี้จะต้องได้รับการแก้ไขผ่านการเจรจาด้วยความสุจริตใจระหว่างคู่สัญญาก่อน',
        '11.2 หากการเจรจาไม่สามารถระงับข้อพิพาทได้ภายใน 30 วัน ข้อพิพาทจะได้รับการระงับผ่านอนุญาโตตุลาการที่มีผลผูกพันโดยสถาบันอนุญาโตตุลาการไทย (THAC) ตามกฎของสถาบัน',
        '11.3 การอนุญาโตตุลาการจะจัดขึ้นที่จังหวัดเชียงใหม่ ประเทศไทย และดำเนินการเป็นภาษาอังกฤษ',
        '11.4 แต่ละฝ่ายรับภาระค่าใช้จ่ายในการอนุญาโตตุลาการของตนเอง รวมถึงค่าทนายความ เว้นแต่อนุญาโตตุลาการจะตัดสินว่าฝ่ายใดฝ่ายหนึ่งกระทำโดยไม่สุจริตใจ',
        '11.5 คำชี้ขาดของอนุญาโตตุลาการมีผลสุดท้ายและมีผลผูกพัน และอาจบังคับใช้ได้ในศาลที่มีเขตอำนาจ',
        '11.6 ข้อกำหนดเหล่านี้ไม่ขัดขวางคู่สัญญาฝ่ายใดฝ่ายหนึ่งในการขอคำสั่งห้ามชั่วคราวจากศาลที่มีเขตอำนาจ',
        '11.7 ข้อตกลงนี้อยู่ภายใต้และตีความตามกฎหมายของประเทศไทย',
      ],
    },
    {
      title: '12. ระยะเวลาและการสิ้นสุด',
      content: [
        '12.1 ข้อตกลงนี้เริ่มต้นเมื่อท่านยอมรับและดำเนินต่อไปจนกว่าจะถูกยุติโดยฝ่ายใดฝ่ายหนึ่ง',
        '12.2 คู่สัญญาฝ่ายใดฝ่ายหนึ่งอาจยุติข้อตกลงนี้ได้โดยแจ้งล่วงหน้าเป็นลายลักษณ์อักษร 30 วัน',
        '12.3 ไทยอาข่าคิทเช่นอาจยุติทันทีหากท่าน: (ก) ละเมิดข้อกำหนดสาระสำคัญใดๆ; (ข) ละเมิดกฎหมายที่เกี่ยวข้อง; (ค) กระทำการที่ทำลายชื่อเสียงของเรา; หรือ (ง) ล้มละลาย',
        '12.4 เมื่อสิ้นสุด: (ก) ยอดชำระเงินคงค้างทั้งหมดจะครบกำหนดทันที; (ข) การเข้าถึงแพลตฟอร์มของท่านจะสิ้นสุด; (ค) ท่านต้องคืนหรือทำลายข้อมูลที่เป็นความลับทั้งหมด',
      ],
    },
    {
      title: '13. การเปลี่ยนแปลงข้อกำหนด',
      content: 'ไทยอาข่าคิทเช่นขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดในการให้บริการนี้ได้ตลอดเวลา การเปลี่ยนแปลงจะมีผลบังคับใช้เมื่อประกาศบนแพลตฟอร์ม โดยมีระยะเวลาแจ้งล่วงหน้า 14 วันสำหรับการเปลี่ยนแปลงที่มีสาระสำคัญ การใช้งานแพลตฟอร์มต่อเนื่องหลังจากวันที่มีผลบังคับใช้ถือเป็นการยอมรับข้อกำหนดที่แก้ไข',
    },
    {
      title: '14. ข้อมูลการติดต่อ',
      content: [
        'สำหรับคำถามเกี่ยวกับข้อกำหนดในการให้บริการ:',
        '',
        '📧 อีเมล: legal@thaiakha.com',
        '📞 โทรศัพท์: +66 61 325 4611 (08:00-22:00 เวลาประเทศไทย)',
        '📍 ที่อยู่: 14/10 ซอยรัตน์เชียงแสน 2 ตำบลหายยา อำเภอเมือง จังหวัดเชียงใหม่ 50100',
        '🕒 เวลาตอบกลับ: ภายใน 48 ชั่วโมงทำการ',
        '',
        'สำหรับหนังสือบอกกล่าวทางกฎหมาย: legal@thaiakha.com (หัวข้อ: LEGAL NOTICE)',
      ],
    },
  ],
};

// ============================================================================
// PRIVACY POLICY - THAI
// ============================================================================

export const PRIVACY_POLICY_TH: LegalDocument = {
  id: 'privacy_policy_th',
  version: '2.0',
  title: 'นโยบายความเป็นส่วนตัว - พอร์ทัลพันธมิตรธุรกิจ B2B',
  effectiveDate: '2026-03-14',
  lastUpdated: '2026-03-14',
  supersedes: '1.0',
  sections: [
    {
      title: '1. บทนำ',
      content: 'บริษัท ไทยอาข่าคิทเช่น จำกัด มีความมุ่งมั่นในการคุ้มครองความเป็นส่วนตัวและจัดการข้อมูลส่วนบุคคลของท่านด้วยความโปร่งใสและใส่ใจ นโยบายความเป็นส่วนตัวฉบับนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ เปิดเผย และรักษาความปลอดภัยของข้อมูลของท่านเมื่อท่านใช้พอร์ทัลพันธมิตรธุรกิจ B2B และบริการที่เกี่ยวข้อง ("แพลตฟอร์ม") การเข้าถึงหรือการใช้งานแพลตฟอร์มถือว่าท่านยินยอมต่อแนวปฏิบัติที่อธิบายไว้ในนโยบายนี้',
    },
    {
      title: '2. ข้อมูลที่เราเก็บรวบรวม',
      subsections: [
        {
          title: '2.1 ข้อมูลบัญชี',
          content: 'เมื่อท่านลงทะเบียนเป็นพันธมิตรเอเจนซี่ เราเก็บรวบรวม: ชื่อธุรกิจตามกฎหมาย ชื่อทางการค้า เลขประจำตัวผู้เสียภาษี/เลขทะเบียนพาณิชย์ ที่อยู่ธุรกิจ ชื่อและตำแหน่งผู้แทนที่ได้รับมอบอำนาจ อีเมล หมายเลขโทรศัพท์ และรายละเอียดบัญชีธนาคารสำหรับการชำระเงิน',
        },
        {
          title: '2.2 ข้อมูลการจองและธุรกรรม',
          content: 'เราเก็บรวบรวมข้อมูลเกี่ยวกับการจองที่ท่านทำ รวมถึง: ชื่อลูกค้า ข้อมูลติดต่อ (อีเมล โทรศัพท์) ความชอบด้านคลาส ข้อจำกัดทางอาหาร คำขอพิเศษ วันและเวลาจอง จำนวนเงินที่ชำระ รหัสธุรกรรม และประวัติการจอง',
        },
        {
          title: '2.3 ข้อมูลการใช้งานเชิงวิเคราะห์',
          content: 'เราเก็บรวบรวมข้อมูลทางเทคนิคโดยอัตโนมัติเกี่ยวกับวิธีที่ท่านใช้แพลตฟอร์ม: ที่อยู่ IP ประเภทและเวอร์ชันเบราว์เซอร์ ประเภทและรุ่นอุปกรณ์ ระบบปฏิบัติการ หน้าที่เข้าชม เวลาที่ใช้บนหน้าต่างๆ รูปแบบการคลิก แหล่งที่มาของการอ้างอิง และเส้นทางการนำทาง',
        },
        {
          title: '2.4 ข้อมูลการสื่อสาร',
          content: 'เมื่อท่านติดต่อเราผ่านอีเมล โทรศัพท์ แชท หรือผ่านแพลตฟอร์ม เราจะเก็บรักษาสำเนาการสื่อสารเหล่านั้น รวมถึงการบันทึกการโทรบริการลูกค้าเพื่อการฝึกอบรมและการประกันคุณภาพ',
        },
        {
          title: '2.5 คุกกี้และเทคโนโลยีการติดตาม',
          content: 'เราใช้คุกกี้ เว็บบีคอน และเทคโนโลยีการติดตามที่คล้ายกันเพื่อปรับปรุงประสบการณ์ของท่าน จดจำการตั้งค่า วิเคราะห์การใช้งาน และนำเสนอเนื้อหาที่เกี่ยวข้อง ท่านสามารถจัดการการตั้งค่าคุกกี้ผ่านการตั้งค่าเบราว์เซอร์',
        },
      ],
    },
    {
      title: '3. วิธีการที่เราใช้ข้อมูลของท่าน',
      content: [
        '3.1 ประมวลผลและจัดการการจองและการชำระเงินของท่าน',
        '3.2 ออกใบแจ้งหนี้ ประมวลผลการชำระเงิน และจัดการบันทึกทางการเงิน',
        '3.3 ยืนยันตัวตนและข้อมูลประจำตัวธุรกิจของท่าน',
        '3.4 ให้การสนับสนุนลูกค้าและตอบกลับการสอบถามของท่าน',
        '3.5 ป้องกันการฉ้อโกง ตรวจจับธุรกรรมที่ไม่ได้รับอนุญาต และเสริมความปลอดภัย',
        '3.6 ปรับปรุงฟังก์ชันแพลตฟอร์ม ประสบการณ์ผู้ใช้ และพัฒนาคุณสมบัติใหม่',
        '3.7 ส่งการสื่อสารด้านการบริหาร (การยืนยันการจอง การอัปเดตนโยบาย การแจ้งเตือนความปลอดภัย)',
        '3.8 ส่งการสื่อสารทางการตลาด (ด้วยความยินยอมของท่าน ซึ่งท่านสามารถถอนได้ตลอดเวลา)',
        '3.9 ปฏิบัติตามภาระผูกพันทางกฎหมาย รวมถึงข้อกำหนดด้านภาษีและการบัญชี',
        '3.10 วิเคราะห์รูปแบบและแนวโน้มการใช้งานเพื่อเพิ่มประสิทธิภาพบริการ',
        '3.11 ปกป้องสิทธิ์ ทรัพย์สิน หรือความปลอดภัยของเรา ผู้ใช้ และสาธารณะ',
      ],
    },
    {
      title: '4. พื้นฐานทางกฎหมายสำหรับการประมวลผล (GDPR)',
      content: [
        'หากท่านอยู่ในเขตเศรษฐกิจยุโรป (EEA) หรือสหราชอาณาจักร พื้นฐานทางกฎหมายสำหรับการประมวลผลข้อมูลส่วนบุคคลของท่าน ได้แก่:',
        '• การปฏิบัติตามสัญญา: การประมวลผลที่จำเป็นในการปฏิบัติตามข้อตกลงของเรากับท่าน (มาตรา 6(1)(b))',
        '• ภาระผูกพันทางกฎหมาย: การประมวลผลที่จำเป็นต้องปฏิบัติตามข้อกำหนดทางภาษี การบัญชี และกฎหมายอื่นๆ (มาตรา 6(1)(c))',
        '• ผลประโยชน์โดยชอบด้วยกฎหมาย: การประมวลผลเพื่อป้องกันการฉ้อโกง ความปลอดภัยของเครือข่าย และการปรับปรุงธุรกิจ (มาตรา 6(1)(f))',
        '• ความยินยอม: การสื่อสารทางการตลาดและการเก็บรวบรวมข้อมูลเสริม (มาตรา 6(1)(a))',
      ],
    },
    {
      title: '5. การแบ่งปันข้อมูลและบุคคลที่สาม',
      content: [
        '5.1 เราไม่ขาย ให้เช่า หรือแลกเปลี่ยนข้อมูลส่วนบุคคลของท่านให้กับบุคคลที่สามเพื่อวัตถุประสงค์ทางการตลาด',
        '5.2 เราแบ่งปันข้อมูลกับผู้ประมวลผลการชำระเงินและสถาบันการเงินที่จำเป็นสำหรับการประมวลผลการชำระเงิน',
        '5.3 เราอาจแบ่งปันข้อมูลที่รวบรวมและไม่ระบุตัวตนเพื่อวัตถุประสงค์ด้านการวิเคราะห์และการรายงาน',
        '5.4 หากกฎหมายกำหนด เราอาจเปิดเผยข้อมูลให้กับหน่วยงานรัฐบาล การบังคับใช้กฎหมาย หรือหน่วยงานกำกับดูแล',
        '5.5 ในกรณีของการเข้าซื้อกิจการ การควบรวม หรือการขายสินทรัพย์ ข้อมูลของท่านอาจถูกโอนไปยังบริษัทที่รับซื้อ',
        '5.6 ผู้ให้บริการมีสิทธิ์เข้าถึงข้อมูลเท่าที่จำเป็นสำหรับการปฏิบัติหน้าที่ และมีข้อผูกพันตามสัญญาในการรักษาความลับ',
        '5.7 เราอาจแบ่งปันข้อมูลด้วยความยินยอมของท่านหรือตามที่เปิดเผย ณ เวลาที่เก็บรวบรวม',
      ],
    },
    {
      title: '6. การโอนย้ายข้อมูลระหว่างประเทศ',
      content: [
        'ข้อมูลของท่านอาจได้รับการประมวลผลและจัดเก็บในประเทศไทยและอาจรวมถึงประเทศอื่นๆ ที่เราหรือผู้ให้บริการของเราดำเนินการ',
        'สำหรับการโอนย้ายจาก EEA ไปยังประเทศที่ไม่มีการคุ้มครองที่เพียงพอ เราใช้ข้อตกลงสัญญามาตรฐาน (SCCs) ที่ได้รับอนุมัติจากคณะกรรมาธิการยุโรป',
        'การใช้แพลตฟอร์มของท่านถือว่าท่านยินยอมต่อการโอนข้อมูลของท่านไปยังประเทศอื่นนอกจากประเทศที่ท่านอาศัยอยู่',
        'สำหรับการโอนย้ายไปยังสหรัฐอเมริกา เราอ้างอิงกรอบความเป็นส่วนตัวของข้อมูลสหภาพยุโรป-สหรัฐอเมริกาในกรณีที่เกี่ยวข้อง',
      ],
    },
    {
      title: '7. ความปลอดภัยและการจัดเก็บข้อมูล',
      content: [
        '7.1 เราใช้มาตรการความปลอดภัยมาตรฐานอุตสาหกรรม รวมถึง: การเข้ารหัสข้อมูลระหว่างการส่ง (TLS 1.3) และเมื่อจัดเก็บ (AES-256); ไฟร์วอลล์และระบบตรวจจับการบุกรุก; การตรวจสอบความปลอดภัยและการทดสอบเจาะระบบอย่างสม่ำเสมอ; การควบคุมการเข้าถึงและการยืนยันตัวตนหลายปัจจัยสำหรับพนักงาน',
        '7.2 ข้อมูลทั้งหมดจัดเก็บบนเซิร์ฟเวอร์ที่ปลอดภัยในศูนย์ข้อมูลที่ได้รับการรับรอง ISO 27001',
        '7.3 การเข้าถึงข้อมูลส่วนบุคคลของพนักงานจำกัดเฉพาะบุคลากรที่จำเป็นต้องใช้ข้อมูลในการปฏิบัติหน้าที่',
        '7.4 แม้ว่าเราจะพยายามอย่างเต็มที่ในการปกป้องข้อมูล แต่ไม่มีวิธีการส่งหรือจัดเก็บใดที่ปลอดภัย 100%',
        '7.5 ข้อมูลการชำระเงินประมวลผลผ่านช่องทางการชำระเงินที่ได้รับการรับรอง PCI-DSS ระดับ 1 เราไม่จัดเก็บหมายเลขบัตรเครดิตฉบับสมบูรณ์',
      ],
    },
    {
      title: '8. การเก็บรักษาข้อมูล',
      content: [
        'เราเก็บรักษาข้อมูลส่วนบุคคลของท่านตลอดระยะเวลาที่บัญชีของท่านยังใช้งานอยู่ และเป็นระยะเวลาต่อไปนี้หลังจากการยุติ:',
        '• ข้อมูลบัญชี: 5 ปี (เพื่อปฏิบัติตามภาระผูกพันด้านภาษีและการบัญชี)',
        '• บันทึกธุรกรรม: 7 ปี (ตามข้อกำหนดกฎหมายภาษีไทย)',
        '• การสื่อสาร: 3 ปี (สำหรับการระงับข้อพิพาท)',
        '• บันทึกการใช้งาน: 12 เดือน (สำหรับการวิเคราะห์ความปลอดภัย)',
        '• ความชอบด้านการตลาด: จนกว่าจะถอนความยินยอม',
        'หลังจากระยะเวลาเหล่านี้ ข้อมูลจะถูกลบอย่างปลอดภัยหรือทำให้ไม่ระบุตัวตนเพื่อวัตถุประสงค์ในการวิเคราะห์',
      ],
    },
    {
      title: '9. สิทธิ์ความเป็นส่วนตัวของท่าน',
      subsections: [
        {
          title: '9.1 การเข้าถึงและการแก้ไข',
          content: 'ท่านมีสิทธิ์เข้าถึง ตรวจสอบ และแก้ไขข้อมูลส่วนบุคคลที่ไม่ถูกต้อง เข้าสู่ระบบแดชบอร์ดบัญชีของท่านหรือติดต่อเราเพื่อใช้สิทธิ์นี้',
        },
        {
          title: '9.2 การลบข้อมูล ("สิทธิ์ที่จะถูกลืม")',
          content: 'ท่านอาจขอลบบัญชีและข้อมูลที่เกี่ยวข้อง ขึ้นอยู่กับภาระผูกพันในการเก็บรักษาตามกฎหมาย ข้อมูลบางส่วนอาจถูกเก็บรักษาไว้เพื่อวัตถุประสงค์ด้านภาษี การบัญชี และการป้องกันการฉ้อโกง เราจะตอบสนองภายใน 30 วัน',
        },
        {
          title: '9.3 การพกพาข้อมูล',
          content: 'ท่านสามารถขอสำเนาข้อมูลส่วนบุคคลของท่านในรูปแบบที่มีโครงสร้างและอ่านได้ด้วยเครื่อง (JSON) เราจะจัดหาให้ภายใน 30 วันหลังจากคำขอ โดยไม่มีค่าใช้จ่าย',
        },
        {
          title: '9.4 การถอนความยินยอม',
          content: 'สำหรับการประมวลผลใดๆ ที่อิงตามความยินยอมของท่าน (เช่น อีเมลการตลาด) ท่านอาจถอนความยินยอมได้ตลอดเวลาโดยคลิก "ยกเลิกการสมัคร" ในอีเมลหรือติดต่อเรา',
        },
        {
          title: '9.5 การจำกัดและการคัดค้าน',
          content: 'ท่านมีสิทธิ์จำกัดหรือคัดค้านการประมวลผลข้อมูลของท่านเมื่อการประมวลผลของเราอิงตามผลประโยชน์โดยชอบด้วยกฎหมาย',
        },
        {
          title: '9.6 การยื่นคำร้องเรียน',
          content: 'ท่านมีสิทธิ์ยื่นคำร้องเรียนต่อหน่วยงานกำกับดูแลการคุ้มครองข้อมูล โดยเฉพาะในถิ่นที่อยู่ตามปกติ สถานที่ทำงาน หรือสถานที่ที่ถูกกล่าวหาว่าเกิดการละเมิด',
        },
      ],
    },
    {
      title: '10. คุกกี้และเทคโนโลยีการติดตาม',
      content: [
        '10.1 คุกกี้ที่จำเป็น: จำเป็นสำหรับฟังก์ชันแพลตฟอร์ม รวมถึงการยืนยันตัวตน ความปลอดภัย และการจัดการเซสชัน ไม่สามารถปิดการใช้งานได้',
        '10.2 คุกกี้เพื่อการวิเคราะห์: ช่วยให้เราเข้าใจวิธีที่ผู้เข้าชมโต้ตอบกับแพลตฟอร์ม เราใช้ Google Analytics ท่านสามารถเลือกไม่ใช้ผ่านการตั้งค่าเบราว์เซอร์',
        '10.3 คุกกี้เชิงฟังก์ชัน: จดจำการตั้งค่าและการกำหนดลักษณะของท่านเพื่อปรับปรุงประสบการณ์',
        '10.4 คุกกี้ทางการตลาด: อาจใช้เพื่อนำเสนอโฆษณาที่เกี่ยวข้องและวัดประสิทธิผลของแคมเปญ',
        '10.5 คุกกี้จากบุคคลที่สาม: เนื้อหาที่ฝังไว้อาจวางคุกกี้จากโดเมนของตนเอง เราไม่มีอำนาจควบคุมสิ่งเหล่านี้',
        '10.6 ความยินยอมคุกกี้: ท่านอาจยอมรับหรือปรับแต่งการตั้งค่าคุกกี้ได้ตลอดเวลาผ่านการตั้งค่าบัญชีของท่าน',
      ],
    },
    {
      title: '11. ความเป็นส่วนตัวของเด็ก',
      content: 'แพลตฟอร์มของเราไม่ได้มีไว้สำหรับเด็กที่มีอายุต่ำกว่า 18 ปี และเราไม่ได้เก็บรวบรวมข้อมูลส่วนบุคคลจากผู้เยาว์โดยเจตนา หากเราทราบว่าได้เก็บรวบรวมข้อมูลจากเด็กที่มีอายุต่ำกว่า 18 ปีโดยไม่มีการยืนยันความยินยอมของผู้ปกครอง เราจะลบข้อมูลนั้นทันที',
    },
    {
      title: '12. การปฏิบัติตาม GDPR (พันธมิตรใน EEA และสหราชอาณาจักร)',
      content: [
        'หากท่านอยู่ในเขตเศรษฐกิจยุโรป (EEA) หรือสหราชอาณาจักร ท่านมีสิทธิ์เพิ่มเติม:',
        '• เจ้าหน้าที่คุ้มครองข้อมูล (DPO) ของเราสามารถติดต่อได้ที่ dpo@thaiakha.com',
        '• ข้อตกลงการประมวลผลข้อมูล (DPA) มีให้ตามคำขอสำหรับพันธมิตรใน EEA',
        '• เราดำเนินการประเมินผลกระทบต่อการคุ้มครองข้อมูล (DPIAs) สำหรับการประมวลผลที่มีความเสี่ยงสูง',
      ],
    },
    {
      title: '13. สิทธิ์ความเป็นส่วนตัวแคลิฟอร์เนีย (CCPA/CPRA)',
      content: [
        'หากท่านเป็นผู้อยู่อาศัยในรัฐแคลิฟอร์เนีย กฎหมาย CCPA และ CPRA ให้สิทธิ์เพิ่มเติม:',
        '• สิทธิ์ที่จะทราบว่าเราเก็บรวบรวม ใช้ เปิดเผย และขายข้อมูลส่วนบุคคลอะไรบ้าง',
        '• สิทธิ์ในการลบข้อมูลส่วนบุคคล (ขึ้นอยู่กับข้อยกเว้น)',
        '• สิทธิ์ในการเลือกไม่รับการขายหรือแบ่งปันข้อมูลส่วนบุคคล (เราไม่ขายข้อมูล)',
        '• สิทธิ์ในการแก้ไขข้อมูลส่วนบุคคลที่ไม่ถูกต้อง',
        '• สิทธิ์ในการจำกัดการใช้ข้อมูลส่วนบุคคลที่มีความละเอียดอ่อน',
        '• สิทธิ์ในการไม่ถูกเลือกปฏิบัติจากการใช้สิทธิ์ความเป็นส่วนตัวของท่าน',
        'ในการใช้สิทธิ์เหล่านี้ กรุณาติดต่อ privacy@thaiakha.com พร้อมหัวข้อ "California Privacy Request"',
      ],
    },
    {
      title: '14. การแจ้งเตือนการละเมิดข้อมูล',
      content: 'ในกรณีที่มีการละเมิดข้อมูลซึ่งก่อให้เกิดความเสี่ยงต่อสิทธิ์และเสรีภาพของท่าน เราจะแจ้งบุคคลที่ได้รับผลกระทบและหน่วยงานกำกับดูแลที่เกี่ยวข้องภายใน 72 ชั่วโมงหลังจากทราบถึงการละเมิด การแจ้งเตือนจะรวมถึง: ลักษณะของการละเมิด ประเภทข้อมูลที่ได้รับผลกระทบ ผลที่อาจเกิดขึ้น และมาตรการที่ดำเนินการ',
    },
    {
      title: '15. การอัปเดตนโยบาย',
      content: 'เราอาจอัปเดตนโยบายความเป็นส่วนตัวนี้เพื่อสะท้อนการเปลี่ยนแปลงในแนวปฏิบัติ เทคโนโลยี หรือกฎหมายที่เกี่ยวข้อง เราจะแจ้งให้ท่านทราบถึงการเปลี่ยนแปลงที่มีสาระสำคัญผ่านทางอีเมลและการแจ้งเตือนบนแพลตฟอร์มอย่างน้อย 30 วันก่อนที่จะมีผลบังคับใช้',
    },
    {
      title: '16. ข้อมูลการติดต่อ',
      content: [
        'สำหรับข้อกังวลด้านความเป็นส่วนตัว คำขอข้อมูล หรือการใช้สิทธิ์ความเป็นส่วนตัว:',
        '',
        '📧 อีเมล: privacy@thaiakha.com',
        '📧 เจ้าหน้าที่คุ้มครองข้อมูล (DPO): dpo@thaiakha.com',
        '📞 โทรศัพท์: +66 61 325 4611 (08:00-22:00 เวลาประเทศไทย)',
        '📍 ที่อยู่: บริษัท ไทยอาข่าคิทเช่น จำกัด 14/10 ซอยรัตน์เชียงแสน 2 ตำบลหายยา อำเภอเมือง จังหวัดเชียงใหม่ 50100',
        '🕒 เวลาตอบกลับ: เราจะตอบสนองต่อคำขอที่ถูกต้องทั้งหมดภายใน 30 วัน',
        '',
        'สำหรับปัญหาด้านความปลอดภัยเร่งด่วน: security@thaiakha.com',
      ],
    },
  ],
};

// ============================================================================
// DATA PROCESSING AGREEMENT (DPA) - For GDPR Compliance
// ============================================================================

export const DATA_PROCESSING_AGREEMENT = {
  id: 'dpa',
  version: '1.0',
  title: 'Data Processing Agreement (EU/UK GDPR)',
  effectiveDate: '2026-03-14',
  /**
   * Complete DPA template available upon request.
   * Includes: Processor obligations, subprocessor list, SCCs, technical measures,
   * incident response, audit rights, and termination provisions.
   * Contact legal@thaiakha.com for the full document.
   */
};

// ============================================================================
// ACCEPTANCE LOGGING UTILITY
// ============================================================================

export const createAcceptanceRecord = (
  agencyId: string,
  documentId: string,
  version: string,
  req?: { ip?: string; headers?: { 'user-agent'?: string } }
): TermsAcceptance => ({
  agencyId,
  documentId,
  version,
  acceptedAt: new Date().toISOString(),
  ipAddress: req?.ip || '0.0.0.0',
  userAgent: req?.headers?.['user-agent'] || 'unknown',
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  TERMS_OF_SERVICE,
  TERMS_OF_SERVICE_TH,
  PRIVACY_POLICY,
  PRIVACY_POLICY_TH,
  DATA_PROCESSING_AGREEMENT,
  createAcceptanceRecord,
};