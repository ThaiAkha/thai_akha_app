import { ComponentConfig } from '../config/componentsConfig';

/** Props del componente in showcase: bag dinamica name → valore (config.props). */
export type ShowcaseProps = Record<string, unknown>;

// Generate default props for a component 
export const generateDefaultProps = (config: ComponentConfig): ShowcaseProps => {
    const props: ShowcaseProps = { ...config.demoProps };

    config.props.forEach(prop => {
        if (props[prop.name] === undefined && prop.defaultValue !== undefined) {
            props[prop.name] = prop.defaultValue;
        }
    });

    return props;
};


// Generate JSX string code based on current props
export const generateCodeSnippet = (componentName: string, props: ShowcaseProps): string => {
    const propsString = Object.entries(props)
        .filter(([_key, value]) => value !== undefined && value !== null && value !== false)
        .map(([key, value]) => {
            if (value === true) return key;
            if (typeof value === 'string') return `${key}="${value}"`;
            if (typeof value === 'number') return `${key}={${value}}`;
            return `${key}={...}`;
        })
        .join(' ');

    return `<${componentName} ${propsString} />`;
};
