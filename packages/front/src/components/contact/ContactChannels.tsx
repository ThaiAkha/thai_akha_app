import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '../../i18n';
import { SocialIcons, type SocialIconKey } from '@thaiakha/shared/assets/icons';
import type { ContactChannel } from '@thaiakha/shared/types';
import { Typography } from '../ui';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';

/**
 * ContactChannels — bottoni canali da business_profile.contact_channels (DB):
 * ordine array = ordine render · highlight:true → CTA grande · is_active:false → spento.
 * La mappa type→stile è DESIGN (come i temi divider): colori brand di terzi,
 * non tokenizzabili nel DS — unica eccezione hex consentita, documentata qui.
 */

// Colori BRAND UFFICIALI di servizi terzi (non fanno parte del design system interno).
const CHANNEL_STYLE: Record<string, { label: string; hint?: string; icon: SocialIconKey; bg: string }> = {
  whatsapp: { label: t('contact:channels.whatsapp'), hint: t('contact:channels.whatsappHint'), icon: 'whatsapp', bg: 'linear-gradient(135deg,#2BB741,#25D366)' },
  line: { label: t('contact:channels.line'), hint: t('contact:channels.lineHint'), icon: 'line', bg: 'linear-gradient(135deg,#05A94B,#06C755)' },
  instagram: { label: t('contact:channels.instagram'), icon: 'instagram', bg: 'linear-gradient(45deg,#F58529,#DD2A7B 55%,#8134AF)' },
  messenger: { label: t('contact:channels.messenger'), icon: 'messenger', bg: 'linear-gradient(135deg,#00B2FF,#A033FF)' },
  facebook: { label: t('contact:channels.facebook'), icon: 'facebook', bg: '#1877F2' },
  youtube: { label: t('contact:channels.youtube'), icon: 'youtube', bg: '#FF0000' },
  pinterest: { label: t('contact:channels.pinterest'), icon: 'pinterest', bg: '#E60023' },
  x: { label: t('contact:channels.x'), icon: 'x', bg: '#111111' },
  tripadvisor: { label: t('contact:channels.tripadvisor'), icon: 'tripadvisor', bg: '#34E0A1' },
  maps: { label: t('contact:channels.maps'), icon: 'maps', bg: '#EA4335' },
};

const isVisible = (c: ContactChannel) => c.is_active !== false && !!c.url;

export const ContactChannels: React.FC<{ className?: string }> = ({ className }) => {
  const { profile: bp } = useBusinessProfile();
  const channels = (bp?.contact_channels ?? []).filter(isVisible);
  if (channels.length === 0) return null;

  const ctas = channels.filter(c => c.highlight);
  const icons = channels.filter(c => !c.highlight);

  return (
    <div className={cn('flex flex-col [gap:var(--space-fluid-m)]', className)}>
      {/* CTA grandi (highlight) */}
      {ctas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-s)]">
          {ctas.map(c => {
            const meta = CHANNEL_STYLE[c.type];
            return (
              <a
                key={c.type}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={c.label ?? meta?.label ?? c.type}
                style={{ background: meta?.bg }}
                className="flex items-center [gap:var(--space-fluid-s)] rounded-2xl [padding:var(--space-fluid-s)_var(--space-fluid-m)] text-white shadow-theme-md hover:-translate-y-0.5 hover:shadow-theme-lg transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span className="size-11 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                  {meta && (
                    <img src={SocialIcons[meta.icon]} alt="" aria-hidden="true" className="w-6 h-6 brightness-0 invert" />
                  )}
                </span>
                <span className="min-w-0">
                  <Typography as="span" variant="h6" className="text-white block leading-tight">
                    {c.label ?? meta?.label ?? c.type}
                  </Typography>
                  <Typography as="span" variant="microLabel" className="text-white/85 block normal-case tracking-normal">
                    {[meta?.hint, c.value].filter(Boolean).join(' · ')}
                  </Typography>
                </span>
              </a>
            );
          })}
        </div>
      )}

      {/* Icone tonde brand */}
      {icons.length > 0 && (
        <div className="flex flex-wrap [gap:var(--space-fluid-s)]">
          {icons.map(c => {
            const meta = CHANNEL_STYLE[c.type];
            return (
              <a
                key={c.type}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={c.label ?? meta?.label ?? c.type}
                title={c.label ?? meta?.label ?? c.type}
                style={{ background: meta?.bg }}
                className="size-13 min-w-[52px] min-h-[52px] rounded-full flex items-center justify-center shadow-theme-sm hover:-translate-y-1 hover:scale-105 transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {meta ? (
                  <img src={SocialIcons[meta.icon]} alt="" aria-hidden="true" className="w-6 h-6 brightness-0 invert" />
                ) : (
                  <Typography as="span" variant="microLabel" className="text-white">↗</Typography>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactChannels;
