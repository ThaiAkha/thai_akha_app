import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Typography, Icon, Button } from '../components/ui/index';
import { CinematicBackground, SmartHeaderSection } from '../components/layout/index';
import AuthForm from '../components/auth/AuthForm';
import { contentService } from '@thaiakha/shared/services';
import {
  CHEF_HERO_IMAGE, CHEF_TITLE_MAIN, CHEF_TITLE_HIGHLIGHT, CHEF_DESCRIPTION, CHEF_CARDS,
  STORY_HERO_IMAGE, STORY_TITLE_MAIN, STORY_TITLE_HIGHLIGHT, STORY_DESCRIPTION, STORY_CARDS
} from '@thaiakha/shared/data';
import '../components/blog/BlogCardGlass.css';
import GlassCard from '../components/ui/GlassCard';
import { t } from '@thaiakha/shared/lib/ui-strings';

interface AuthPageProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, onAuthSuccess }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setStep(prev => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev)),
    onSwipedRight: () => setStep(prev => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev)),
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  useEffect(() => {
    contentService.getPageMetadata('auth').then(m => {
      if (m?.imageUrl) setImageUrl(m.imageUrl);
    });
  }, []);

  const renderFeatureRow = (feature: any, index: number) => {
    // Map data colors to GlassCard variants
    const variantMap: Record<string, 'primary' | 'action' | 'secondary' | 'subtle'> = {
      primary: 'primary',
      action: 'action',
      quiz: 'secondary',
      secondary: 'secondary'
    };

    // Hide third card on mobile
    const isThird = index === 2;

    return (
      <GlassCard
        key={feature.title}
        variant={variantMap[feature.color] || 'primary'}
        className={isThird ? 'hidden md:block' : ''}
      >
        <div className="relative flex items-start [padding:var(--space-fluid-s)] [gap:var(--space-fluid-s)]">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 shadow-lg">
            <Icon name={feature.iconName || feature.icon} size="sm" />
          </div>
          <div className="flex-1">
            <Typography variant="h6" className="mb-0.5">
              {feature.title}
            </Typography>
            <Typography variant="caption">
              {feature.description || feature.body}
            </Typography>
          </div>
          {/* Subtle accent line inside the glass */}
          <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </GlassCard>
    );
  };

  return (
    <div
      {...swipeHandlers}
      className="relative h-screen w-full overflow-hidden font-sans selection:bg-primary/30"
    >
      <CinematicBackground isLoaded={!!imageUrl} imageUrl={imageUrl} />

      {/* Outer clip — hides off-screen steps */}
      <div className="relative z-10 h-screen overflow-hidden">

        {/* Slider track — 300% wide for 3 steps */}
        <div
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: '300%',
            transform: `translateX(-${(step - 1) * (100 / 3)}%)`
          }}
        >

          {/* ── STEP 1 — Chef Cherry (The Mentor) ── */}
          <div className="w-1/3 h-full flex items-center justify-center px-4">
            <div
              className="w-full max-w-sm h-[80vh] overflow-y-auto flex flex-col items-center justify-center [gap:var(--space-fluid-s)] transition-opacity duration-400"
              style={{ opacity: step === 1 ? 1 : 0 }}
            >
              {/* Image */}
              <div className="flex justify-center">
                <img
                  src={CHEF_HERO_IMAGE}
                  alt="Chef Cherry"
                  className="h-auto object-contain animate-float"
                  style={{ width: 'var(--auth-hero-img)', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
                />
              </div>

              {/* Text + cards */}
              <div className="flex flex-col [gap:var(--space-fluid-s)] w-full">
                <div className="flex flex-col items-center text-center">
                  <SmartHeaderSection
                    sectionId="auth_step1"
                    variant="section"
                    align="center"
                    fallbackTitle={`${CHEF_TITLE_MAIN}`}
                    fallbackHighlight={CHEF_TITLE_HIGHLIGHT}
                    fallbackDescription={CHEF_DESCRIPTION}
                  />
                </div>

                {/* Feature Cards for Step 1 */}
                <div className="flex flex-col [gap:var(--space-fluid-xs)] w-full">
                  {CHEF_CARDS.map((card, i) => renderFeatureRow(card, i))}
                </div>

                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setStep(2)}
                  icon="arrow_forward"
                  iconPosition="right"
                  className="rounded-2xl w-full"
                >
                  {t.auth.nextExperience}
                </Button>
              </div>
            </div>
          </div>

          {/* ── STEP 2 — The Storyteller (Highland Wisdom) ── */}
          <div className="w-1/3 h-full flex items-center justify-center px-4">
            <div
              className="w-full max-w-sm h-[80vh] overflow-y-auto flex flex-col items-center justify-center [gap:var(--space-fluid-s)] transition-opacity duration-400"
              style={{ opacity: step === 2 ? 1 : 0 }}
            >
              {/* Image */}
              <div className="flex justify-center">
                <img
                  src={STORY_HERO_IMAGE}
                  alt="Akha Storyteller"
                  className="h-auto object-contain animate-float"
                  style={{ width: 'var(--auth-hero-img)', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
                />
              </div>

              {/* Text + cards */}
              <div className="flex flex-col [gap:var(--space-fluid-s)] w-full">
                <div className="flex flex-col items-center text-center">
                  <SmartHeaderSection
                    sectionId="auth_step2"
                    variant="section"
                    align="center"
                    fallbackTitle={`${STORY_TITLE_MAIN}`}
                    fallbackHighlight={STORY_TITLE_HIGHLIGHT}
                    fallbackDescription={STORY_DESCRIPTION}
                    gradientFrom="primary"
                    gradientTo="secondary"
                  />
                </div>

                {/* Feature Cards for Step 2 */}
                <div className="flex flex-col [gap:var(--space-fluid-xs)] w-full">
                  {STORY_CARDS.map((card, i) => renderFeatureRow(card, i))}
                </div>

                <div className="flex items-center justify-between w-full">
                  <Button
                    variant="action"
                    size="sm"
                    onClick={() => setStep(1)}
                    icon="arrow_back"
                    className="rounded-2xl px-6"
                  >
                    {t.common.back}
                  </Button>

                  <Button
                    variant="brand"
                    size="sm"
                    onClick={() => setStep(3)}
                    icon="arrow_forward"
                    iconPosition="right"
                    className="rounded-2xl px-6"
                  >
                    {t.auth.loginSignup}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── STEP 3 — Auth Form ── */}
          <div className="w-1/3 h-full flex items-center justify-center px-4">
            <div
              className="w-full max-w-sm h-[60vh] flex flex-col [gap:var(--space-fluid-s)] transition-opacity duration-400"
              style={{ opacity: step === 3 ? 1 : 0 }}
            >
              {/* AuthForm gestisce internamente il flip 3D, i propri Card e il pulsante Back */}
              <div className="h-full">
                <AuthForm onSuccess={onAuthSuccess} onNavigate={onNavigate} onBack={() => setStep(2)} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Pagination Dots ── */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none md:pointer-events-auto">
        {[1, 2, 3].map((dotIndex) => (
          <button
            key={dotIndex}
            onClick={() => setStep(dotIndex as 1 | 2 | 3)}
            className={`size-2 rounded-full transition-all duration-300 ${step === dotIndex
              ? 'w-6 bg-primary'
              : 'bg-action hover:bg-action'
              }`}
            aria-label={t.auth.goToStep({ n: dotIndex })}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthPage;
