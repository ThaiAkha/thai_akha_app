import React from 'react';
import { Typography, Badge, Icon, Button, MediaImage } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';

// ─── Type (subset of cooking_classes) ────────────────────────────────────────

export interface CatalogClass {
  id: string;          // slug: 'morning_class' | 'evening_class'
  title: string;
  badge?: string | null;
  price: number;
  currency: string;
  duration_text?: string | null;
  tagline?: string | null;
  image_url?: string | null;
  tags?: string[];
}

interface ClassCatalogProps {
  classes: CatalogClass[];
  /** Called when user clicks a class card — receives the tab key ('morning' | 'evening') */
  onSelectClass: (tabKey: string) => void;
  onBook: () => void;
}

// id → tab key  (e.g. 'morning_class' → 'morning')
const idToTab = (id: string): string => id.replace('_class', '');

const ClassCatalog: React.FC<ClassCatalogProps> = ({ classes, onSelectClass, onBook }) => {
  if (!classes.length) return null;

  return (
    <div className="space-y-8">

      {/* Intro */}
      <div className="text-center space-y-2 px-4">
        <Typography variant="paragraphM" className="text-white/60 max-w-2xl mx-auto">
          Choose your session — every class includes market tour, individual workstation, cookbook and hotel pick-up.
        </Typography>
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls, idx) => {
          const tabKey = idToTab(cls.id);
          const isFirst = idx === 0;
          const accentColor = isFirst ? 'text-primary' : 'text-secondary';
          const badgeColor = isFirst ? 'primary' : 'secondary';

          return (
            <div
              key={cls.id}
              onClick={() => onSelectClass(tabKey)}
              className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/7 cursor-pointer transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                {cls.image_url && (
                  <MediaImage
                    url={cls.image_url}
                    fallbackAlt={cls.title}
                    showCaption={false}
                    imgClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                  />
                )}
                <div className="absolute bottom-4 left-5 z-20 flex items-end justify-between w-full pr-5">
                  {cls.badge && (
                    <Badge variant="solid" color={badgeColor} className="text-xs">{cls.badge}</Badge>
                  )}
                  <div className={cn('text-right', accentColor)}>
                    <div className="text-2xl font-black font-display leading-none">
                      {cls.price.toLocaleString()}
                    </div>
                    <div className="text-xs font-mono opacity-80">{cls.currency} / person</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-3 p-5 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <Typography variant="h4" className="text-white/95 leading-tight">{cls.title}</Typography>
                  {cls.duration_text && (
                    <div className="flex items-center gap-1 shrink-0 text-white/40">
                      <Icon name="schedule" size="xs" />
                      <Typography variant="caption">{cls.duration_text}</Typography>
                    </div>
                  )}
                </div>

                {cls.tagline && (
                  <Typography variant="paragraphS" className="text-white/55 leading-relaxed">
                    {cls.tagline}
                  </Typography>
                )}

                {/* Tags */}
                {cls.tags && cls.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {cls.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/8 text-white/60 border border-white/10"
                      >
                        <Icon name="check" size="xs" className={accentColor} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="flex gap-3 mt-auto pt-3">
                  <Button
                    variant="mineral"
                    size="lg"
                    icon="arrow_forward"
                    fullWidth
                    onClick={(e) => { e.stopPropagation(); onSelectClass(tabKey); }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="brand"
                    size="lg"
                    icon="calendar_month"
                    onClick={(e) => { e.stopPropagation(); onBook(); }}
                  >
                    Book
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassCatalog;
