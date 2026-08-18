import React from 'react';
import { GlassCard, Button, Badge } from '../ui';
import { RippleLink } from '../ui/RippleLink';
import Typography from '../ui/Typography';
import { AkhaPixelPattern } from '../divider';
import { NewsArticle } from '../../hooks/useNewsFeed';

interface NewsCardProps {
  article: NewsArticle;
  onOpen: (slug: string) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onOpen }) => {
  return (
    <GlassCard
      variant="secondary"
      interactive
      padding="none"
      radius="2rem"
      className="group flex flex-col overflow-hidden h-full"
    >
      <RippleLink
        href={`/news/${article.slug}`}
        onNavigate={() => onOpen(article.slug)}
        className="flex flex-col h-full w-full"
      >
        <div className="relative w-full aspect-video overflow-hidden shrink-0 border-b border-white/10 shadow-sm">
          <img
            src={article.cover_data?.image_url || '/placeholder.jpg'}
            alt={article.cover_data?.alt_text || article.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />


        </div>

        <div className="flex flex-col flex-1 [padding:var(--space-fluid-m)] [gap:var(--space-fluid-xs)] justify-between bg-surface/50 backdrop-blur-sm">
          <div className="flex flex-col [gap:var(--space-fluid-xs)]">
            <Typography
              variant="h4"
              className="line-clamp-3 [line-height:1.1] transition-colors duration-300 text-gray-800 dark:text-gray-200 group-hover:text-action"
            >
              {article.title}
            </Typography>

            <div className="w-12 h-[2px] opacity-60 [margin-bottom:var(--space-fluid-2xs)]">
              <AkhaPixelPattern variant="line_simple" size={4} speed={40} />
            </div>

            <Typography
              variant="paragraphS"
              color="sub"
              className="line-clamp-4"
            >
              {article.excerpt}
            </Typography>
          </div>

          <div className="flex flex-col mt-auto [padding-top:var(--space-fluid-s)] [gap:var(--space-fluid-s)] border-t border-border/10">
            <div className="flex items-center justify-between w-full">
              <Badge variant="mineral" color="action" size="xs" icon="schedule" className="[padding-inline:var(--space-fluid-xs)]">
                {article.read_time_minutes} min read
              </Badge>
              <Button variant="brand" size="xs" icon="arrow_forward" iconPosition="right" className="[padding-inline:var(--space-fluid-xs)] [gap:var(--space-fluid-2xs)]">
                Read More
              </Button>
            </div>
          </div>
        </div>
      </RippleLink>
    </GlassCard>
  );
};
