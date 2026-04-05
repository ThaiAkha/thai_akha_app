import React from 'react';
import { Card, Typography, Badge, Icon, MediaImage } from '../ui/index';
import { CookingClassDB } from '@thaiakha/shared';
import StatCard from '../ui/card/StatCard';

interface HeroContentProps {
  activeTab: 'morning' | 'evening';
  currentClass: CookingClassDB | null;
}

export const HeroContent: React.FC<HeroContentProps> = ({ activeTab, currentClass }) => {
  if (!currentClass) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-[500px] flex">
      <Card variant="glass" padding="none" className="w-full flex flex-col lg:flex-row">
        <div className="w-full lg:w-5/12 relative h-64 md:h-[500px] lg:h-full overflow-hidden group shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-10" />
          <MediaImage
            url={currentClass.image_url}
            fallbackAlt={currentClass.title}
            showCaption={false}
            imgClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
          />
          <div
            className="absolute z-20"
            style={{
              bottom: 'var(--space-fluid-xl)',
              left: 'var(--space-fluid-xl)',
              right: 'var(--space-fluid-xl)',
            }}
          >
            <div style={{ marginBottom: 'var(--space-fluid-s)' }}>
              <Badge
                variant="solid"
                color={activeTab === 'morning' ? 'primary' : 'action'}
              >
                {currentClass.badge}
              </Badge>
            </div>
            <Typography
              variant="display2"
              className="text-white uppercase drop-shadow-xl"
            >
              {activeTab}<br /><span className={activeTab === 'morning' ? 'text-primary' : 'text-action'}>Cooking Class</span>
            </Typography>
          </div>
        </div>

        <div
          className="w-full lg:w-7/12 flex flex-col h-full"
          style={{ padding: 'var(--space-fluid-xl)' }}
        >
          <div
            className="flex flex-wrap items-center border-b border-border/50 shrink-0"
            style={{
              gap: 'var(--space-fluid-m)',
              paddingBottom: 'var(--space-fluid-m)',
              marginBottom: 'var(--space-fluid-m)',
            }}
          >
            {currentClass.tagline && (
              <Typography
                variant="h5"
                as="p"
                className="flex-1 italic text-desc leading-relaxed border-l-2 border-primary/40"
                style={{ paddingLeft: 'var(--space-fluid-s)' }}
              >
                "{currentClass.tagline}"
              </Typography>
            )}
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

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col" style={{ gap: 'var(--space-fluid-xl)' }}>
            <div>
              <Typography
                variant="h6"
                as="h3"
                className="text-title flex items-center"
                style={{ marginBottom: 'var(--space-fluid-2xs)', gap: 'var(--space-fluid-xs)' }}
              >
                <Icon name="info" size="sm" className="opacity-70" /> About this class
              </Typography>
              <Typography variant="paragraphM" className="text-desc leading-relaxed">
                {currentClass.description}
              </Typography>
            </div>
            {currentClass.highlights && (
              <div className="rounded-2xl border border-border/30" style={{ padding: 'var(--space-fluid-s)' }}>
                <ul className="flex flex-col" style={{ gap: 'var(--space-fluid-xs)' }}>
                  {currentClass.highlights.map((h, i) => (
                    <li key={i} className="flex items-start" style={{ gap: 'var(--space-fluid-s)' }}>
                      <Icon name="check_circle" size="xs" className={activeTab === 'morning' ? "text-primary shrink-0" : "text-secondary shrink-0"} />
                      <Typography variant="paragraphS" as="span" className="text-sub">
                        {h}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HeroContent;
