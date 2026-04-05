import React from 'react';
import { Card, Typography, Button, MediaImage } from '../ui/index';
import StatCard from '../ui/card/StatCard';

interface HeroContentOverviewProps {
  imageUrl: string;
  onAskCherry: () => void;
}

export const HeroContentOverview: React.FC<HeroContentOverviewProps> = ({ imageUrl, onAskCherry }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-[500px] flex">
      <Card variant="glass" padding="none" className="w-full flex flex-col lg:flex-row group">
        <div className="w-full lg:w-5/12 relative h-64 md:h-96 lg:h-full overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
          <MediaImage
            url={imageUrl}
            fallbackAlt="Overview"
            showCaption={false}
            imgClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
          />
        </div>

        <div
          className="w-full lg:w-7/12 flex flex-col justify-center items-start"
          style={{ padding: 'var(--space-fluid-xl)' }}
        >
          <Typography
            variant="accent"
            color="primary"
            style={{ marginBottom: 'var(--space-fluid-xs)' }}
          >
            Sawasdee kha!
          </Typography>
          <Typography
            variant="display2"
            style={{ marginBottom: 'var(--space-fluid-m)' }}
          >
            Welcome to <br /> <span className="text-transparent pr-4 bg-clip-text bg-gradient-to-r from-primary to-action">Our Kitchen</span>
          </Typography>
          <Typography
            variant="paragraphM"
            className="max-w-xl"
            style={{ marginBottom: 'var(--space-fluid-2xl)' }}
          >
            We are not just a cooking school; we are a family sharing our heritage. Master 11 dishes and leave with a full heart.
          </Typography>

          <div
            className="flex flex-wrap items-center mt-auto w-full"
            style={{ gap: 'var(--space-fluid-m)' }}
          >
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
            <div className="flex flex-col shrink-0" style={{ gap: 'var(--space-fluid-s)' }}>
              <Button variant="mineral" onClick={onAskCherry} icon="chat" fullWidth size="lg">Ask Cherry</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HeroContentOverview;
