import React from 'react';
import { Card, Typography, AkhaThemedLine } from '../ui/index';
import { CookingClassDB } from '@thaiakha/shared';
import { SmartHeaderSection } from '../layout/SmartHeaderSection';
import AudioPlayer from '../modal/AudioPlayer';
import { t } from '../../i18n';

// ─── Props ────────────────────────────────────────────────────────────────────
interface HeroContentProps {
  activeTab: 'morning' | 'evening';
  currentClass: CookingClassDB | null;
  /** sectionId for SmartHeaderSection in the right column — default: 'class-00' */
  sectionId?: string;
  /** Audio asset ID rendered below the card, centered */
  audioAssetId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const HeroContent: React.FC<HeroContentProps> = ({
  currentClass,
  sectionId = 'class-00',
  audioAssetId,
}) => {
  if (!currentClass) return null;

  return (
    <div className="flex flex-col [gap:var(--space-fluid-l)]">

      {/* ── Hero Card ──────────────────────────────────────────────────────── */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-[500px] flex">
        <Card variant="glass" padding="none" className="w-full flex flex-col lg:flex-row group overflow-hidden">

          {/* Image column */}
          <div className="w-full lg:w-5/12 relative h-80 md:h-[500px] lg:h-full overflow-hidden shrink-0 bg-surface-2">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
            {/* MediaImage non e' utilizzabile qui: vuole un assetId e la classe espone
                solo un URL. L'immagine e' l'hero, quindi above the fold: `eager` +
                priorita' alta e' corretto, `lazy` la ritarderebbe. */}
            {currentClass.image_url ? (
              <img
                src={currentClass.image_url}
                alt={currentClass.title}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-surface-3" />
            )}
          </div>

          {/* Right column — header + stat badges */}
          <div
            className="w-full lg:w-7/12 flex flex-col justify-center"
            style={{ padding: 'var(--space-fluid-xl)', gap: 'var(--space-fluid-xl)' }}
          >
            <SmartHeaderSection
              sectionId={sectionId}
              variant="hero-1"
              align="left"
            />

            {/* Stat badges — price + class time + pickup, one row */}
            <div className="flex flex-row flex-wrap [gap:var(--space-fluid-xs)]">
              <div className="[padding:var(--space-fluid-s)_var(--space-fluid-m)] rounded-2xl flex flex-col backdrop-blur-md border bg-action/40 text-white border-action/40 shadow-lg">
                <Typography variant="microLabel" className="opacity-60 leading-none mb-1 text-white">
                  {currentClass.unit || t('classes:perPerson')}
                </Typography>
                <Typography variant="numericMedium" className="font-bold leading-tight text-white">
                  {Number(currentClass.price).toLocaleString()} {currentClass.currency === 'THB' ? 'Baht' : currentClass.currency}
                </Typography>
              </div>
              {currentClass.duration_text && (
                <div className="[padding:var(--space-fluid-s)_var(--space-fluid-m)] rounded-2xl flex flex-col backdrop-blur-md border bg-black/40 text-white border-black/20 shadow-lg">
                  <Typography variant="microLabel" className="opacity-60 leading-none mb-1 text-white">
                    {t('classes:classTime')}
                  </Typography>
                  <Typography variant="numericMedium" className="font-bold leading-tight text-white">
                    {currentClass.duration_text}
                  </Typography>
                </div>
              )}
              <div className="[padding:var(--space-fluid-s)_var(--space-fluid-m)] rounded-2xl flex flex-col backdrop-blur-md border bg-black/40 text-white border-black/20 shadow-lg">
                <Typography variant="microLabel" className="opacity-60 leading-none mb-1 text-white">
                  {t('classes:hotelPickup')}
                </Typography>
                <Typography variant="numericMedium" className="font-bold leading-tight text-white">
                  {t('classes:pickupIncluded')}
                </Typography>
              </div>
            </div>
          </div>

        </Card>
      </div>

      {/* ── Audio Player — below card, centered ────────────────────────────── */}
      {audioAssetId && (
        <div className="max-w-2xl mx-auto w-full [padding-inline:var(--space-fluid-m)] [margin-top:var(--space-fluid-l)] relative z-20">
          <AudioPlayer assetId={audioAssetId} hideTranscript className="w-full" />
        </div>
      )}

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <AkhaThemedLine theme="akha" />

    </div>
  );
};

export default HeroContent;
