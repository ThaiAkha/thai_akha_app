import React from 'react';
import { Typography, Icon } from '../ui/index';
import Button from '../ui/navigation/Button';
import Modal from '../modal/Modal';
import { HeaderSection } from '../layout/HeaderSection';
import { cn } from '@thaiakha/shared/lib/utils';
import AudioPlayer from '../modal/AudioPlayer';
import { t } from '@thaiakha/shared/lib/ui-strings';
import ButtonQuiz from './ButtonQuiz';

export interface QuizModalReward {
  id: number | string;
  label: string;
  icon: string;
  image_url?: string | null;
  description?: string | null;
  audio_url?: string | null;
  pdf_url?: string | null;
  required_points?: number;
}

export interface QuizModalRewardsProps {
  isOpen: boolean;
  onClose: () => void;
  rewards?: QuizModalReward[];
  initialRewardId?: number | string | null;
  awardedBonuses?: (number | string)[];
}

const QuizModalRewards: React.FC<QuizModalRewardsProps> = ({
  isOpen,
  onClose,
  rewards = [],
  initialRewardId = null,
  awardedBonuses = []
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Sincronizza l'indice iniziale quando la modale si apre
  React.useEffect(() => {
    if (initialRewardId !== null && rewards.length > 0) {
      const idx = rewards.findIndex(r => String(r.id) === String(initialRewardId));
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [initialRewardId, rewards, isOpen]);

  const reward = rewards[currentIndex];

  const handleNext = React.useCallback(() => {
    if (rewards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % rewards.length);
  }, [rewards.length]);

  const handlePrev = React.useCallback(() => {
    if (rewards.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + rewards.length) % rewards.length);
  }, [rewards.length]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen || rewards.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, rewards.length]);

  if (!reward) return null;

  const isLocked = !awardedBonuses.some(bonusId => String(bonusId) === String(reward.id));

  // Condizioni per renderizzare player o download
  const isAudio = reward.audio_url && !reward.audio_url.endsWith('.pdf');
  const isPdf = reward.pdf_url || (reward.audio_url && reward.audio_url.endsWith('.pdf'));
  const pdfLink = reward.pdf_url || reward.audio_url;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="cinema"
      size="full"
      hideCloseButton={true}
      className="bg-transparent shadow-none border-none p-0 w-full h-full flex flex-col items-center justify-center"
    >
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
        {reward.image_url ? (
          <img
            src={reward.image_url}
            alt="Atmosphere"
            className="w-full h-full object-cover opacity-80 mix-blend-multiply"
          />
        ) : (
          <div className="w-full h-full bg-quiz/20 opacity-80 mix-blend-multiply" />
        )}
      </div>

      {/* CLICK-TO-CLOSE — tutto schermo */}
      <div className="fixed inset-0 z-40 cursor-pointer" onClick={onClose} />

      {/* CONTENT — centrato */}
      <div className="relative z-50 w-full max-w-[var(--container-page)] mx-auto flex flex-col items-center pointer-events-none [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-l)]">
        
        {/* ROW: ARROW LEFT + CARD + ARROW RIGHT */}
        <div className="w-full flex items-center justify-center">
          {/* Navigation Arrow Left */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="pointer-events-auto group hidden md:flex items-center justify-center size-16 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-action hover:border-white/20 transition-all mr-8 shrink-0 hover:scale-110 active:scale-95 shadow-xl"
          >
            <Icon name="chevron_left" size="xl" className="transition-transform group-hover:-translate-x-1" />
          </button>

          {/* PHOTO BOX & CONTENT (The "Scheda" format: 16/9 on desktop, 85vh on mobile) */}
          <div 
            key={reward.id} 
            className={cn(
              "pointer-events-auto relative w-full max-w-5xl h-[85vh] md:h-auto md:aspect-video rounded-[3rem] overflow-hidden bg-surface-elevated animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 flex flex-col md:grid md:grid-cols-2 transition-all border-2",
              isLocked 
                ? "border-white/10 shadow-2xl" 
                : "shadow-[0_0_50px_-10px_rgba(152,201,60,0.4)]"
            )}
            style={!isLocked ? { borderColor: '#98C93C' } : {}}
          >
              {/* Left Side - Image/Icon */}
              <div className="relative h-[40%] md:h-full flex items-center justify-center bg-black overflow-hidden group/photo shrink-0">
                {reward.image_url ? (
                  <>
                    <img
                      src={reward.image_url}
                      alt={reward.label}
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-1000 group-hover/photo:scale-110",
                        isLocked && "grayscale opacity-50 blur-[2px]"
                      )}
                    />
                    {/* Black Cinematic Multiply Overlay */}
                    <div className="absolute inset-0 bg-black/60 mix-blend-multiply z-10" />
                    
                    {/* Bottom Gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-15" />

                    {/* XP Badge — Top Center (Mirrored) */}
                    {reward.required_points && (
                      <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-30">
                        <div className="mt-6 md:mt-8 lg:mt-10 flex items-center gap-2 px-4 py-2 rounded-full bg-quiz-p text-white shadow-lg shadow-quiz-p/40 backdrop-blur-sm border border-white/20">
                          <Icon name="stars" size="sm" className="text-white" />
                          <Typography variant="badge" className="font-black text-white uppercase tracking-widest leading-none">
                            {reward.required_points} XP
                          </Typography>
                        </div>
                      </div>
                    )}

                    {/* Luminous Badge Overlay - Bottom */}
                    <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-20">
                      <div className={cn(
                        "px-6 py-2 md:px-8 md:py-3 rounded-full border-2 backdrop-blur-md shadow-2xl flex items-center gap-4 md:gap-5 mb-6 md:mb-8 lg:mb-10 transition-all duration-500",
                        isLocked 
                          ? "bg-black/50 border-white/20 text-white animate-none scale-100" 
                          : "bg-action/50 border-white/40 text-white shadow-action/40 animate-[pulse_1.2s_infinite] scale-110"
                      )}>
                        <Icon name={isLocked ? "lock" : "stars"} size="lg" />
                        <Typography variant="h4" className="font-black uppercase tracking-tighter text-xs md:text-base">
                          {isLocked ? "Locked" : "Unlocked"}
                        </Typography>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="size-48 rounded-full bg-quiz/20 flex items-center justify-center border-4 border-quiz/30 shadow-brand-glow">
                    <Icon name={reward.icon} size="2xl" className="text-quiz" />
                  </div>
                )}
                {/* Overlay gradient for readability se serve su mobile */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface-elevated to-transparent md:hidden" />
              </div>

              {/* Right Side - Content */}
              <div className="flex-1 flex flex-col p-6 md:p-8 lg:p-10 z-10 bg-surface-elevated overflow-y-auto">
                <div className="flex-1 flex flex-col justify-center">

                  <HeaderSection
                    title={reward.label}
                    description={reward.description || "Collect your reward and discover Akha wisdom."}
                    align="left"
                    variant="history"
                  />

                  <div className={cn("mt-8 space-y-4", isLocked && "opacity-30 pointer-events-none grayscale")}>
                    {/* Audio Player */}
                    {isAudio && reward.audio_url && (
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                        <Typography variant="microLabel" color="muted" className="block mb-3 uppercase tracking-widest font-black">
                          Play Audio Track
                        </Typography>
                        <AudioPlayer url={reward.audio_url} title={reward.label} />
                      </div>
                    )}

                    {/* Physical Collection */}
                    {!isAudio && !isPdf && (
                      <div className="flex items-center gap-4 p-4 rounded-3xl bg-quiz/10 border border-quiz/20">
                        <div className="size-10 rounded-full bg-quiz flex items-center justify-center shrink-0">
                          <Icon name="school" size="sm" className="text-color-inverse" />
                        </div>
                        <Typography variant="paragraphS" color="title">
                          Present this screen at the Thai Akha Kitchen cooking school to claim your reward.
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer - Share & Download Actions */}
                <div className={cn("mt-auto pt-6 border-t border-white/10 flex flex-col w-full", isLocked && "opacity-30 grayscale pointer-events-none")}>
                  <div className={cn("grid gap-4 md:gap-5 w-full", (pdfLink || reward.audio_url) ? "grid-cols-2" : "grid-cols-1")}>
                    {(pdfLink || reward.audio_url) && (
                      <a
                        href={`${pdfLink || reward.audio_url}?download=`}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full"
                      >
                        <ButtonQuiz
                          fullWidth
                          disabled={isLocked}
                          config={{
                            label: "Download",
                            icon: "download",
                            variant: 'secondary'
                          }}
                        />
                      </a>
                    )}

                    <ButtonQuiz
                      fullWidth
                      disabled={isLocked}
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Thai Akha Kitchen - Reward Unlocked!',
                            text: `I just unlocked the ${reward.label} reward in the Thai Akha Quiz!`,
                            url: window.location.href,
                          });
                        }
                      }}
                      config={{
                        label: "Share",
                        icon: "share_2",
                        variant: 'secondary'
                      }}
                    />
                  </div>
                </div>
            </div>
          </div>

          {/* Navigation Arrow Right */}
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="pointer-events-auto group hidden md:flex items-center justify-center size-16 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-action hover:border-white/20 transition-all ml-8 shrink-0 hover:scale-110 active:scale-95 shadow-xl"
          >
            <Icon name="chevron_right" size="xl" className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 md:hidden pointer-events-auto">
          <button onClick={handlePrev} className="size-12 rounded-full bg-white/10 flex items-center justify-center text-white"><Icon name="chevron_left" /></button>
          <Typography variant="microLabel" color="muted" className="font-black">
            {currentIndex + 1} / {rewards.length}
          </Typography>
          <button onClick={handleNext} className="size-12 rounded-full bg-white/10 flex items-center justify-center text-white"><Icon name="chevron_right" /></button>
        </div>

        {/* CLOSE BUTTON — Centered Bottom, matched with PhotoModal */}
        <div className="pointer-events-auto [margin-top:var(--space-fluid-l)]">
          <Button
            variant="outline"
            size="sm"
            icon="close"
            onClick={onClose}
            className="text-action border-action/30 hover:bg-action/10 hover:border-action/50 transition-all"
          >
            {t.common.closeReward}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuizModalRewards;
