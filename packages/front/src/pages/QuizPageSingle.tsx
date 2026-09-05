import React from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { LevelQuiz, PlayQuiz, ResultQuiz, HeaderQuiz } from '../components/quiz';
import { t } from '../i18n';
import { useQuizGame } from './quiz/useQuizGame';
import { QuizHomeView } from './quiz/QuizHomeView';
import { SkeletonBase } from '../components/skeleton';

/** Scheletro della lista livelli: due colonne come la vista vera, zero salti al cambio. */
const QuizHomeSkeleton: React.FC = () => (
  <div className="w-full grid grid-cols-1 lg:grid-cols-12 [gap:var(--space-fluid-l)]">
    <div className="lg:col-span-7 flex flex-col [gap:var(--space-fluid-m)]">
      {[1, 2, 3].map(i => <SkeletonBase key={i} className="h-40 w-full rounded-3xl" />)}
    </div>
    <div className="lg:col-span-5 flex flex-col [gap:var(--space-fluid-m)]">
      {[1, 2].map(i => <SkeletonBase key={i} className="h-56 w-full rounded-3xl" />)}
    </div>
  </div>
);

/**
 * Quiz single (una categoria): HOME · LEVEL_SELECT · PLAYING · RESULT.
 * Struttura (#16 split monstre): stato/azioni in ./quiz/useQuizGame, vista HOME in
 * ./quiz/QuizHomeView, storage/sync in ./quiz/quizStorage. Qui header + le 3 viste di gioco.
 */
interface QuizPageSingleProps {
  categoryId: string;
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
}

const QuizPageSingle: React.FC<QuizPageSingleProps> = ({ categoryId, onNavigate }) => {
  const q = useQuizGame(categoryId, onNavigate);
  const { quizLevels, loading, categoryTitle, view, setView, score, completedModules, perfectModules, bestScores, currentLevelId, currentQuestionIndex, sessionScore, showFeedback, selectedOption, sessionAnswers, showExplanations, setExplanationPref, currentLevel, currentModule, maxTotalScore, handleStartModule, handleAnswer, handleSubmitSelection, handleNext, handleAskHint, handleRetry, handleLearnMore, categoryProg } = q;

  return (
    <PageLayout
      slug="quiz"
      instantContent
      hideDefaultHeader={true}
    >
      <div className="sticky top-[20px] z-30 w-full [margin-bottom:var(--space-fluid-xl)]">
        <HeaderQuiz
          title={view === 'LEVEL_SELECT' && currentLevel ? currentLevel.title : (currentModule ? currentModule.title : categoryTitle)}
          currentLevel={currentLevelId}
          totalLevels={quizLevels.length || 3}
          score={score}
          maxScore={maxTotalScore}
          view={view}
          questionResults={view === 'PLAYING' ? sessionAnswers : undefined}
          totalQuestions={currentModule?.questions?.length || 0}
          progressTextLeft={t('quiz:progress') || 'Progress'}
          progressTextRight={view === 'PLAYING' ? undefined : `${categoryProg.completed} / ${categoryProg.total} Modules`}
          progressPercentage={view === 'PLAYING' ? 0 : categoryProg.percentage}
          onBackClick={() => {
            if (view === 'LEVEL_SELECT' || view === 'PLAYING' || view === 'RESULT') setView('HOME');
            else onNavigate('quiz');
          }}
        />
      </div>
      {/* div, non <main>: il landmark main lo fornisce già PageLayout (#main-content) */}
      <div className={`flex flex-col [gap:var(--space-fluid-xl)] [padding-bottom:var(--space-fluid-section)] ${view !== 'HOME' ? 'items-center justify-center' : ''}`}>

        {/* HOME — level list */}
        {/* L'intestazione del quiz si disegna subito (titolo e punteggio di ripiego,
            come gia' faceva); il corpo mostra il suo scheletro finche' i livelli
            arrivano, invece di tenere ferma tutta la pagina. */}
        {view === 'HOME' && (loading
          ? <QuizHomeSkeleton />
          : <QuizHomeView q={q} categoryId={categoryId} onNavigate={onNavigate} />)}

        {view === 'LEVEL_SELECT' && currentLevel && (
          <LevelQuiz
            level={currentLevel}
            levelNumber={currentLevel.display_order || (quizLevels.findIndex(l => l.id === currentLevelId) + 1)}
            completedModules={completedModules}
            perfectModules={perfectModules}
            bestScores={bestScores}
            onStartModule={handleStartModule}
            onBack={() => setView('HOME')}
            categoryImage={currentLevel.image}
          />
        )}

        {/* PLAYING */}
        {view === 'PLAYING' && currentModule && currentLevel && (
          <PlayQuiz
            level={currentLevel}
            module={currentModule}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={currentModule.questions.length}
            score={score}
            onAnswer={handleAnswer}
            onSubmitSelection={handleSubmitSelection}
            onNext={handleNext}
            onBack={() => setView('LEVEL_SELECT')}
            onGetHint={handleAskHint}
            onRetry={handleRetry}
            onLearnMore={handleLearnMore}
            selectedOption={selectedOption}
            showFeedback={showFeedback}
            showExplanations={showExplanations}
            onToggleExplanations={setExplanationPref}
            categoryImage={currentModule.image_url ?? undefined}
          />
        )}

        {/* RESULT */}
        {view === 'RESULT' && currentModule && currentLevel && (
          <ResultQuiz
            level={currentLevel}
            module={currentModule}
            correctAnswers={sessionScore}
            totalQuestions={currentModule.questions.length}
            xpEarned={sessionScore}
            onNext={() => setView('LEVEL_SELECT')}
            onPlayAgain={() => handleStartModule(currentModule.id)}
            onReturn={() => setView('LEVEL_SELECT')}
          />
        )}

      </div>

    </PageLayout>
  );
};

export default QuizPageSingle;
