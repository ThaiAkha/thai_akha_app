import React from 'react';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { Typography, Icon } from '../ui';
import { SmartHeaderSection } from '../layout';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';

// "Mo-Su 08:00-22:00" (schema.org, business_profile.opening_hours) → riga leggibile.
const DAY_NAMES: Record<string, string> = {
  Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday',
  Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday',
};
function formatOpeningHours(spec: string): { days: string; hours: string } {
  const m = spec.match(/^([A-Za-z]{2})(?:-([A-Za-z]{2}))?\s+(.+)$/);
  if (!m) return { days: spec, hours: '' };
  const from = DAY_NAMES[m[1]] ?? m[1];
  const to = m[2] ? DAY_NAMES[m[2]] ?? m[2] : null;
  return { days: to ? `${from} – ${to}` : from, hours: m[3] };
}

/**
 * ContactHeader — header (page_sections contact-01) + quick info bar.
 * Tutto da DB: titolo/sottotitolo da page_sections, orari/telefono/email da
 * business_profile (fonte unica identità).
 */
export default function ContactHeader() {
  const { profile: bp } = useBusinessProfile();
  const phone = bp?.telephone ?? '';
  const email = bp?.email ?? '';
  const hours = ((bp?.opening_hours ?? []) as unknown as string[]).map(formatOpeningHours);

  return (
    <section className="flex flex-col [gap:var(--space-fluid-l)]">
      <SmartHeaderSection
        sectionId="contact-01"
        variant="section"
        align="left"
        gradientFrom="ocean-blue"
        gradientTo="deep-ocean"
        dividerTheme="block_faq"
      />

      {/* Quick Info Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-m)]">
        {hours.length > 0 && (
          <div className="flex flex-col [gap:var(--space-fluid-xs)] [padding:var(--space-fluid-m)] rounded-2xl bg-surface border border-border">
            <div className="flex items-center [gap:var(--space-fluid-xs)] mb-2">
              <Icon name="schedule" className="text-primary" />
              <Typography variant="h5" as="h3" color="title">{t.contact.labelHours}</Typography>
            </div>
            {hours.map((h, i) => (
              <React.Fragment key={i}>
                <Typography variant="paragraphS" color="default">{h.days}</Typography>
                {h.hours && <Typography variant="paragraphS" color="muted">{h.hours}</Typography>}
              </React.Fragment>
            ))}
          </div>
        )}

        {(phone || email) && (
          <div className="flex flex-col [gap:var(--space-fluid-xs)] [padding:var(--space-fluid-m)] rounded-2xl bg-surface border border-border">
            <div className="flex items-center [gap:var(--space-fluid-xs)] mb-2">
              <Icon name="call" className="text-primary" />
              <Typography variant="h5" as="h3" color="title">{t.contact.directContacts}</Typography>
            </div>
            {/* Tap target reali: telefono → chiama, email → mail (min-h 44px iOS/Android) */}
            {phone && (
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center min-h-[44px] -mx-1.5 px-1.5 rounded-lg hover:bg-primary/5 active:scale-[0.99] transition-colors">
                <Typography variant="paragraphS" color="default" className="font-semibold">{phone}</Typography>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center min-h-[44px] -mx-1.5 px-1.5 rounded-lg hover:bg-primary/5 active:scale-[0.99] transition-colors break-all">
                <Typography variant="paragraphS" color="muted">{email}</Typography>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
