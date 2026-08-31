import { t } from '../../i18n';
import { Typography, Icon } from '../ui';
import { SmartHeaderSection } from '../layout';
import { SkeletonBase } from '../skeleton/atoms';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { useContactLocationData } from '../../hooks/useContactLocationData';

// "08:50:00" (time DB) → "8:50 AM"
function fmtTime(hms: string | null | undefined): string | null {
  if (!hms) return null;
  const [h, m] = hms.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * ContactLocation — Location & Pickup interamente da DB:
 *  · meeting point walk-in da `meeting_points` (point_type='walk_in')
 *  · zone pickup con orari/colori reali da `pickup_zones`
 *  · Business & Billing da `business_profile`
 * Header sezioni: page_sections contact-03/04/05.
 */
export default function ContactLocation() {
  const { profile: bp } = useBusinessProfile();
  const { points, zones, loading } = useContactLocationData();

  const fullAddress = bp
    ? [bp.street_address, bp.address_locality, bp.postal_code, bp.address_country]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <section className="flex flex-col [gap:var(--space-fluid-l)]">
      <SmartHeaderSection
        sectionId="contact-03"
        variant="section"
        align="left"
        gradientFrom="ocean-blue"
        gradientTo="deep-ocean"
        dividerTheme="block_faq"
      />

      <div className="flex flex-col [gap:var(--space-fluid-l)]">
        {/* Meeting Points (walk-in) — da meeting_points */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-m)]">
            <SkeletonBase className="h-48 rounded-2xl" />
            <SkeletonBase className="h-48 rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-m)]">
            {points.map(point => {
              const morning = fmtTime(point.morning_pickup_time);
              const evening = fmtTime(point.evening_pickup_time);
              const arrival = [
                morning ? `${t('contact:morningLabel')}: ${morning}` : null,
                evening ? `${t('contact:eveningLabel')}: ${evening}` : null,
              ].filter(Boolean).join(' · ');
              return (
                <div key={point.id} className="flex flex-col [gap:var(--space-fluid-s)] [padding:var(--space-fluid-m)] rounded-2xl bg-surface border border-border">
                  <div className="flex items-center [gap:var(--space-fluid-xs)]">
                    <Icon name="place" className="text-primary" />
                    <Typography variant="h5" as="h3" color="title">{point.name}</Typography>
                  </div>
                  {point.description && (
                    <Typography variant="paragraphS" color="sub">{point.description}</Typography>
                  )}
                  {arrival && (
                    <div className="mt-auto pt-4 border-t border-border">
                      <Typography variant="microLabel" color="muted" className="uppercase tracking-widest mb-2">{t('contact:arrivalTime')}</Typography>
                      <Typography variant="paragraphS" color="default">{arrival}</Typography>
                    </div>
                  )}
                  {point.google_maps_link && (
                    <a href={point.google_maps_link} target="_blank" rel="noopener noreferrer"
                       className="mt-2 inline-flex w-full items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-action/40 text-action text-sm font-semibold hover:bg-action/5 active:scale-[0.98] transition-colors">
                      {t('contact:openInMaps')} <Icon name="open_in_new" size="sm" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pickup Service — header da page_sections contact-04; zone reali da pickup_zones */}
        <div className="flex flex-col [gap:var(--space-fluid-m)]">
          <SmartHeaderSection
            sectionId="contact-04"
            variant="section"
            align="left"
            gradientFrom="ocean-blue"
            gradientTo="deep-ocean"
            dividerTheme="block_faq"
          />
          <div className="[padding:var(--space-fluid-l)] rounded-2xl bg-primary/5 border border-primary/20">
            {loading ? (
              <SkeletonBase className="h-24 rounded-xl" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 [gap:var(--space-fluid-s)]">
                {zones.map(zone => (
                  <div key={zone.id} className="flex flex-col [gap:var(--space-fluid-2xs)] p-3 bg-surface rounded-xl border border-border">
                    <div className="flex items-center [gap:var(--space-fluid-2xs)]">
                      {/* dot colore zona — dal DB (pickup_zones.color_code) */}
                      <span
                        aria-hidden="true"
                        className="w-3 h-3 rounded-full border border-border shrink-0"
                        style={{ backgroundColor: zone.color_code ?? undefined }}
                      />
                      <Typography as="span" variant="caption" color="title" className="font-bold">
                        {zone.name}
                      </Typography>
                    </div>
                    <Typography variant="microLabel" color="muted" className="mt-1">
                      {t('contact:morningLabel')}: {fmtTime(zone.morning_pickup_time) ?? '—'}
                    </Typography>
                    <Typography variant="microLabel" color="muted">
                      {t('contact:eveningLabel')}: {fmtTime(zone.evening_pickup_time) ?? '—'}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Business & Billing — header da page_sections contact-05; dati da business_profile */}
        {bp && (
          <div className="flex flex-col [gap:var(--space-fluid-m)]">
            <SmartHeaderSection
              sectionId="contact-05"
              variant="section"
              align="left"
              gradientFrom="ocean-blue"
              gradientTo="deep-ocean"
              dividerTheme="block_faq"
            />
            <div className="flex flex-col [gap:var(--space-fluid-s)] [padding:var(--space-fluid-m)] rounded-2xl bg-surface border border-border">
              {fullAddress && (
                <div className="flex flex-col [gap:var(--space-fluid-3xs)]">
                  <Typography variant="microLabel" color="muted" className="uppercase tracking-widest">{t('contact:labelAddress')}</Typography>
                  <Typography variant="paragraphS" color="default">{fullAddress}</Typography>
                </div>
              )}
              {bp.legal_name && (
                <div className="flex flex-col [gap:var(--space-fluid-3xs)]">
                  <Typography variant="microLabel" color="muted" className="uppercase tracking-widest">{t('contact:labelLegalName')}</Typography>
                  <Typography variant="paragraphS" color="default">{bp.legal_name}</Typography>
                </div>
              )}
              {bp.tax_id && (
                <div className="flex flex-col [gap:var(--space-fluid-3xs)]">
                  <Typography variant="microLabel" color="muted" className="uppercase tracking-widest">{t('contact:labelTaxId')}</Typography>
                  <Typography variant="paragraphS" color="default">{bp.tax_id}</Typography>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
