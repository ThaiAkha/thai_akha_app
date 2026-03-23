import React from 'react';
import { Button, Card, Typography, Badge, Icon, MediaImage } from '../ui/index';
import { CookingClassDB } from '@thaiakha/shared';
import StatCard from '../ui/card/StatCard';

interface HeroContentProps {
  activeTab: 'overview' | 'morning' | 'evening';
  currentClass: CookingClassDB | null;
  overviewImage: string;
  onAskCherry: () => void;
}

export const HeroContent: React.FC<HeroContentProps> = ({
  activeTab,
  currentClass,
  overviewImage,
  onAskCherry,
}) => {
  let startTime = "N/A";
  if (currentClass?.schedule_items) {
    const rawTimeStr = currentClass.schedule_items.find(s => s.label === "Class Time")?.time;
    if (rawTimeStr) {
      startTime = rawTimeStr.includes('>')
        ? (rawTimeStr.split('>').pop() || rawTimeStr).trim()
        : rawTimeStr.trim();
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-[500px] flex">
      {activeTab === 'overview' ? (
        <Card variant="glass" padding="none" className="w-full flex flex-col lg:flex-row group">
          <div className="w-full lg:w-5/12 relative h-64 md:h-96 lg:h-full overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
            <MediaImage
              url={overviewImage}
              fallbackAlt="Overview"
              showCaption={false}
              imgClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
            />
          </div>

          <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center items-start">
            <span className="text-primary font-accent font-black uppercase tracking-[0.2em] text-xs mb-4">Sawasdee kha!</span>
            <Typography variant="display2" className="mb-6">
              Welcome to <br /> <span className="text-transparent pr-4 bg-clip-text bg-gradient-to-r from-primary to-action">Our Kitchen</span>
            </Typography>
            <Typography variant="paragraphM" className="mb-10 max-w-xl">
              We are not just a cooking school; we are a family sharing our heritage. Master 11 dishes and leave with a full heart.
            </Typography>

            <div className="flex flex-wrap items-center gap-4 lg:gap-6 mt-auto w-full">
              <StatCard
                size="sm"
                icon="restaurant"
                iconPosition="left"
                value="11 Dishes"
                title="You Will Learn"
                color="secondary"
                shadow={false}
              />
              <StatCard
                size="sm"
                icon="local_taxi"
                iconPosition="left"
                value="Pick-Up"
                title="Included*"
                color="primary"
                shadow={false}
              />
              <StatCard
                size="sm"
                icon="local_taxi"
                iconPosition="left"
                value="Pick-Up"
                title="Included*"
                color="action"
                shadow={false}
              />
              <div className="flex flex-col gap-3 shrink-0">
                <Button variant="mineral" onClick={onAskCherry} icon="chat" fullWidth size="lg">Ask Cherry</Button>
              </div>
            </div>
          </div>
        </Card>
      ) : currentClass ? (
        <Card variant="glass" padding="none" className="w-full flex flex-col lg:flex-row">
          <div className="w-full lg:w-5/12 relative h-64 md:h-[500px] lg:h-full overflow-hidden group shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
            <MediaImage
              url={currentClass.image_url}
              fallbackAlt={currentClass.title}
              showCaption={false}
              imgClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
            />
            <div className="absolute bottom-8 left-8 right-8 z-20">
              <Badge
                variant="solid"
                color={activeTab === 'morning' ? 'primary' : 'action'}
                className="mb-4"
              >
                {currentClass.badge}
              </Badge>
              <h2 className="text-5xl lg:text-6xl font-display font-black text-white italic uppercase tracking-tighter leading-[0.85] drop-shadow-xl">
                {activeTab}<br /><span className={activeTab === 'morning' ? 'text-primary' : 'text-action'}>Cooking Class</span>
              </h2>
            </div>
          </div>

          <div className="w-full lg:w-7/12 p-8 lg:p-12 flex flex-col h-full">
            <div className="flex flex-wrap items-center gap-4 lg:gap-6 border-b border-border/50 pb-6 mb-6 shrink-0">
              <StatCard
                size="sm"
                icon="schedule"
                iconPosition="left"
                value={currentClass.duration_text?.replace('duration', '') || 'N/A'}
                title="Duration"
                color={activeTab === 'morning' ? 'primary' : 'secondary'}
                shadow={false}
              />
              <StatCard
                size="sm"
                icon="schedule"
                iconPosition="left"
                value={startTime}
                title="Start Time"
                color={activeTab === 'morning' ? 'primary' : 'secondary'}
                shadow={false}
              />
              <div className="hidden sm:block flex-1" />
              <StatCard
                size="sm"
                icon="credit_card"
                iconPosition="left"
                value={currentClass.price.toLocaleString()}
                title="Price / Person"
                suffix="THB"
                color={activeTab === 'morning' ? 'primary' : 'secondary'}
                shadow={false}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
              <div>
                <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Icon name="info" size="sm" className="opacity-70" /> About this class</h4>
                <p className="text-gray-700/80 dark:text-gray-300/80 text-sm leading-relaxed">{currentClass.description}</p>
              </div>
              {currentClass.highlights && (
                <div className="p-4 rounded-2xl border border-border/30">
                  <ul className="space-y-2">
                    {currentClass.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                        <Icon name="check_circle" size="xs" className={activeTab === 'morning' ? "text-primary shrink-0" : "text-secondary shrink-0"} />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 shrink-0">
              <Button variant="mineral" onClick={onAskCherry} icon="chat" fullWidth size="lg">Ask Cherry</Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default HeroContent;
