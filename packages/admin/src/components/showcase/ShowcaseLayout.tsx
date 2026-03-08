import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { ComponentCategory } from '../../config/componentsConfig';
import { LayoutGrid, Grid, Play, Search, Sun, Moon, Maximize } from 'lucide-react';

interface ShowcaseLayoutProps {
    categories: ComponentCategory[];
    activeCategory: string | null;
    onSelectCategory: (category: string | null) => void;
    activeComponent: string | null;
    currentMode: 'catalog' | 'playground' | 'grid';
    onModeChange: (mode: 'catalog' | 'playground' | 'grid') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    children: React.ReactNode;
}

const ShowcaseLayout: React.FC<ShowcaseLayoutProps> = ({
    categories,
    activeCategory,
    onSelectCategory,
    activeComponent,
    currentMode,
    onModeChange,
    searchQuery,
    onSearchChange,
    children
}) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const handleFullscreen = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('fullscreen', 'true');
        window.open(url.toString(), '_blank');
    };

    return (
        <div className={cn("min-h-screen flex bg-gray-50 dark:bg-gray-900", isDark ? 'dark' : '')}>
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        UI <span className="text-brand-500">Showcase</span>
                    </h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Component Library</p>
                </div>

                <div className="p-4">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search components..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>

                    <nav className="space-y-6">
                        <button
                            onClick={() => onSelectCategory(null)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeCategory === null
                                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                            )}
                        >
                            All Components
                        </button>

                        {categories.map(cat => (
                            <div key={cat.name}>
                                <h3 className="px-3 text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">{cat.name}</h3>
                                <div className="space-y-1">
                                    {cat.components.map(comp => (
                                        <button
                                            key={comp.name}
                                            onClick={() => {
                                                if (currentMode !== 'playground') onModeChange('playground');
                                                // We rely on parent to handle navigation/selection via URL usually, but for now just callback
                                                // Actually, if we are in playground, clicking sidebar should switch component
                                                // If in catalog, clicking sidebar should switch mode to playground for that component
                                                onSelectCategory(cat.name); // Optional: filter by this cat
                                                window.location.hash = `#${comp.name}`; // Simple link
                                            }}
                                            className={cn(
                                                "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between group",
                                                activeComponent === comp.name
                                                    ? "text-brand-600 font-bold bg-brand-50 dark:bg-brand-900/10"
                                                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                            )}
                                        >
                                            {comp.name}
                                            {activeComponent === comp.name && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header Toolbar */}
                <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-20">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                        <button
                            onClick={() => onModeChange('catalog')}
                            className={cn(
                                "p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold uppercase",
                                currentMode === 'catalog'
                                    ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" /> Catalog
                        </button>
                        <button
                            onClick={() => onModeChange('playground')}
                            className={cn(
                                "p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold uppercase",
                                currentMode === 'playground'
                                    ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            <Play className="w-4 h-4" /> Playground
                        </button>
                        <button
                            onClick={() => onModeChange('grid')}
                            className={cn(
                                "p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold uppercase",
                                currentMode === 'grid'
                                    ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            <Grid className="w-4 h-4" /> Grid
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:block px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded-full text-[10px] font-bold text-gray-500 uppercase">
                            {categories.reduce((acc, cat) => acc + cat.components.length, 0)} Components
                        </div>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />
                        <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button onClick={handleFullscreen} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors" title="Open Fullscreen">
                            <Maximize className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default ShowcaseLayout;
