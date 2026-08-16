import React from 'react';
import { PageLayout, InfoPageHero, PageEssentials, SmartHeaderSection, SiblingInfoSection } from '../components/layout';
import { InfoPageSidebar } from '../components/layout/sidebar-info';
import { FaqBottomPage, Card } from '../components/ui';
import { CherryInlineChat, CherryIntroCard } from '../components/chat';
import MapBlock from '../components/modal/MapBlock';
import ContactHeader from '../components/contact/ContactHeader';
import ContactChannels from '../components/contact/ContactChannels';
import ContactForm from '../components/contact/ContactForm';
import ContactLocation from '../components/contact/ContactLocation';
import { usePageSection } from '../hooks/usePageSection';
import { useBusinessProfile } from '../hooks/useBusinessProfile';

interface ContactUsPageProps {
  onNavigate: (page: string) => void;
}

/**
 * Contact Us v2 — layout "azione → consultazione":
 *  · FULL-WIDTH: quick info (contact-01) → canali (contact-06) → blocco Cherry (contact-02)
 *  · CON SIDEBAR (dal form in giù): form (contact-07) → mappa + location/pickup/billing
 * Fonti: page_sections (header) · business_profile (contatti/canali/geo) ·
 * contact_messages (form) · universal_cherry (card+chat).
 */
const ContactUsPage: React.FC<ContactUsPageProps> = ({ onNavigate }) => {
  const { section: cherrySection, loading: cherryLoading } = usePageSection('universal_cherry');
  const { profile: bp } = useBusinessProfile();

  // Mappa embed da business_profile (lat/lng) — DB-driven, niente URL hardcoded.
  const mapEmbedUrl = bp?.latitude != null && bp?.longitude != null
    ? `https://maps.google.com/maps?q=${bp.latitude},${bp.longitude}&z=16&output=embed`
    : null;

  const contactToc = [
    { id: 'contact-info', label: 'Contact & Hours' },
    { id: 'channels', label: 'Find Us Online' },
    { id: 'ask-cherry', label: 'Ask Cherry' },
    { id: 'send-message', label: 'Send a Message' },
    { id: 'location', label: 'Location & Pickup' },
  ];

  return (
    <PageLayout slug="contact-cooking-school-chiang-mai" showPatterns={false}>
      {/* SEO: driven entirely by SEOHead via site_metadata slug. */}

      <div className="flex flex-col [gap:var(--space-fluid-l)] w-full max-w-6xl mx-auto">
        {/* ── PAGE HERO ── */}
        <InfoPageHero
          slug="contact-cooking-school-chiang-mai"
          fallbackIcon="support_agent"
          fallbackTitle="Contact"
          fallbackHighlight="Us"
          dividerTheme="block_faq"
          gradientFrom="ocean-blue"
          gradientTo="deep-ocean"
        />

        {/* ══ ZONA FULL-WIDTH — azione rapida ══════════════════════════════ */}

        {/* 1 · Quick info (contact-01 + business_profile) */}
        <section id="contact-info" className="scroll-mt-24">
          <ContactHeader />
        </section>

        {/* 2 · Canali (contact-06 + business_profile.contact_channels) */}
        <section id="channels" className="flex flex-col [gap:var(--space-fluid-l)] scroll-mt-24">
          <SmartHeaderSection
            sectionId="contact-06"
            variant="section"
            align="left"
            gradientFrom="ocean-blue"
            gradientTo="deep-ocean"
            dividerTheme="block_faq"
          />
          <ContactChannels />
        </section>

        {/* 3 · Blocco Cherry (contact-02 + universal_cherry) — come FAQ page */}
        <section id="ask-cherry" className="flex flex-col [gap:var(--space-fluid-l)] scroll-mt-24">
          <SmartHeaderSection
            sectionId="contact-02"
            variant="section"
            align="left"
            gradientFrom="ocean-blue"
            gradientTo="deep-ocean"
            dividerTheme="block_faq"
          />
          <div className="grid grid-cols-1 lg:grid-cols-5 [gap:var(--space-fluid-m)] items-stretch">
            <div className="lg:col-span-2">
              <CherryIntroCard data={cherrySection} loading={cherryLoading} />
            </div>
            <div className="hidden lg:block lg:col-span-3">
              <CherryInlineChat onNavigate={onNavigate} />
            </div>
          </div>
        </section>

        {/* ══ ZONA CON SIDEBAR — consultazione (dal form alla fine) ═════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,18rem)_1fr] [gap:var(--space-fluid-l)] items-start">
          <InfoPageSidebar
            currentSlug="contact-cooking-school-chiang-mai"
            onNavigate={onNavigate}
            toc={contactToc}
            numberedToc
            ctaCardId="sidebar-cta-classes"
            accent="ocean"
            className="hidden lg:flex lg:sticky lg:top-[var(--space-fluid-l)]"
          />

          <div className="min-w-0 flex flex-col [gap:var(--space-fluid-xl)]">
            {/* 4 · Form (contact-07 → contact_messages) */}
            <section id="send-message" className="flex flex-col [gap:var(--space-fluid-l)] scroll-mt-24">
              <SmartHeaderSection
                sectionId="contact-07"
                variant="section"
                align="left"
                gradientFrom="ocean-blue"
                gradientTo="deep-ocean"
                dividerTheme="block_faq"
              />
              <Card variant="glass" padding="lg" rounded="2xl">
                <ContactForm />
              </Card>
            </section>

            {/* 5 · Mappa (business_profile geo) + Location & Pickup + Billing */}
            <section id="location" className="flex flex-col [gap:var(--space-fluid-l)] scroll-mt-24">
              {mapEmbedUrl && <MapBlock url={mapEmbedUrl} />}
              <ContactLocation />
            </section>
          </div>
        </div>

        <PageEssentials slug="contact-cooking-school-chiang-mai" accent="ocean" />

        <FaqBottomPage
          slug="contact-cooking-school-chiang-mai"
          onNavigate={onNavigate}
        />

        {/* ── RELATED INFO ── */}
        <SiblingInfoSection
          currentSlug="contact-cooking-school-chiang-mai"
          onNavigate={onNavigate}
          accent="ocean"
        />
      </div>
    </PageLayout>
  );
};

export default ContactUsPage;
