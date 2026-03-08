import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import HeaderMenu from '../components/layout/HeaderMenu';
import { Typography, Card, Badge, Icon, Divider } from '../components/ui/index';
import AkhaPixelPattern from '../components/ui/AkhaPixelPattern';
import { AKHA_CULTURE_DB, Section } from '../data/akhaCulture';
import { cn } from '../lib/utils';

const HistoryPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const data = AKHA_CULTURE_DB.akha_culture_master_database;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // --- RENDERERS SPECIFICI PER TIPO DI DATI ---

  // 1. STATISTICHE (Popolazione/Origini)
  const renderStats = (stats: any) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {Object.entries(stats).map(([key, val]) => (
        <div key={key} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
          <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">
            {key.replace(/_/g, ' ')}
          </div>
          <div className="text-lg font-bold text-primary font-display leading-tight">
            {String(val)}
          </div>
        </div>
      ))}
    </div>
  );

  // 2. SIMBOLISMO (Abbigliamento)
  const renderSymbolism = (symbols: any) => (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(symbols).map(([key, val]) => (
        <div key={key} className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
          <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white">
            <Icon name={key === 'silver' ? 'diamond' : key === 'coins' ? 'monetization_on' : 'palette'} size="sm"/>
          </div>
          <div>
            <span className="text-xs font-black uppercase text-white tracking-widest block">{key}</span>
            <span className="text-sm text-white/70 italic">"{String(val)}"</span>
          </div>
        </div>
      ))}
    </div>
  );

  // 3. RICETTE (Lista Piatti)
  const renderRecipes = (recipes: any[]) => (
    <div className="mt-8 space-y-4">
      <Typography variant="h5" className="text-white flex items-center gap-2">
        <Icon name="restaurant_menu" className="text-action"/> Signature Variations
      </Typography>
      <div className="grid grid-cols-1 gap-4">
        {recipes.map((r, i) => (
          <div key={i} className="bg-white/5 border-l-4 border-action p-5 rounded-r-2xl">
            <div className="flex justify-between items-start">
                <h4 className="font-display font-bold text-white text-lg">{r.name}</h4>
                <Badge variant="mineral" className="text-[9px]">Var. {i+1}</Badge>
            </div>
            <p className="text-sm text-white/60 mt-1">{r.description}</p>
            <div className="mt-3 text-xs font-bold text-action flex items-center gap-2">
                <Icon name="tips_and_updates" size="xs"/> Chef's Secret: <span className="text-white/80 italic font-normal">"{r.chef_secret}"</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 4. TECH SPECS (Caffè)
  const renderTechSpecs = (specs: any) => (
    <div className="mt-6 bg-[#1a1a1a] border border-white/10 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 bg-primary/10 blur-3xl rounded-full pointer-events-none"/>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(specs).map(([key, val]) => (
                <div key={key}>
                    <span className="text-[9px] font-black uppercase text-white/30 tracking-widest block mb-1">{key}</span>
                    <span className="text-base font-bold text-white">{String(val)}</span>
                </div>
            ))}
        </div>
    </div>
  );

  // 5. SACRED FIGURES (Lista Ruoli)
  const renderSacredFigures = (figures: string[]) => (
      <div className="flex flex-wrap gap-2 mt-4">
          {figures.map((fig, i) => (
              <Badge key={i} variant="outline" className="border-white/20 text-white/80 bg-white/5 py-2 px-4">
                  {fig}
              </Badge>
          ))}
      </div>
  );

  // --- RENDER SEZIONE GENERICA ---
  const renderSection = (section: Section, index: number) => {
    const isEven = index % 2 === 0;
    
    return (
      <div key={section.id} className="scroll-mt-32 relative group" id={section.id}>
        {/* Timeline Connector */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2 group-last:bottom-auto group-last:h-full" />
        <div className="hidden lg:flex absolute left-1/2 top-10 -translate-x-1/2 size-4 rounded-full bg-[#0a0a0a] border-2 border-white/20 z-10 items-center justify-center">
            <div className={cn("size-1.5 rounded-full", section.featured ? "bg-action animate-pulse" : "bg-white/40")} />
        </div>

        <div className={cn("flex flex-col lg:flex-row gap-12 items-start", isEven ? "lg:flex-row-reverse" : "")}>
            
            {/* 1. TEXT CONTENT */}
            <div className="flex-1 w-full">
                <div className={cn("flex flex-col gap-4", isEven ? "lg:text-right lg:items-end" : "")}>
                    <Badge variant="mineral" className="w-fit text-primary border-primary/20 bg-primary/10">
                        {section.tag.replace(/_/g, ' ')}
                    </Badge>
                    
                    <div>
                        <Typography variant="h3" className="text-white uppercase font-black leading-none mb-2">
                            {section.title}
                        </Typography>
                        <Typography variant="h5" className="text-white/50 font-display italic">
                            {section.subtitle}
                        </Typography>
                    </div>

                    {/* RED HIGHLIGHT (Taboo) */}
                    {section.ui_highlight && (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold animate-pulse">
                            <Icon name="block" /> {section.ui_highlight}
                        </div>
                    )}

                    <Typography variant="paragraphM" className="text-desc/80 leading-relaxed font-light">
                        {section.content}
                    </Typography>

                    {/* DYNAMIC CONTENT BLOCKS */}
                    {section.key_stats && renderStats(section.key_stats)}
                    {section.sacred_figures && renderSacredFigures(section.sacred_figures)}
                    {section.tech_specs && renderTechSpecs(section.tech_specs)}
                    {section.quote && (
                        <blockquote className="border-l-2 border-white/20 pl-4 py-2 text-white/60 italic font-display text-lg">
                            "{section.quote}"
                        </blockquote>
                    )}
                </div>
            </div>

            {/* 2. RICH MEDIA CARD */}
            <div className="flex-1 w-full">
                <Card variant="glass" padding="none" className="overflow-hidden border-white/10 bg-[#121212] relative group/card">
                    {/* Visualizzazione Condizionale basata sui dati */}
                    <div className="p-8">
                        {section.recipes ? (
                            renderRecipes(section.recipes)
                        ) : section.symbolism ? (
                            renderSymbolism(section.symbolism)
                        ) : (
                            // Default Image Placeholder se non ci sono dati speciali
                            <div className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                <div className="text-center opacity-30">
                                    <Icon name="image" size="xl" className="mb-2"/>
                                    <p className="text-xs uppercase tracking-widest">Visual Content</p>
                                </div>
                            </div>
                        )}

                        {/* UI Quote Overlay */}
                        {section.ui_quote && (
                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                <Icon name="format_quote" className="text-action mb-2 opacity-50"/>
                                <p className="font-display font-black text-xl italic text-white leading-tight">
                                    "{section.ui_quote}"
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

        </div>
      </div>
    );
  };

  return (
    <PageLayout
      slug="history"
      loading={loading}
      hideDefaultHeader={true}
      showPatterns={true}
      customHeader={<HeaderMenu customSlug="history" />}
    >
      <div className="w-full max-w-6xl mx-auto px-6 pb-32 space-y-24">
        

        {/* SECTIONS RENDER LOOP */}
        <div className="space-y-32">
            {data.sections.map((section, index) => renderSection(section, index))}
        </div>

        {/* FOOTER SUMMARY */}
        <div className="border-t border-white/10 pt-16 text-center space-y-6">
            <Typography variant="h4" className="text-white italic">Core Themes</Typography>
            <div className="flex flex-wrap justify-center gap-3">
                {data.summary.key_themes.map((theme, i) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white/60">
                        {theme}
                    </span>
                ))}
            </div>
            <Typography variant="caption" className="block text-white/30 mt-8">
                Data Version: {data.metadata.version} • Author: {data.metadata.author}
            </Typography>
        </div>

      </div>
    </PageLayout>
  );
};

export default HistoryPage;