import React, { useState, useEffect } from 'react';
import { ComponentConfig } from '../../config/componentsConfig';
import { generateDefaultProps } from '../../utils/showcaseUtils';
import PropControl from './PropControl';
import { RefreshCw, Code, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ViewPlaygroundProps {
    component: ComponentConfig;
}

const ViewPlayground: React.FC<ViewPlaygroundProps> = ({ component }) => {
    const [props, setProps] = useState<any>({});
    const [copied, setCopied] = useState(false);
    const [showCode, setShowCode] = useState(true);

    // Reset props when component changes
    useEffect(() => {
        setProps(generateDefaultProps(component));
    }, [component]);

    const handlePropChange = (name: string, value: any) => {
        setProps((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCopyCode = () => {
        const code = generateJSX(component.name, props);
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const generateJSX = (name: string, p: any) => {
        const propsStr = Object.entries(p)
            .filter(([key, value]) => value !== undefined && value !== false && key !== 'children')
            .map(([key, value]) => {
                if (value === true) return key;
                if (typeof value === 'string') return `${key}="${value}"`;
                if (typeof value === 'number') return `${key}={${value}}`;
                if (typeof value === 'object') return `${key}={...}`; // Simplify objects
                return '';
            })
            .filter(Boolean)
            .join(' ');

        const children = p.children;
        if (children) {
            return `<${name} ${propsStr}>\n  ${children}\n</${name}>`;
        }
        return `<${name} ${propsStr} />`;
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)]">
            {/* Preview Area (Left / Top) */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 flex flex-col border-r border-gray-200 dark:border-gray-800 relative">
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    <button
                        onClick={() => setProps(generateDefaultProps(component))}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-105"
                        title="Reset Props"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowCode(!showCode)}
                        className={cn("p-2 rounded-lg shadow-sm border transition-all hover:scale-105", showCode ? "bg-brand-50 text-brand-600 border-brand-200" : "bg-white text-gray-500 border-gray-200")}
                        title="Toggle Code"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                    <div className="scale-100 transition-all duration-300">
                        <component.component {...props} />
                    </div>
                </div>

                {/* Code Preview Pane */}
                {showCode && (
                    <div className="h-32 bg-gray-900 border-t border-gray-800 flex flex-col shrink-0 transition-all">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
                            <span className="text-xs font-mono text-gray-400">Target JSX</span>
                            <button onClick={handleCopyCode} className="text-gray-400 hover:text-white flex items-center gap-1.5 text-xs transition-colors">
                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                {copied ? <span className="text-green-500">Copied!</span> : 'Copy'}
                            </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-blue-300 overflow-auto custom-scrollbar">
                            {generateJSX(component.name, props)}
                        </pre>
                    </div>
                )}
            </div>

            {/* Controls Area (Right / Bottom) */}
            <div className="w-full lg:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar shadow-xl z-20">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{component.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{component.description}</p>
                </div>

                <div className="p-6 space-y-6">
                    {component.props.map(prop => (
                        <div key={prop.name} className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider font-mono">{prop.name}</label>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 font-mono">{prop.type}</span>
                            </div>
                            <PropControl
                                prop={prop}
                                value={props[prop.name]}
                                onChange={(val) => handlePropChange(prop.name, val)}
                            />
                            {prop.description && <p className="text-[10px] text-gray-400">{prop.description}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ViewPlayground;
