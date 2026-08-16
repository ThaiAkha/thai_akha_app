import React from 'react';
import { Typography, Icon, Card } from '../ui';
import { cn } from '@thaiakha/shared/lib/utils';

// Mock Data per la Leaderboard
const LEADERBOARD = [
  { rank: 1, name: "HillWarrior", xp: 14200, avatar: "🔥" },
  { rank: 2, name: "BambooSpirit", xp: 13850, avatar: "🎋" },
  { rank: 3, name: "TeaLeaf_99", xp: 12400, avatar: "🍵" },
];

interface TopWarriorsCardProps {
  userXp?: number;
}

const TopWarriorsCard: React.FC<TopWarriorsCardProps> = ({ userXp = 0 }) => {
  return (
    <Card variant="glass" padding="none" className="bg-surface border-border p-6 flex flex-col min-h-[300px] rounded-[2.5rem]">
        <div className="flex justify-between items-center mb-6">
            <Typography variant="h6" color="title" className="flex items-center gap-2 uppercase">
                <Icon name="leaderboard" className="text-quiz"/> Top Warriors
            </Typography>
            <button className="text-[9px] font-bold text-muted hover:text-title uppercase tracking-widest transition-colors">Global</button>
        </div>

        <div className="space-y-2 flex-1">
            {LEADERBOARD.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-2 transition-colors border border-transparent hover:border-border">
                    <div className={cn("size-6 rounded flex items-center justify-center font-black text-xs", 
                        i === 0 ? "bg-quiz text-black shadow-lg shadow-quiz/20" : 
                        i === 1 ? "bg-muted text-surface" : 
                        i === 2 ? "bg-primary text-white" : "bg-surface-3 text-muted")}>
                        {p.rank}
                    </div>
                    <div className="size-8 rounded-full bg-surface-2 flex items-center justify-center text-sm border border-border">
                        {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <Typography variant="caption" className="font-bold truncate" color="title">{p.name}</Typography>
                        <Typography variant="numericRegular" className="text-[9px] text-quiz">{p.xp.toLocaleString()} XP</Typography>
                    </div>
                </div>
            ))}
            
            {/* User Rank Divider */}
            <div className="border-t border-border my-2 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border">
                    <div className="size-6 rounded bg-primary text-white flex items-center justify-center font-black text-xs">42</div>
                    <div className="flex-1">
                      <Typography variant="caption" className="font-bold" color="title">You</Typography>
                    </div>
                    <Typography variant="numericRegular" color="sub" className="text-[9px]">{userXp.toLocaleString()} XP</Typography>
                </div>
            </div>
        </div>
    </Card>
  );
};

export default TopWarriorsCard;
