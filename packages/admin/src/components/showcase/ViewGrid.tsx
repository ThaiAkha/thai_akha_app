import React from 'react';
import { ComponentConfig } from '../../config/componentsConfig';

interface ViewGridProps {
    components: ComponentConfig[];
}

const ViewGrid: React.FC<ViewGridProps> = ({ components }) => {
    return (
        <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {components.map((config) => (
                    <div
                        key={config.name}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-4 hover:border-brand-500 transition-colors"
                    >
                        <h4 className="text-xs font-bold text-gray-500 uppercase">{config.name}</h4>
                        <div className="scale-75 origin-center pointer-events-none">
                            <config.component {...config.demoProps} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewGrid;
