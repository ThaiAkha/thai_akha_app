import React from 'react';
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
                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all hover:-translate-y-1"
                >
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-8 flex items-center justify-center border-b border-gray-100 dark:border-gray-800 h-48 group-hover:bg-brand-50/30 dark:group-hover:bg-brand-900/10 transition-colors">
                        {/* Static Preview with Default Props */}
                        <div className="pointer-events-none scale-90 group-hover:scale-100 transition-transform">
                            <config.component {...config.demoProps} />
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">{config.name}</h3>
                            <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                {config.props.length} Props
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[40px]">
                            {config.description || 'No description available for this component.'}
                        </p>
                    </div>
                </div>
            ))}
            {components.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                    <Layers className="w-12 h-12 mb-4 opacity-50" />
                    <p>No components found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default ViewCatalog;
