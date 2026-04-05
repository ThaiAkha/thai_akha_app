
import React from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Button, Icon, Card, InfoCard, Typography, MediaImage } from '../components/ui/index';
import AkhaPixelPattern from '../components/ui/AkhaPixelPattern';
import { SmartHeaderSection } from '../components/layout/SmartHeaderSection';
import { HeaderSection } from '../components/layout/HeaderSection';
import { useFrontHomeCards } from '../hooks/useFrontHomeCards';
import { useRandomCultureSection } from '../hooks/useRandomCultureSection';
import AudioPlayer from '../components/modal/AudioPlayer';
import { cn } from '@thaiakha/shared/lib/utils';
import { GlassCard } from '../components/ui/index';
import {
  CHERRY_FEATURES,
  CHERRY_IMAGE_URL,
  CHERRY_AUDIO_URL,
  HOME_FEATURE_CARDS,
} from '@thaiakha/shared/data';
import { t } from '@thaiakha/shared/lib/ui-strings';

const ROW1_PATHS = ['/classes', '/recipes', '/booking'];

const HomePage: React.FC<{ onNavigate: (p: string, t?: string, s?: string) => void }> = ({ onNavigate }) => {
  const { cards, loading } = useFrontHomeCards();
  const { section: randomSection } = useRandomCultureSection();

  const row1Cards = cards.filter(c => ROW1_PATHS.includes(c.target_path));
  const row2Cards = cards.filter(c => !ROW1_PATHS.includes(c.target_path));

  return (
    <PageLayout slug="home" loading={loading} showPatterns={true} hideDefaultHeader={false}>
      <div className="flex flex-col [gap:var(--space-fluid-section)] [padding-bottom:var(--space-fluid-3xl)]">

        {/* ── MEET CHERRY ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 [gap:var(--space-fluid-xl)] items-center">

          {/* Colonna testo */}
          <div className="order-2 lg:order-1 flex flex-col [gap:var(--space-fluid-m)]">
            <SmartHeaderSection
              sectionId="home_01"
              variant="section"
              align="left"
              gradientFrom="primary"
              gradientTo="action"
            />

            <div className="grid grid-cols-2 md:grid-cols-2 [gap:var(--space-fluid-s)]">
              {CHERRY_FEATURES.map(f => (
                <Card key={f.title} variant="interactive" padding="md" rounded="xl">
                  <Icon name={f.icon} className={`${f.colorClass} [margin-bottom:var(--space-fluid-xs)]`} />
                  <Typography variant="h5">{f.title}</Typography>
                  <Typography variant="paragraphS">{f.description}</Typography>
                </Card>
              ))}
            </div>
          </div>

          {/* Colonna immagine + AudioPlayer */}
          <div className="order-1 lg:order-2 relative aspect-square rounded-[3rem] overflow-hidden border-2 border-border shadow-2xl group">
            <img
              src={CHERRY_IMAGE_URL}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              alt="Cherry Assistant"
            />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <AudioPlayer url={CHERRY_AUDIO_URL} hideTranscript />
            </div>
          </div>

        </section>

        <div className="[margin-top:var(--space-fluid-m)] opacity-30">
          <AkhaPixelPattern variant="mountain" size={10} speed={60} expandFromCenter={true} />
        </div>

        {/* ── EXPLORE ─────────────────────────────────────────────────────── */}
        <section className="flex flex-col [gap:var(--space-fluid-m)]">
          <SmartHeaderSection
            sectionId="home_02"
            variant="section"
            align="center"
            gradientFrom="btn-s"
            gradientTo="secondary"
          />

          {/* ── EXPLORE GRID (Responsive: 2x2+1 on mobile/tablet, 3+2 on desktop) ── */}
          <div className="grid grid-cols-2 md:grid-cols-6 [gap:var(--space-fluid-m)]">
            {!loading && [...row1Cards, ...row2Cards.slice(0, 2)].map((card, idx) => {
              const isLast = idx === 4;
              return (
                <div
                  key={card.id}
                  className={cn(
                    // Desktop: le prime 3 occupano 2/6, le altre 3/6
                    idx < 3 ? 'md:col-span-2' : 'md:col-span-3',
                    // Mobile/Tablet: le prime 4 occupano 1/2, l'ultima 2/2
                    isLast ? 'col-span-2' : 'col-span-1'
                  )}
                >
                  {/* 
                    TRUCCO: Per la quarta card (idx === 3), la vogliamo verticale su mobile (per il 2x2) 
                    ma orizzontale su desktop (per la riga a 2). Usiamo hidden/block per scambiarle.
                  */}
                  {idx === 3 ? (
                    <>
                      <div className="md:hidden">
                        <InfoCard
                          card={{ ...card, link: card.target_path.replace('/', ''), desc: card.description, image: card.image_url }}
                          layout="vertical"
                          onNavigate={onNavigate}
                        />
                      </div>
                      <div className="hidden md:block">
                        <InfoCard
                          card={{ ...card, link: card.target_path.replace('/', ''), desc: card.description, image: card.image_url }}
                          layout="horizontal"
                          onNavigate={onNavigate}
                        />
                      </div>
                    </>
                  ) : (
                    <InfoCard
                      card={{ ...card, link: card.target_path.replace('/', ''), desc: card.description, image: card.image_url }}
                      layout={idx < 3 ? 'vertical' : 'horizontal'}
                      onNavigate={onNavigate}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="[margin-top:var(--space-fluid-m)] opacity-30">
          <AkhaPixelPattern variant="mountain" size={10} speed={60} expandFromCenter={true} />
        </div>

        {/* ── SECTION 03 (Akha People — random culture article) ───────────── */}
        <section className="flex flex-col [gap:var(--space-fluid-m)]">
          <SmartHeaderSection
            sectionId="home_03"
            variant="section"
            align="center"
            gradientFrom="btn-s"
            gradientTo="secondary"
          />
          <GlassCard variant="action" className="[padding:var(--space-fluid-l)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 [gap:var(--space-fluid-xl)] items-center">

              {/* Photo Left */}
              <div className="order-2 lg:order-1 rounded-4xl overflow-hidden border border-white/10 group aspect-video">
                {randomSection?.primary_image
                  ? <MediaImage
                      assetId={randomSection.primary_image}
                      showCaption={false}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  : <div className="w-full h-full bg-surface-2 animate-pulse" />
                }
              </div>

              {/* Text Right */}
              <div className="order-1 lg:order-2 flex flex-col [gap:var(--space-fluid-s)]">
                {randomSection
                  ? <HeaderSection
                      title={randomSection.title}
                      subtitle={randomSection.subtitle ?? undefined}
                      variant="section"
                      align="left"
                      gradientFrom="primary"
                      gradientTo="action"
                      hideTag={true}
                    />
                  : <SmartHeaderSection
                      sectionId="home_03"
                      variant="section"
                      align="left"
                      gradientFrom="primary"
                      gradientTo="action"
                      hideTag={true}
                    />
                }
                <div className="[padding-top:var(--space-fluid-s)]">
                  <Button
                    variant="brand"
                    size="sm"
                    icon="auto_stories"
                    onClick={() => randomSection
                      ? onNavigate('history', undefined, randomSection.slug)
                      : onNavigate('history')
                    }
                  >
                    {randomSection ? t.home.readChapter : t.home.discoverHeritage}
                  </Button>
                </div>
              </div>

            </div>
          </GlassCard>
        </section>

        <div className="[margin-top:var(--space-fluid-m)] opacity-30">
          <AkhaPixelPattern variant="mountain" size={10} speed={60} expandFromCenter={true} />
        </div>

        {/* ── SECTION 04 (AI Quiz) ────────────────────────────────────────── */}
        <section className="flex flex-col [gap:var(--space-fluid-m)]">
          <SmartHeaderSection
            sectionId="home_04"
            variant="section"
            align="center"
            gradientFrom="btn-s"
            gradientTo="secondary"
          />
          <GlassCard variant="secondary" className="[padding:var(--space-fluid-l)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 [gap:var(--space-fluid-xl)] items-center">

              {/* Text Left */}
              <div className="flex flex-col [gap:var(--space-fluid-s)]">
                <SmartHeaderSection
                  sectionId="home_04"
                  variant="section"
                  align="right"
                  gradientFrom="btn-s"
                  gradientTo="secondary"
                  hideTag={true}
                />
                <div className="[padding-top:var(--space-fluid-s)] flex justify-center lg:justify-end">
                  <Button
                    variant="brand"
                    size="sm"
                    icon="psychology"
                    onClick={() => onNavigate('quiz')}
                  >
                    {t.quiz.startQuiz}
                  </Button>
                </div>
              </div>

              {/* Photo Right */}
              <div className="rounded-4xl overflow-hidden border border-white/10 group aspect-video">
                <img
                  src={CHERRY_IMAGE_URL}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="AI Quiz"
                />
              </div>

            </div>
          </GlassCard>
        </section>

      </div>
    </PageLayout>
  );
};

export default HomePage;
