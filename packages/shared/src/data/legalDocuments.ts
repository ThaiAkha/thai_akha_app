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
  PRIVACY_POLICY,
  DATA_PROCESSING_AGREEMENT,
  createAcceptanceRecord,
};