import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { componentCategories, getAllComponents } from '../../config/componentsConfig';
import ShowcaseLayout from '../../components/showcase/ShowcaseLayout';
import ViewCatalog from '../../components/showcase/ViewCatalog';
import ViewPlayground from '../../components/showcase/ViewPlayground';
import ViewGrid from '../../components/showcase/ViewGrid';
import ShowcaseErrorBoundary from '../../components/showcase/ShowcaseErrorBoundary';

const ComponentShowcase: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // URL State
    const mode = (searchParams.get('mode') as 'catalog' | 'playground' | 'grid') || 'catalog';
    const componentName = searchParams.get('component');
    const searchTerm = searchParams.get('search') || '';

    // Local State (synced with URL)
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Filter Logic
    const filteredComponents = useMemo(() => {
        let all = getAllComponents();

        if (searchTerm) {
            all = all.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (activeCategory) {
            const cat = componentCategories.find(c => c.name === activeCategory);
            if (cat) {
                all = all.filter(c => cat.components.some(cc => cc.name === c.name));
            }
        }

        return all;
    }, [searchTerm, activeCategory]);

    // Handle Mode Change
    const handleModeChange = (newMode: 'catalog' | 'playground' | 'grid') => {
        setSearchParams(prev => {
            prev.set('mode', newMode);
            return prev;
        });
    };

    // Handle Search
    const handleSearch = (query: string) => {
        setSearchParams(prev => {
            if (query) prev.set('search', query);
            else prev.delete('search');
            return prev;
        });
    };

    // Derived Active Component
    const activeComponentConfig = useMemo(() => {
        if (!componentName) return null;
        return getAllComponents().find(c => c.name === componentName);
    }, [componentName]);

    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            setSearchParams(prev => {
                prev.set('component', hash);
                prev.set('mode', 'playground');
                return prev;
            });
        }
    }, [window.location.hash]);


    return (
        <ShowcaseLayout
            categories={componentCategories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            activeComponent={componentName}
            currentMode={mode}
            onModeChange={handleModeChange}
            searchQuery={searchTerm}
            onSearchChange={handleSearch}
        >
            <ShowcaseErrorBoundary>
                {mode === 'catalog' && (
                    <ViewCatalog components={filteredComponents} />
                )}

                {mode === 'playground' && (
                    activeComponentConfig
                        ? <ViewPlayground component={activeComponentConfig} />
                        : <div className="p-10 text-center text-gray-400">Select a component to view playground.</div>
                )}

                {mode === 'grid' && (
                    <ViewGrid components={filteredComponents} />
                )}
            </ShowcaseErrorBoundary>
        </ShowcaseLayout>
    );
};

export default ComponentShowcase;
