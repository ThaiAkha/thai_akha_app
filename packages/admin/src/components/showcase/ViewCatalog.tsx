import React from 'react';
import { Paragraph } from '../typography';
import { ComponentConfig } from '../../config/componentsConfig';
import { useNavigate } from 'react-router';
import { Layers } from 'lucide-react';

interface ViewCatalogProps {
    components: ComponentConfig[];
}

const ViewCatalog: React.FC<ViewCatalogProps> = ({ components }) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {components.map((config) => (
                <div
                    key={config.name}
                    onClick={() => navigate(`?mode=playground&component=${config.name}`)}
                    className="group bg-surface rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all hover:-translate-y-1"
                >
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-8 flex items-center justify-center border-b border-gray-100 dark:border-gray-800 h-48 group-hover:bg-primary-50/30 dark:group-hover:bg-primary-900/10 transition-colors">
                        {/* Static Preview with Default Props */}
                        <div className="pointer-events-none scale-90 group-hover:scale-100 transition-transform">
                            <config.component {...config.demoProps} />
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-title group-hover:text-primary-600 transition-colors">{config.name}</h3>
                            <span className="text-xs font-black uppercase text-sub bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                {config.props.length} Props
                            </span>
                        </div>
                        <Paragraph size="sm" color="secondary" className="line-clamp-2 min-h-[40px]">
                            {config.description || 'No description available for this component.'}
                        </Paragraph>
                    </div>
                </div>
            ))}
            {components.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-sub">
                    <Layers className="w-12 h-12 mb-4 opacity-50" />
                    <Paragraph>No components found matching your search.</Paragraph>
                </div>
            )}
        </div>
    );
};

export default ViewCatalog;
