import { ComponentType } from 'react';
import Button from '../components/ui/button/Button';
import InputField from '../components/form/input/InputField';
import Badge from '../components/ui/badge/Badge';
import StatCard from '../components/ui/StatCard';

export type PropType = 'string' | 'number' | 'boolean' | 'select' | 'color' | 'icon' | 'json';

export interface ComponentProp {
    name: string;
    type: PropType;
    defaultValue?: any;
    options?: string[]; // For 'select' type
    description?: string;
}

export interface ComponentConfig {
    name: string;
    component: ComponentType<any>;
    description?: string;
    props: ComponentProp[];
    demoProps?: any; // Default props for the demo
}

export interface ComponentCategory {
    name: string;
    components: ComponentConfig[];
}

export const componentCategories: ComponentCategory[] = [
    {
        name: 'UI Elements',
        components: [
            {
                name: 'Button',
                component: Button,
                description: 'Interactive button component with multiple variants and sizes.',
                props: [
                    { name: 'children', type: 'string', defaultValue: 'Click Me' },
                    { name: 'variant', type: 'select', options: ['primary', 'outline', 'olive'], defaultValue: 'primary' },
                    { name: 'size', type: 'select', options: ['sm', 'md', 'icon'], defaultValue: 'md' },
                    { name: 'disabled', type: 'boolean', defaultValue: false },
                    { name: 'isLoading', type: 'boolean', defaultValue: false },
                ],
                demoProps: { children: 'Button' }
            },
            {
                name: 'Badge',
                component: Badge,
                description: 'Small status indicator or label.',
                props: [
                    { name: 'children', type: 'string', defaultValue: 'Badge' },
                    { name: 'variant', type: 'select', options: ['light', 'solid'], defaultValue: 'light' },
                    { name: 'color', type: 'select', options: ['primary', 'success', 'warning', 'error', 'info', 'light', 'dark'], defaultValue: 'primary' },
                    { name: 'size', type: 'select', options: ['sm', 'md'], defaultValue: 'md' },
                ],
                demoProps: { children: 'New', variant: 'light', color: 'success' }
            },
            {
                name: 'StatCard',
                component: StatCard,
                description: 'Card to display specific statistic with icon and trend.',
                props: [
                    { name: 'title', type: 'string', defaultValue: 'Total Revenue' },
                    { name: 'value', type: 'string', defaultValue: '$45,231' },
                    { name: 'trend', type: 'string', defaultValue: '+20.1%' },
                    { name: 'trendUp', type: 'boolean', defaultValue: true },
                    { name: 'icon', type: 'icon', defaultValue: 'User' },
                    { name: 'color', type: 'select', options: ['brand', 'blue', 'green', 'orange', 'red'], defaultValue: 'brand' },

                ],
                demoProps: {
                    title: 'Active Users',
                    value: '1,234',
                    icon: 'User',
                    color: 'primary'
                }
            }
        ]
    },
    {
        name: 'Forms',
        components: [
            {
                name: 'InputField',
                component: InputField,
                description: 'Standard input field with optional icons and validation states.',
                props: [
                    { name: 'label', type: 'string', defaultValue: 'Email Address' },
                    { name: 'placeholder', type: 'string', defaultValue: 'Enter your email' },
                    { name: 'type', type: 'select', options: ['text', 'email', 'password', 'number', 'date'], defaultValue: 'text' },
                    { name: 'error', type: 'boolean', defaultValue: false },
                    { name: 'success', type: 'boolean', defaultValue: false },
                    { name: 'disabled', type: 'boolean', defaultValue: false },
                    { name: 'hint', type: 'string', defaultValue: 'We will never share your email.' },
                ],
                demoProps: { label: 'Username', placeholder: 'jdoe' }
            }
        ]
    }
];

// Helper to get all components flat
export const getAllComponents = () => {
    return componentCategories.flatMap(c => c.components);
};
