/**
 * Quiz single - vista HOME: intestazione categoria, lista livelli, premi, spiegazioni on/off,
 * altre categorie, FAQ e sorelle. Estratto da QuizPageSingle.tsx (#16 split monstre), DOM invariato.
 */
import React from 'react';
import { SmartHeaderSection } from '../../components/layout/SmartHeaderSection';
import { SiblingInfoSection } from '../../components/layout/SiblingInfoSection';
import { QuizCard, QuizCardLevel, QuizCardCategory } from '../../components/quiz';
import { Typography, Button, Icon, Card, GlassCardFull, FaqBottomPage } from '../../components/ui/index';
import { AkhaThemedLine } from '../../components/blog';
import { t } from '../../i18n';
import type { QuizGameState } from './useQuizGame';

interface Props { q: QuizGameState; categoryId: string; onNavigate: (page: string, topic?: string, sectionId?: string) => void; }

export const QuizHomeView: React.FC<Props> = ({ q, categoryId, onNavigate }) => {
  const { quizLevels, allCategories, setView, score, completedModules, awardedBonuses, setCurrentLevelId, rewardsList, getCategoryProgress } = q;
  return (
    <>
    <SmartHeaderSection
      sectionId="quiz-single-01"
      variant="section"
      align="center"
      gradientFrom="quiz-p"
      gradientTo="quiz-s"
    />
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 [gap:var(--space-fluid-l)] animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Left column — levels */}
      <div className="lg:col-span-7 flex flex-col [gap:var(--space-fluid-m)]">

        {allCategories.find(c => c.id === categoryId) && (
          <QuizCardCategory
            category={allCategories.find(c => c.id === categoryId)!}
            progress={getCategoryProgress(categoryId)}
            onClick={() => { }}
            hidePlayButton={true}
            isStatic={true}
          />
        )}

        {quizLevels.length === 0 ? (
          <div className="mineral-panel rounded-2xl [padding:var(--space-fluid-l)] text-center">
            <Typography variant="paragraphM" color="muted">{t('quiz:noLevels')}</Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 [gap:var(--space-fluid-m)]">
            {quizLevels.map((lvl, lvlIndex) => {
              // Il livello 1 (index 0) è sempre sbloccato.
              // I successivi si sbloccano solo se TUTTI i moduli del livello precedente sono completati.
              const completedCount = lvl.modules.filter(m => completedModules.includes(m.id)).length;
              const isFullyCompleted = completedCount > 0 && completedCount === lvl.modules.length;

              let isLocked = false;
              if (lvlIndex > 0) {
                const prevLvl = quizLevels[lvlIndex - 1];
                const prevCompletedCount = prevLvl.modules.filter(m => completedModules.includes(m.id)).length;
                isLocked = prevCompletedCount < prevLvl.modules.length;
              }
              const isCurrent = !isLocked && !isFullyCompleted;

              return (
                <QuizCardLevel
                  key={lvl.id}
                  level={lvl}
                  levelNumber={lvl.display_order || (lvlIndex + 1)}
                  isLocked={isLocked}
                  isCurrent={isCurrent}
                  completedCount={completedCount}
                  onClick={() => {
                    setCurrentLevelId(lvl.id);
                    setView('LEVEL_SELECT');
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Divider and QuizCard added to the left column */}
        <div className="[padding-top:var(--space-fluid-l)]">
          <AkhaThemedLine theme="quiz" />
        </div>

        <div className="w-full [padding-top:var(--space-fluid-m)]">
          <QuizCard
            title={t('quiz:heritageWalletTitle')}
            description={t('quiz:heritageWalletDesc')}
            awardedBonuses={awardedBonuses}
            rewards={rewardsList}
            currentScore={score}
            onCardClick={() => { }}
          />
        </div>
      </div>

      {/* Right column — sidebar */}
      <div className="lg:col-span-5 flex flex-col [gap:var(--space-fluid-m)]">

        {/* 1. SAVE CTA (Top) */}
        <AkhaThemedLine
          theme="quiz"
          className="py-4"
        />
        <GlassCardFull
          sectionId="quiz-cta-save"
          onNavigate={(path) => onNavigate(path.split('/')[0] || 'home', path.split('/')[1])}
          glassVariant="subtle"
          buttonSize="sm"
          hideImage={true}
          hideSubtitle={true}
          radius="2.5rem"
        />


        {allCategories.filter(c => c.id !== categoryId).length > 0 && (
          <>
            <AkhaThemedLine
              theme="quiz"
              className="py-4"
            />
            <div className="flex flex-col [gap:var(--space-fluid-m)]">
              {allCategories.filter(c => c.id !== categoryId).map(cat => (
                <QuizCardCategory
                  key={cat.id}
                  category={cat}
                  progress={getCategoryProgress(cat.id)}
                  variant="compact"
                  onClick={(id) => onNavigate('quiz', undefined, id)}
                />
              ))}
            </div>
          </>
        )}


        {/* 2. BOOK CTA (Bottom) */}
        <AkhaThemedLine
          theme="quiz"
          className="py-4"
        />
        <GlassCardFull
          sectionId="quiz-cta-book"
          onNavigate={(path) => onNavigate(path.split('/')[0] || 'home', path.split('/')[1])}
          glassVariant="action"
          buttonSize="sm"
          hideImage={true}
          hideSubtitle={true}
          radius="2.5rem"
        />


        <AkhaThemedLine
          theme="quiz"
          className="py-4"
        />
        <Card variant="glass" padding="lg" rounded="quiz" className="bg-surface/80 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 bg-action/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex items-center [gap:var(--space-fluid-s)] [margin-bottom:var(--space-fluid-m)]">
            <div className="size-10 rounded-xl bg-action/20 flex items-center justify-center text-action">
              <Icon name="school" />
            </div>
            <Typography variant="h5" className="text-white">{t('quiz:cherryRulesTitle')}</Typography>
          </div>

          <div className="flex flex-col [gap:var(--space-fluid-xs)]">
            {[
              { label: t('quiz:hintLabel'), val: t('quiz:hintCost'), color: 'text-red-400' },
              { label: t('quiz:wrongAnswer'), val: t('quiz:zeroXp'), color: 'text-white/40' },
              { label: t('quiz:perfectModule'), val: t('quiz:bonus'), color: 'text-quiz' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center [padding:var(--space-fluid-xs)] rounded-xl bg-white/5 border border-white/5">
                <Typography variant="paragraphS" className="text-white/80">{row.label}</Typography>
                <Typography variant="badge" className={row.color}>{row.val}</Typography>
              </div>
            ))}
          </div>

          <div className="[margin-top:var(--space-fluid-m)]">
            <Button
              variant="action"
              fullWidth
              size="sm"
              icon="arrow_forward"
              iconPosition="right"
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-chat-topic', {
                detail: { topic: t('quiz:scoringTopic') },
              }))}
            >
              {t('quiz:askCherry')}
            </Button>
          </div>
        </Card>
      </div>
    </div>

    {/* FAQ + Sibling — bottom of HOME view, inside main to use gap:xl correctly */}
    <div className="w-full">
      <FaqBottomPage slug="akha-wisdom-path-quiz" onNavigate={onNavigate} />
    </div>
    <SiblingInfoSection
      currentSlug="akha-wisdom-path-quiz"
      onNavigate={onNavigate}
      sectionId="sibiling_quiz"
    />
    </>
  );
};
