import React from 'react';
import { NewsArticle } from '../../hooks/useNewsFeed';
import { NewsCard } from './NewsCard';
import { AkhaPixelPattern } from '../divider';

interface NewsGridProps {
  articles: NewsArticle[];
  onOpen: (slug: string) => void;
}

export const NewsGrid: React.FC<NewsGridProps> = ({ articles, onOpen }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] [gap:var(--space-fluid-m)] lg:[gap:var(--space-fluid-l)] items-center w-full">
      {articles.map((article, idx) => (
        <React.Fragment key={article.id}>
          <div
            className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both h-full"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <NewsCard article={article} onOpen={onOpen} />
          </div>

          {/* Divider between cards (only on large desktop, hidden on tablet/mobile) */}
          {(idx + 1) % 3 !== 0 && idx < articles.length - 1 && (
            <div className="hidden lg:flex items-center justify-center py-4">
              <AkhaPixelPattern
                variant="news"
                size={4}
                speed={20}
                animateInView
                expandFromCenter
                className="opacity-60"
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
