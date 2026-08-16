/**
 * 📖 MANUALS — role-aware in-app wiki ("how to use the app").
 * Content is DB-driven (table `app_manuals`): sections where role IS NULL (all)
 * or role = the current user's role. Plain-text body (line breaks preserved).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { getIcon } from '@thaiakha/shared/lib/icons';
import { cn } from '@thaiakha/shared/lib/utils';
import { useAuth } from '../../context/AuthContext';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import PageContainer from '../../components/layout/PageContainer';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import { Heading, Paragraph, SectionTitle } from '../../components/typography';

interface ManualSection {
    id: string;
    role: string | null;
    slug: string;
    section_order: number;
    icon: string | null;
    title: string;
    body: string;
}

const ManualsPage: React.FC = () => {
    const { t, i18n } = useTranslation('common');
    const { user } = useAuth();
    const { pageMeta } = usePageMetadata('manuals');
    const [sections, setSections] = useState<ManualSection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const lang = (i18n.language || 'en').split('-')[0];
        const fetchFor = (l: string) => supabase
            .from('app_manuals')
            .select('*')
            .eq('is_active', true)
            .eq('lang', l)
            .or(`role.is.null,role.eq.${user?.role ?? 'none'}`)
            .order('section_order', { ascending: true });

        const load = async () => {
            setLoading(true);
            const { data, error } = await fetchFor(lang);
            if (error) console.error('Failed to load manuals:', error);
            // Fall back to English when this role has no content in the selected language.
            let rows = (data as unknown as ManualSection[]) || [];
            if (rows.length === 0 && lang !== 'en') {
                const fb = await fetchFor('en');
                rows = (fb.data as unknown as ManualSection[]) || [];
            }
            setSections(rows);
            setLoading(false);
        };
        load();
    }, [user?.role, i18n.language]);

    const scrollTo = (slug: string) => {
        document.getElementById(`manual-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const hasContent = useMemo(() => sections.length > 0, [sections]);

    return (
        <PageContainer variant="wide">
            <div>
                {pageMeta && (
                    <WelcomeHero
                        badge={pageMeta.badge}
                        titleMain={pageMeta.titleMain}
                        titleHighlight={pageMeta.titleHighlight}
                        description={pageMeta.description}
                        imageUrl={pageMeta.imageUrl}
                        icon={pageMeta.icon}
                    />
                )}

                {loading ? (
                    <div className="py-24 text-center"><SectionTitle className="text-gray-400">{t('manuals.loading', { defaultValue: 'Loading…' })}</SectionTitle></div>
                ) : !hasContent ? (
                    <div className="py-24 text-center"><SectionTitle className="text-gray-400">{t('manuals.empty', { defaultValue: 'No guides yet.' })}</SectionTitle></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
                        {/* TOC */}
                        <aside className="lg:col-span-3 min-w-0">
                            <div className="lg:sticky lg:top-24">
                                <SectionTitle className="text-gray-400 mb-3">{t('manuals.contents', { defaultValue: 'Contents' })}</SectionTitle>
                                <nav className="flex flex-col gap-1">
                                    {sections.map(s => {
                                        const Icon = getIcon(s.icon || 'BookOpen');
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => scrollTo(s.slug)}
                                                className="group inline-flex items-center gap-2 text-left px-3 h-10 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                                            >
                                                <Icon className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-primary-500" />
                                                <span className="truncate">{s.title}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </aside>

                        {/* SECTIONS */}
                        <div className="lg:col-span-9 min-w-0 space-y-6">
                            {sections.map(s => {
                                const Icon = getIcon(s.icon || 'BookOpen');
                                return (
                                    <article
                                        key={s.id}
                                        id={`manual-${s.slug}`}
                                        className={cn(
                                            'scroll-mt-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 md:p-8'
                                        )}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="size-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <Heading level="h4">{s.title}</Heading>
                                        </div>
                                        <Paragraph size="base" color="secondary" className="whitespace-pre-line">
                                            {s.body}
                                        </Paragraph>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default ManualsPage;
