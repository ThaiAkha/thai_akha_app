import React, { useState, useEffect } from 'react';
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

interface AuthPageProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, onAuthSuccess }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && step < 3) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
    if (isRightSwipe && step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  useEffect(() => {
    contentService.getPageMetadata('auth').then(m => {
      if (m?.imageUrl) setImageUrl(m.imageUrl);
    });
  }, []);

  const STORYTELLER_IMAGE = '/avatarCherry/600-Avatar-Storyteller.webp';

  const renderFeatureRow = (feature: any) => {
    // Map data colors to GlassCard variants
    const variantMap: Record<string, 'primary' | 'action' | 'secondary' | 'subtle'> = {
      primary: 'primary',
      action: 'action',
      quiz: 'secondary',
      secondary: 'secondary'
    };

    return (
      <GlassCard
        key={feature.title}
        variant={variantMap[feature.color] || 'primary'}
      >
        <div className="relative p-6 flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 shadow-lg">
            <Icon name={feature.iconName || feature.icon} size="sm" />
          </div>
          <div className="flex-1">
            <Typography variant="h6" className="mb-1">
              {feature.title}
            </Typography>
            <Typography variant="paragraphS">
              {feature.description || feature.body}
            </Typography>
          </div>
          {/* Subtle accent line inside the glass */}
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </GlassCard>
    );
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden font-sans selection:bg-primary/30"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CinematicBackground isLoaded={!!imageUrl} imageUrl={imageUrl} />

      {/* Outer clip — hides off-screen steps */}
      <div className="relative z-10 min-h-screen overflow-hidden">

        {/* Slider track — 300% wide for 3 steps */}
        <div
          className="flex min-h-screen transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: '300%',
            transform: `translateX(-${(step - 1) * (100 / 3)}%)`
          }}
        >

          {/* ── STEP 1 — Chef Cherry (The Mentor) ── */}
          <div className="w-1/3 min-h-screen flex items-center justify-center px-4 py-12">
            <div
              className="w-full max-w-xl flex flex-col items-center gap-4 transition-opacity duration-400"
              style={{ opacity: step === 1 ? 1 : 0 }}
            >
              <img
                src={CHEF_HERO_IMAGE}
                alt="Chef Cherry"
                className="w-[200px] sm:w-[240px] h-auto object-contain animate-float"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
              />

              <div className="flex flex-col items-center text-center mb-8">
                <SmartHeaderSection
                  sectionId="auth_step1"
                  variant="section"
                  align="center"
                  fallbackTitle={`${CHEF_TITLE_MAIN} ${CHEF_TITLE_HIGHLIGHT}`}
                  fallbackHighlight={CHEF_TITLE_HIGHLIGHT}
                  fallbackDescription={CHEF_DESCRIPTION}
                />
              </div>

              {/* Feature Cards for Step 1 */}
              <div className="flex flex-col gap-6 mb-6 w-full">
                {CHEF_CARDS.map(renderFeatureRow)}
              </div>

              <Button
                variant="brand"
                size="md"
                onClick={() => setStep(2)}
                icon="arrow_forward"
                iconPosition="right"
                className="rounded-2xl px-6 self-end"
              >
                Next Experience
              </Button>
            </div>
          </div>

          {/* ── STEP 2 — The Storyteller (Highland Wisdom) ── */}
          <div className="w-1/3 min-h-screen flex items-center justify-center px-4 py-12">
            <div
              className="w-full max-w-xl flex flex-col items-center gap-4 transition-opacity duration-400"
              style={{ opacity: step === 2 ? 1 : 0 }}
            >
              <img
                src={STORY_HERO_IMAGE}
                alt="Akha Storyteller"
                className="w-[200px] sm:w-[240px] h-auto object-contain animate-float"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
              />

              <div className="flex flex-col items-center text-center mb-8">
                <SmartHeaderSection
                  sectionId="auth_step2"
                  variant="section"
                  align="center"
                  fallbackTitle={`${STORY_TITLE_MAIN} ${STORY_TITLE_HIGHLIGHT}`}
                  fallbackHighlight={STORY_TITLE_HIGHLIGHT}
                  fallbackDescription={STORY_DESCRIPTION}
                  gradientFrom="primary"
                  gradientTo="secondary"
                />
              </div>

              {/* Feature Cards for Step 2 */}
              <div className="flex flex-col gap-6 mb-6 w-full">
                {STORY_CARDS.map(renderFeatureRow)}
              </div>

              <div className="flex items-center justify-between w-full">
                <Button
                  variant="action"
                  size="md"
                  onClick={() => setStep(1)}
                  icon="arrow_back"
                  className="rounded-2xl px-6"
                >
                  Back
                </Button>

                <Button
                  variant="brand"
                  size="md"
                  onClick={() => setStep(3)}
                  icon="arrow_forward"
                  iconPosition="right"
                  className="rounded-2xl px-6"
                >
                  Login/SignUp
                </Button>
              </div>
            </div>
          </div>

          {/* ── STEP 3 — Auth Form ── */}
          <div className="w-1/3 min-h-screen flex items-center justify-center px-4 py-12">
            <div
              className="w-full max-w-xl flex flex-col gap-4 transition-opacity duration-400"
              style={{ opacity: step === 3 ? 1 : 0 }}
            >
              {/* AuthForm gestisce internamente il flip 3D, i propri Card e il pulsante Back */}
              <div className="h-[80vh]">
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
            className={`w-2 h-2 rounded-full transition-all duration-300 ${step === dotIndex
              ? 'w-6 bg-primary'
              : 'bg-action hover:bg-action'
              }`}
            aria-label={`Go to step ${dotIndex}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthPage;
