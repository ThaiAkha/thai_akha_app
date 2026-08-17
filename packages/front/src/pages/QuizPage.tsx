import React, { useState } from 'react';
// QuizCategoryDB = ContentCategoryDB with domain='quiz' (backward compat alias)
import { Typography, FaqBottomPage, StatCard, GlassCardFull } from '../components/ui';
import { SkeletonBase } from '../components/skeleton/atoms';
import { SkeletonHeader } from '../components/skeleton/compositions';
import { PageLayout, PageEssentials, SmartHeaderSection, SiblingInfoSection } from '../components/layout';
import AudioPlayer from '../components/modal/AudioPlayer';
import HeaderQuiz from '../components/quiz/HeaderQuiz';
import QuizCard from '../components/quiz/QuizCard';
import QuizCardCategory from '../components/quiz/QuizCardCategory';
import QuizCardRewards from '../components/quiz/QuizCardRewards';
import QuizModalRewards from '../components/quiz/QuizModalRewards';
import { t } from '../i18n';
import { AkhaThemedLine } from '../components/blog';
import { useQuizProgress } from '../hooks/useQuizProgress';
import { useQuizHomeData } from '../hooks/useQuizHomeData';
import { usePageSection } from '../hooks/usePageSection';
import { toStatCardColor } from '../hooks/useHomePageSections';
import { useActiveProfile } from '../context/ActiveProfileContext';

// ── QuizPage ──────────────────────────────────────────────────────────────────
interface QuizPageProps {
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
}

const QuizPage: React.FC<QuizPageProps> = ({ onNavigate }) => {
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const { getCategoryProgress, getGlobalProgress } = useQuizProgress();

  // F2 — punteggio del PROFILO ATTIVO: gestito → DB su activeProfileId, niente localStorage.
  const { activeProfileId, isActingAsManaged, isActiveVisitor } = useActiveProfile();
  const managedId = isActingAsManaged && activeProfileId ? activeProfileId : null;

  const { categories, rewards, score, loading } = useQuizHomeData(managedId);
  // Hero stat cards + header quiz-01 da page_sections (una sola query, riga condivisa)
  const { section: quizHero, loading: quizHeroLoading } = usePageSection('quiz-01');

  // ── Derived data ─────────────────────────────────────────────────────────────
  const nextReward = rewards.find(r => r.required_points > score) ?? null;
  const nextRewardId = nextReward?.id ?? null;
  const xpMax = nextReward?.required_points ?? 100;

  // Heritage Wallet: mappa i reward al formato richiesto da QuizCard
  const walletRewards = rewards.map(r => ({
    ...r,
    icon: r.icon_name
  }));
  const awardedBonuses = rewards.filter(r => r.required_points <= score).map(r => r.id);

  // ── Derived data needed for HeaderQuiz (used even before loading completes) ──
  const globalProg = getGlobalProgress();

  return (
    <PageLayout
      slug="akha-wisdom-path-quiz"
      loading={loading}
      hideDefaultHeader={false}
      gradientFrom="quiz-p"
      gradientTo="quiz-s"
      patternTheme="quiz"
    >
      {/* SEO: driven by SEOHead from site_metadata slug "akha-wisdom-path-quiz".
          No PageSEO — avoids canonical no-www overwrite and seo_title conflict. */}

      {/* ── QUIZ HEADER + SCORE BAR — sticky below the page header ── */}
      <div className="sticky top-[20px] z-30 w-full">
        <HeaderQuiz
          title={t('quiz:spiritQuizTitle')}
          score={score}
          view="HOME"
          progressTextLeft={t('quiz:globalProgress') || 'Global Progress'}
          progressTextRight={`${globalProg.completed} / ${globalProg.total} Modules`}
          progressPercentage={globalProg.percentage}
        />
      </div>
      {loading ? (
        <div className="flex flex-col w-full [gap:var(--space-fluid-l)]">
          <SkeletonHeader align="left" />
          <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-m)]">
            {[1, 2, 3, 4].map(i => <SkeletonBase key={i} className="h-40 rounded-3xl" />)}
          </div>
        </div>
      ) : (
        <>

          {/* ── HERO: Header + Audio + StatCards (left) | Heritage Wallet (right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 [gap:var(--space-fluid-l)] items-start">

            {/* Left — SmartHeader + AudioPlayer + StatCards */}
            <div className="lg:col-span-7 flex flex-col [gap:var(--space-fluid-l)]">
              <SmartHeaderSection
                sectionId="quiz-01"
                prefetchedData={quizHero}
                loading={quizHeroLoading}
                variant="section"
                align="left"
                gradientFrom="quiz-p"
                gradientTo="quiz-s"
              />

              <AudioPlayer assetId="01-cherry-home" hideTranscript className="w-full" />

              <div className="grid grid-cols-2 [gap:var(--space-fluid-m)]">
                {(quizHero?.cards ?? []).map((card) => (
                  <StatCard
                    key={card.title}
                    color={toStatCardColor(card.variant)}
                    value={card.title}
                    description={card.description}
                    size="md"
                    shadow={false}
                  />
                ))}
              </div>
            </div>

            {/* Right — Heritage Wallet card */}
            <div className="lg:col-span-5">
              <QuizCard
                awardedBonuses={awardedBonuses}
                rewards={isActiveVisitor ? [] : walletRewards}
                currentScore={score}
                onCardClick={() => onNavigate('quiz')}
              />
            </div>
          </div>

          <AkhaThemedLine theme="quiz" />

          {/* ── CATEGORIES ── */}
          <section className="flex flex-col [gap:var(--space-fluid-l)]">
            <SmartHeaderSection
              sectionId="quiz-03"
              variant="section"
              align="center"
              gradientFrom="quiz-p"
              gradientTo="quiz-s"

            />
            {categories.length === 0 ? (
              <Typography variant="paragraphM" color="muted">{t('quiz:noCategories')}</Typography>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-m)]">
                {categories.map(cat => (
                  <QuizCardCategory
                    key={cat.id}
                    category={cat}
                    progress={getCategoryProgress(cat.id)}
                    onClick={(id) => onNavigate('quiz', undefined, id)}
                  />
                ))}
              </div>
            )}
          </section>

          <AkhaThemedLine theme="quiz" />

          {/* ── REWARDS (premi) — nascosti ai visitor (F3) ── */}
          {!isActiveVisitor && (
            <>
              <SmartHeaderSection
                sectionId="quiz-02"
                variant="hero2"
                align="center"
                gradientFrom="quiz-p"
                gradientTo="quiz-s"
              />

              {rewards.length > 0 && (
                <div className="grid grid-cols-2 [gap:var(--space-fluid-m)]">
                  {rewards.map((reward, i) => {
                    // Grand prize = highest XP threshold (rewards sorted ascending).
                    const isFeatured = i === rewards.length - 1;
                    return (
                      <QuizCardRewards
                        key={reward.id}
                        reward={reward}
                        currentScore={score}
                        isNextToUnlock={reward.id === nextRewardId}
                        featured={isFeatured}
                        className={isFeatured ? 'col-span-2' : undefined}
                        onClick={(r) => setSelectedRewardId(String(r.id))}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}

          <AkhaThemedLine theme="quiz" />

          {/* ── ARTICLE GUIDE CARD ────────────────────────────────────────────
               GlassCardFull reads "quiz-read-guide" from page_sections.
               Routes to: thai-cooking-tips-news/how-to-play-akha-wisdom-path-quiz */}
          <GlassCardFull
            sectionId="quiz-read-guide"
            imageAssetId="01-home-quiz"
            imageAlt="How to Play the Akha Wisdom Path Quiz — Complete Guide"
            buttonVariant="brand"
            buttonSize="md"
            glassVariant="action"
            gradientFrom="quiz-p"
            gradientTo="quiz-s"
            imagePosition="right"
            onNavigate={onNavigate}
          />

          <PageEssentials
            slug="akha-wisdom-path-quiz"
          />

          <FaqBottomPage slug="akha-wisdom-path-quiz" onNavigate={onNavigate} />

          <SiblingInfoSection
            currentSlug="akha-wisdom-path-quiz"
            onNavigate={onNavigate}
          />
        </>
      )}

      {/* ── REWARD MODAL ── */}
      {selectedRewardId && (
        <QuizModalRewards
          isOpen={!!selectedRewardId}
          rewards={walletRewards}
          initialRewardId={selectedRewardId}
          awardedBonuses={awardedBonuses}
          onClose={() => setSelectedRewardId(null)}
        />
      )}
    </PageLayout>
  );
};

export default QuizPage;
