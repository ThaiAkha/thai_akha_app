import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Typography, Icon, Button, AkhaCard, Modal, FaqBottomPage } from '../components/ui/index';
import { CinematicBackground, SmartHeaderSection } from '../components/layout/index';
import AuthForm from '../components/auth/AuthForm';
import { contentService } from '@thaiakha/shared/services';
import { cn } from '@thaiakha/shared/lib/utils';
import { t, tObj } from '../i18n';
import { AUTH_HERO_IMAGES, ONBOARDING_CARDS_META } from '../config/auth';
import type { LegalDocument } from '@thaiakha/shared';
import { getInfoPage } from '../services/infoPages.service';
import LegalDocumentStaticViewer from '../components/legal/LegalDocumentStaticViewer';
import { InfoContentSkeleton } from '../components/skeleton';

/** Testo (da i18n) - icon/color arrivano da ONBOARDING_CARDS_META (config/auth). */
interface OnboardingCardText {
  title: string;
  description?: string;
  body?: string;
}
interface OnboardingCard extends OnboardingCardText {
  icon: string;
  color: 'primary' | 'action' | 'secondary' | 'subtle';
}

interface AuthPageProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, onAuthSuccess }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [authPanel, setAuthPanel] = useState<'login' | 'signup'>('login');
  const [showPrivacy, setShowPrivacy] = useState(false);
  // Privacy dal DB (info_pages, stessa fonte di PrivacyPage) — fetch lazy alla
  // prima apertura del modal, poi resta in stato (niente più copia statica).
  const [privacyDoc, setPrivacyDoc] = useState<LegalDocument | null>(null);
  useEffect(() => {
    if (!showPrivacy || privacyDoc) return;
    let cancelled = false;
    getInfoPage('privacy-policy').then(doc => {
      if (!cancelled) setPrivacyDoc(doc);
    });
    return () => { cancelled = true; };
  }, [showPrivacy, privacyDoc]);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    setIsForgotPassword(false);
  }, [step, authPanel]);

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

  const renderFeatureRow = (feature: OnboardingCard, index: number) => {
    const isThird = index === 2;

    return (
      <AkhaCard
        key={feature.title}
        variant="glass"
        rounded="s"
        className={cn("w-full mx-auto", isThird ? 'hidden md:block' : '')}
        padding="s"
      >
        <div className="relative flex items-start [gap:var(--space-fluid-s)]">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-lg">
            <Icon name={feature.icon} size="sm" />
          </div>
          <div className="flex-1">
            <Typography variant="h6" className="mb-0.5">
              {feature.title}
            </Typography>
            <Typography variant="caption" color="muted">
              {feature.description || feature.body}
            </Typography>
          </div>
        </div>
      </AkhaCard>
    );
  };

  return (
    <div
      {...swipeHandlers}
      className="relative min-h-[100dvh] w-full overflow-y-auto font-sans selection:bg-primary/30 flex flex-col"
    >
      {/* SEO: SEOHead via site_metadata 'auth' (access_level=user → noindex) */}
      <CinematicBackground isLoaded={!!imageUrl} imageUrl={imageUrl} />

      <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-l)] [gap:var(--space-fluid-m)]">

        <AkhaCard
          variant="glass"
          className="w-full max-w-[var(--container-form)] md:max-w-[560px] h-[min(740px,calc(100dvh-8rem))] flex flex-col relative overflow-hidden shadow-2xl"
          padding="none"
        >
          {/* ── Slider: solo contenuto, zero pulsanti ── */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div
              className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                width: '300%',
                transform: `translateX(-${(step - 1) * (100 / 3)}%)`
              }}
            >

              {/* STEP 1 */}
              <div className="w-1/3 h-full flex flex-col" style={{ opacity: step === 1 ? 1 : 0, transition: 'opacity 0.4s' }}>
                <div className="flex-1 overflow-y-auto custom-scrollbar [scrollbar-gutter:stable] [padding-inline:var(--space-fluid-m)] [padding-top:var(--space-fluid-m)] [padding-bottom:var(--space-fluid-m)] flex flex-col items-center [gap:var(--space-fluid-s)]">
                  <div className="flex justify-center shrink-0 [min-height:calc(var(--auth-hero-img)*0.67)] items-center">
                    <img
                      src={AUTH_HERO_IMAGES.chef}
                      alt="Chef Cherry"
                      className="h-auto object-contain"
                      style={{ width: 'calc(var(--auth-hero-img) * 0.63)', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
                    />
                  </div>
                  <div className="flex flex-col items-center text-center w-full">
                    <SmartHeaderSection
                      sectionId="auth_step1"
                      variant="section"
                      align="center"
                      hideSubtitle
                      hideTag
                      fallbackTitle={t('auth:onboarding.chef.titleMain')}
                      fallbackHighlight={t('auth:onboarding.chef.titleHighlight')}
                      fallbackDescription={t('auth:onboarding.chef.description')}
                    />
                  </div>
                  <div className="flex flex-col [gap:var(--space-fluid-xs)] [margin-top:var(--space-fluid-s)] w-full">
                    {tObj('auth:onboarding.chef.cards').map((card, i) => renderFeatureRow({ ...(card as OnboardingCardText), ...ONBOARDING_CARDS_META.chef[i] }, i))}
                  </div>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="w-1/3 h-full flex flex-col" style={{ opacity: step === 2 ? 1 : 0, transition: 'opacity 0.4s' }}>
                <div className="flex-1 overflow-y-auto custom-scrollbar [scrollbar-gutter:stable] [padding-inline:var(--space-fluid-m)] [padding-top:var(--space-fluid-m)] [padding-bottom:var(--space-fluid-m)] flex flex-col items-center [gap:var(--space-fluid-s)]">
                  <div className="flex justify-center shrink-0 [min-height:calc(var(--auth-hero-img)*0.67)] items-center">
                    <img
                      src={AUTH_HERO_IMAGES.story}
                      alt="Akha Storyteller"
                      className="h-auto object-contain"
                      loading="lazy"
                      style={{ width: 'calc(var(--auth-hero-img) * 0.63)', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
                    />
                  </div>
                  <div className="flex flex-col items-center text-center w-full">
                    <SmartHeaderSection
                      sectionId="auth_step2"
                      variant="section"
                      align="center"
                      hideSubtitle
                      hideTag
                      fallbackTitle={t('auth:onboarding.story.titleMain')}
                      fallbackHighlight={t('auth:onboarding.story.titleHighlight')}
                      fallbackDescription={t('auth:onboarding.story.description')}
                      gradientFrom="primary"
                      gradientTo="secondary"
                    />
                  </div>
                  <div className="flex flex-col [gap:var(--space-fluid-xs)] [margin-top:var(--space-fluid-s)] w-full">
                    {tObj('auth:onboarding.story.cards').map((card, i) => renderFeatureRow({ ...(card as OnboardingCardText), ...ONBOARDING_CARDS_META.story[i] }, i))}
                  </div>
                </div>
              </div>

              {/* STEP 3 — AuthForm */}
              <div className="w-1/3 h-full flex flex-col" style={{ opacity: step === 3 ? 1 : 0, transition: 'opacity 0.4s' }}>
                <div className="flex-1 min-h-0 flex flex-col">
                  <AuthForm
                    onSuccess={onAuthSuccess}
                    onNavigate={onNavigate}
                    panel={authPanel}
                    onOpenPrivacy={() => setShowPrivacy(true)}
                    onPanelChange={setAuthPanel}
                    isForgotPassword={isForgotPassword}
                    onForgotPasswordChange={setIsForgotPassword}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ── NAV BAR CONDIVISA — sempre fissa sopra i pallini ── */}
          <div className="shrink-0 [padding-inline:var(--space-fluid-m)] [padding-top:var(--space-fluid-m)] [padding-bottom:max(var(--space-fluid-m),env(safe-area-inset-bottom))] flex items-center justify-between bg-surface/50 border-t border-white/5">

            {/* LATO SINISTRO — sempre occupato per bloccare altezza footer */}
            <div className="flex [gap:var(--space-fluid-xs)]">
              {step === 1 && (
                <Button variant="outline" size="sm" icon="arrow_back" className="invisible pointer-events-none" aria-hidden tabIndex={-1}>
                  {t('common:back')}
                </Button>
              )}
              {step === 2 && (
                <Button variant="outline" size="sm" onClick={() => setStep(1)} icon="arrow_back">
                  {t('common:back')}
                </Button>
              )}
              {step === 3 && authPanel === 'login' && (
                <Button variant="outline" size="sm" onClick={() => setStep(2)} icon="arrow_back">
                  {t('common:back')}
                </Button>
              )}
              {step === 3 && authPanel === 'signup' && (
                <Button variant="outline" size="sm" onClick={() => setAuthPanel('login')} icon="arrow_back">
                  {t('auth:switchToLogin')}
                </Button>
              )}
            </div>

            {/* LATO DESTRO — sempre occupato per bloccare altezza footer */}
            <div className="flex [gap:var(--space-fluid-xs)]">
              {step === 1 && (
                <Button variant="brand" size="sm" onClick={() => setStep(2)} icon="arrow_forward" iconPosition="right">
                  {t('auth:nextExperience')}
                </Button>
              )}
              {step === 2 && (
                <Button variant="brand" size="sm" onClick={() => setStep(3)} icon="arrow_forward" iconPosition="right">
                  {t('nav:login')}
                </Button>
              )}
              {step === 3 && authPanel === 'login' && (
                <Button variant="outline" size="sm" onClick={() => setAuthPanel('signup')} icon="arrow_forward" iconPosition="right">
                  {t('auth:newUser')}
                </Button>
              )}
              {step === 3 && authPanel === 'signup' && (
                <Button variant="outline" size="sm" icon="arrow_forward" iconPosition="right" className="invisible pointer-events-none" aria-hidden tabIndex={-1}>
                  {t('auth:newUser')}
                </Button>
              )}
            </div>

          </div>

        </AkhaCard>

        {/* ── PAGINATION DOTS (ESTERNI) ── */}
        <div className="shrink-0 flex justify-center [gap:var(--space-fluid-m)] [padding-block:var(--space-fluid-m)]">
          {[1, 2, 3].map((dotIndex) => (
            <button
              key={`dot-${dotIndex}`}
              onClick={() => setStep(dotIndex as 1 | 2 | 3)}
              className={`min-h-[44px] rounded-full transition-all duration-300 min-w-[44px] flex items-center justify-center ${step === dotIndex
                ? 'w-6 bg-primary shadow-[0_0_10px_rgba(227,31,51,0.4)]'
                : 'w-3 bg-white/10 hover:bg-white/30'
                }`}
              aria-label={t('auth:goToStep', { n: dotIndex })}
            >
              <span className="sr-only">Step {dotIndex}</span>
            </button>
          ))}
        </div>

        {/* ── Link contestuali — fuori card, solo step 3 ── */}
        {step === 3 && (
          <div className="shrink-0 flex flex-col items-center [gap:var(--space-fluid-xs)]">
            {authPanel === 'login' && (
              <button
                onClick={() => setIsForgotPassword(!isForgotPassword)}
                className="hover:opacity-70 transition-opacity [padding-block:var(--space-fluid-2xs)]"
              >
                <Typography variant="accent" color="primary">
                  {isForgotPassword ? t('common:back') : "Forgot Password?"}
                </Typography>
              </button>
            )}
            <button
              onClick={() => setShowPrivacy(true)}
              className="hover:opacity-70 transition-opacity [padding-block:var(--space-fluid-2xs)]"
            >
              {authPanel === 'signup' ? (
                <Typography variant="accent" color="muted" className="text-center">
                  By creating an account, you agree to our{' '}
                  <span className="text-primary font-semibold">{t('auth:privacyLabel')}</span>
                </Typography>
              ) : (
                <Typography variant="accent" color="muted">
                  {t('auth:privacyLabel')}
                </Typography>
              )}
            </button>
          </div>
        )}

        {/* ── FAQ portale/account (standard pagine auth) ── */}
        <div className="w-full max-w-2xl [padding-top:var(--space-fluid-l)]">
          <FaqBottomPage slug="auth" onNavigate={onNavigate} />
        </div>

      </div>

      {/* ── Privacy Modal ── */}
      <Modal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title={t('auth:privacyLabel')}
      >
        {privacyDoc
          ? <LegalDocumentStaticViewer document={privacyDoc} />
          : <InfoContentSkeleton blocks={4} />}
      </Modal>
    </div>
  );
};

export default AuthPage;
