import React from 'react';
import { BookOpen, Star, Sparkles } from 'lucide-react';
import { Button, Typography } from '../ui';
import type { UserProfile } from '@thaiakha/shared/types';

interface StaffWelcomeCardProps {
  userProfile: UserProfile | null;
  onChangeTab: (tab: string) => void;
}

const StaffWelcomeCard: React.FC<StaffWelcomeCardProps> = ({ userProfile, onChangeTab }) => {
  const firstName = userProfile?.full_name?.split(' ')[0] || 'Team';

  return (
    <div className="space-y-5">
      {/* Welcome header */}
      <div className="bg-surface border border-border rounded-3xl p-6 md:p-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
          Staff Dashboard
        </p>
        <Typography variant="h2" color="title" className="leading-tight">
          Welcome back,{' '}
          <span className="text-primary italic">{firstName}</span>
        </Typography>
        <p className="text-sub text-sm mt-3 leading-relaxed">
          Explore the Akha culture quiz and manage your personal profile below.
        </p>
      </div>

      {/* Quiz CTA */}
      <div className="bg-surface border border-border rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          <Star className="w-5 h-5 text-primary" />
          <Typography variant="h5" color="title">Akha Culture Quiz</Typography>
        </div>
        <p className="text-sub text-sm mb-5 leading-relaxed">
          Deepen your knowledge of Thai Akha traditions with our progressive quiz modules.
        </p>
        <Button variant="brand" size="md" onClick={() => onChangeTab('quiz')}>
          <BookOpen className="w-4 h-4" />
          Start Learning
        </Button>
      </div>

      {/* Cultural insight teaser */}
      <div className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-action" />
          <Typography variant="h6" color="title">Did You Know?</Typography>
        </div>
        <p className="text-muted text-sm leading-relaxed">
          The Akha people are known for their distinctive headdresses, each handcrafted and unique to the wearer's village and status.
        </p>
      </div>
    </div>
  );
};

export default StaffWelcomeCard;
