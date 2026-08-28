/**
 * CategoryHeader — intestazione di una sezione categoria/shop nella griglia ingredienti
 * (vista "All" del MarketShop). Divider + titolo categoria + conteggio articoli.
 */
import { Heading } from '../typography';

interface CategoryHeaderProps {
  title: string;
  count: number;
}

export function CategoryHeader({ title, count }: CategoryHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6 mt-2 first:mt-0">
      <Heading level="h3" className="md:text-3xl font-black uppercase tracking-tight whitespace-nowrap">
        {title}
      </Heading>
      <span className="text-xs font-bold text-sub bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-1 leading-none">
        {count}
      </span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}
