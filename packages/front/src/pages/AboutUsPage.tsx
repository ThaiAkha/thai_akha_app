import React from 'react';
import { t } from '../i18n';
import { PageLayout, InfoPageHero, PageEssentials, SmartHeaderSection, SiblingInfoSection } from '../components/layout';
import { InfoPageSidebar } from '../components/layout/sidebar-info';
import { Typography, Icon, Badge, FaqBottomPage, GlassCard } from '../components/ui';
import { AskCherryButton } from '../components/chat';
import { AkhaThemedLine } from '../components/blog';
import { SkeletonBase } from '../components/skeleton/atoms';
import { usePageSection, usePageSections } from '../hooks/usePageSections';
import { useAboutUsData, type TeamMember } from '../hooks/useAboutUsData';
import type { PageSectionData } from '../hooks/usePageSections';

interface AboutUsPageProps {
  onNavigate: (page: string) => void;
}

// Team (tabella authors) e story: dati e tipo TeamMember in hooks/useAboutUsData.

const roleSectionId = (group: string) => `about-role-${group}`;

// Gruppi noti (per prefetch header + variante card). L'ordine visivo però lo
// detta il DB (display_order): i gruppi si renderizzano in ordine di apparizione.
const KNOWN_GROUPS = ['founders', 'teacher', 'helper', 'setup', 'extra', 'drivers', 'cherry'];

// Header della story (page_sections) — il CORPO sta in info_page_sections (blocchi).
const STORY_SECTION_ID = 'about-story';
const ROLE_SECTION_IDS = [STORY_SECTION_ID, ...KNOWN_GROUPS.map(roleSectionId)];

const AboutUsPage: React.FC<AboutUsPageProps> = ({ onNavigate }) => {
  // Team attivo + corpo della story: due query in cache (CLAUDE.md #17)
  const { team, story, loading: pageLoading } = useAboutUsData();
  // Card Cherry finale: prompt/label dal nodo condiviso universal_cherry (come FAQ)
  const { section: cherrySection } = usePageSection('universal_cherry');
  // Header story + intestazioni gruppi (page_sections) - un'unica query, cache TanStack
  const { sections: roleSections, loading: sectionsLoading } = usePageSections(ROLE_SECTION_IDS);
  const loading = pageLoading || sectionsLoading;

  // Gruppi in ordine di apparizione (display_order DB) → sezioni pagina + TOC
  const groups = team.reduce<{ key: string; members: TeamMember[] }[]>((acc, m) => {
    const last = acc[acc.length - 1];
    if (last && last.key === m.staff_group) last.members.push(m);
    else acc.push({ key: m.staff_group, members: [m] });
    return acc;
  }, []);

  const groupLabel = (key: string) => {
    const s = roleSections[roleSectionId(key)];
    return s ? `${s.title} ${s.highlight ?? ''}`.trim() : key.charAt(0).toUpperCase() + key.slice(1);
  };
  const aboutToc = groups.map(g => ({ id: roleSectionId(g.key), label: groupLabel(g.key) }));

  return (
    <PageLayout slug="about-thai-akha-kitchen" showPatterns={false}>
      {/* SEO: driven entirely by SEOHead via site_metadata slug "about-thai-akha-kitchen".
          No PageSEO — avoids duplicate JSON-LD injection and canonical overwrite (fixes J01). */}

      <div className="flex flex-col [gap:inherit] w-full max-w-6xl mx-auto">

        {/* ── PAGE HERO ── */}
        <InfoPageHero
          slug="about-thai-akha-kitchen"
          fallbackIcon="groups"
          fallbackTitle="About"
          fallbackHighlight="Us"
          dividerTheme="block_faq"
          gradientFrom="ocean-blue"
          gradientTo="deep-ocean"
        />

        {/* ── OUR STORY — header da page_sections (about-story), corpo da
            info_page_sections (blocchi: note=corsivo, paragraph). Le heading
            delle righe info_page_sections sono etichette editoriali, non rese. */}
        {story && story.sections.length > 0 && (
          <section className="flex flex-col [gap:var(--space-fluid-s)] [--color-action:var(--color-ocean-blue)] [--color-primary:var(--color-deep-ocean)]">
            <SmartHeaderSection
              sectionId={STORY_SECTION_ID}
              prefetchedData={roleSections[STORY_SECTION_ID]}
              loading={loading}
              variant="section"
              align="left"
              gradientFrom="ocean-blue"
              gradientTo="deep-ocean"
              dividerTheme="block_faq"
            />
            {story.sections.map((s, i) => {
              const paragraphs = Array.isArray(s.content) ? s.content : s.content ? [s.content] : [];
              return (
                <div key={i} className="flex flex-col [gap:var(--space-fluid-s)]">
                  {s.notes?.map((note, ni) => (
                    <Typography key={ni} variant="paragraphM" color="sub" className="italic">
                      {note}
                    </Typography>
                  ))}
                  {paragraphs.map((paragraph, pi) => (
                    <Typography key={pi} variant="paragraphM" color="default">
                      {paragraph}
                    </Typography>
                  ))}
                </div>
              );
            })}
          </section>
        )}

        <AkhaThemedLine theme="block_faq" />

        {/* ── 2 colonne: sidebar info-page (TOC ocean) + team per ruolo ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,18rem)_1fr] [gap:var(--space-fluid-l)] items-start">
          <InfoPageSidebar
            currentSlug="about-thai-akha-kitchen"
            onNavigate={onNavigate}
            toc={aboutToc}
            numberedToc
            ctaCardId="sidebar-cta-classes"
            accent="ocean"
            className="hidden lg:flex lg:sticky lg:top-[var(--space-fluid-l)]"
          />

          <div className="min-w-0 flex flex-col [gap:var(--space-fluid-xl)] [--color-action:var(--color-ocean-blue)] [--color-primary:var(--color-deep-ocean)]">
            {loading ? (
              <div className="flex flex-col [gap:var(--space-fluid-m)]">
                {[1, 2, 3].map(i => <SkeletonBase key={i} className="w-full h-40 rounded-2xl" />)}
              </div>
            ) : (
              groups.map(group => (
                <section
                  key={group.key}
                  id={roleSectionId(group.key)}
                  className="flex flex-col [gap:var(--space-fluid-l)] scroll-mt-24"
                >
                  {/* Header ruolo — page_sections about-role-{group}: titolo, sottotitolo,
                      descrizione (responsabilità e operato, editabili da DB) */}
                  <SmartHeaderSection
                    sectionId={roleSectionId(group.key)}
                    prefetchedData={roleSections[roleSectionId(group.key)]}
                    loading={loading}
                    variant="section"
                    align="left"
                    gradientFrom="ocean-blue"
                    gradientTo="deep-ocean"
                    dividerTheme="block_faq"
                    fallbackTitle={groupLabel(group.key)}
                  />

                  {group.key === 'founders' ? (
                    /* Founders: card grande (foto, bio estesa, tag expertise) */
                    <div className="flex flex-col [gap:var(--space-fluid-l)]">
                      {group.members.map(member => <FounderCard key={member.id} member={member} />)}
                    </div>
                  ) : group.key === 'cherry' ? (
                    /* Cherry: card speciale mondo Cherry AI, in chiusura */
                    <div className="flex flex-col [gap:var(--space-fluid-l)]">
                      {group.members.map(member => (
                        <CherryTeamCard key={member.id} member={member} cherrySection={cherrySection} />
                      ))}
                    </div>
                  ) : (
                    /* Team: card compatta con foto reale */
                    <div className="grid grid-cols-1 sm:grid-cols-2 [gap:var(--space-fluid-m)]">
                      {group.members.map(member => <TeamCard key={member.id} member={member} />)}
                    </div>
                  )}
                </section>
              ))
            )}
          </div>{/* /content column */}
        </div>{/* /grid sidebar+content */}

        <PageEssentials slug="about-thai-akha-kitchen" accent="ocean" />

        <FaqBottomPage
          slug="about-thai-akha-kitchen"
          onNavigate={onNavigate}
        />

        {/* ── RELATED INFO ── */}
        <SiblingInfoSection
          currentSlug="about-thai-akha-kitchen"
          onNavigate={onNavigate}
          accent="ocean"
        />
      </div>
    </PageLayout>
  );
};

// ── Card variants per gruppo ───────────────────────────────────────────────────

/** Founders: card grande — foto grande, ruolo (authors.title), bio, tag. */
function FounderCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col sm:flex-row [gap:var(--space-fluid-m)] [padding:var(--space-fluid-m)] rounded-2xl bg-surface border border-border">
      <div className="shrink-0">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name}
            loading="lazy"
            decoding="async"
            className="w-[clamp(6rem,10vw,8rem)] h-[clamp(6rem,10vw,8rem)] rounded-2xl object-cover border border-border"
          />
        ) : (
          <div className="w-[clamp(6rem,10vw,8rem)] h-[clamp(6rem,10vw,8rem)] rounded-2xl bg-primary/10 flex items-center justify-center border border-border">
            <Icon name="person" className="text-primary" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col [gap:var(--space-fluid-xs)]">
        {/* as="h3": prima sotto-gerarchia sotto l'H2 di sezione (D04-safe) */}
        <Typography variant="h4" as="h3" color="title">
          {member.name}
        </Typography>
        {member.title && (
          <Typography variant="microLabel" color="muted" className="uppercase tracking-widest">
            {member.title}
          </Typography>
        )}
        {member.description && (
          <Typography variant="paragraphM" color="default">
            {member.description}
          </Typography>
        )}
        {member.expertise_tags && member.expertise_tags.length > 0 && (
          <div className="flex flex-wrap [gap:var(--space-fluid-2xs)] [margin-top:var(--space-fluid-xs)]">
            {member.expertise_tags.map(tag => (
              <Badge key={tag} variant="mineral" color="action" size="xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Team (teacher/helper/setup/extra/drivers): card compatta con foto reale. */
function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex [gap:var(--space-fluid-s)] [padding:var(--space-fluid-s)] rounded-xl bg-surface border border-border">
      {member.avatar_url ? (
        <img
          src={member.avatar_url}
          alt={member.name}
          loading="lazy"
          decoding="async"
          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border"
        />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-border">
          <Icon name="person" size="sm" className="text-muted" />
        </div>
      )}
      <div className="flex flex-col [gap:var(--space-fluid-2xs)] min-w-0">
        {/* as="h3": nome sotto l'header H2 del gruppo */}
        <Typography variant="h5" as="h3" color="title">{member.name}</Typography>
        {member.title && (
          <Typography variant="microLabel" color="muted" className="uppercase tracking-widest">
            {member.title}
          </Typography>
        )}
        {member.description && (
          <Typography variant="paragraphS" color="default">{member.description}</Typography>
        )}
      </div>
    </div>
  );
}

/** Cherry: card speciale del mondo Cherry AI (glass cherry + badge + Ask Cherry). */
function CherryTeamCard({ member, cherrySection }: { member: TeamMember; cherrySection: PageSectionData | null }) {
  return (
    <GlassCard
      variant="cherry"
      padding="l"
      radius="2rem"
      innerClassName="flex flex-col sm:flex-row items-center sm:items-start [gap:var(--space-fluid-m)]"
    >
      {member.avatar_url && (
        <img
          src={member.avatar_url}
          alt={member.name}
          loading="lazy"
          decoding="async"
          className="w-[clamp(6rem,10vw,8rem)] h-[clamp(6rem,10vw,8rem)] rounded-full object-cover shrink-0 ring-4 ring-cherry-ai/30 ring-offset-2"
        />
      )}
      <div className="flex-1 flex flex-col [gap:var(--space-fluid-xs)] text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start [gap:var(--space-fluid-xs)]">
          <Typography variant="h4" as="h3" color="title">{member.name}</Typography>
          {member.is_ai_agent && (
            <Badge variant="mineral" color="quiz-p" size="xs">
              {t('about:aiDigitalGuide')}
            </Badge>
          )}
        </div>
        {member.title && (
          <Typography variant="microLabel" color="muted" className="uppercase tracking-widest">
            {member.title}
          </Typography>
        )}
        {member.description && (
          <Typography variant="paragraphM" color="default">{member.description}</Typography>
        )}
        <div className="[margin-top:var(--space-fluid-s)] flex justify-center sm:justify-start">
          <AskCherryButton
            variant="inline"
            tone="cherry"
            label={cherrySection?.button_text}
            subtitle={cherrySection?.subtitle ?? undefined}
            topic={cherrySection?.cherry_prompt ?? undefined}
            data={{
              cherry_prompt: cherrySection?.cherry_prompt ?? undefined,
              cherry_response: cherrySection?.cherry_response ?? undefined,
            }}
          />
        </div>
      </div>
    </GlassCard>
  );
}

export default AboutUsPage;
