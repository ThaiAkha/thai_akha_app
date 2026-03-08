import React from 'react';
import { ComponentProp } from '../../config/componentsConfig';
import Switch from '../form/switch/Switch'; // Using local Switch
import InputField from '../form/input/InputField';

interface PropControlProps {
    prop: ComponentProp;
    value: any;
    onChange: (value: any) => void;
}

const PropControl: React.FC<PropControlProps> = ({ prop, value, onChange }) => {

    switch (prop.type) {
        case 'boolean':
            return (
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{prop.name}</span>
                    </div>
                    <Switch
                        key={String(value)} // Force re-render when external value changes
                        label=""
                        defaultChecked={value || false}
                        onChange={onChange}
                    />
                </div>
            );

        case 'select':
            return (
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{prop.name}</label>
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
                    >
                        {prop.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );

        case 'string':
        case 'number':
        default:
            return (
                <InputField
                    label={prop.name}
                    value={value}
                    onChange={(e) => onChange(prop.type === 'number' ? Number(e.target.value) : e.target.value)}
                    type={prop.type === 'number' ? 'number' : 'text'}
                />
            );
    }
};

export default PropControl;
