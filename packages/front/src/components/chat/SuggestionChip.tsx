
import React from 'react';

interface SuggestionChipProps {
    text: string;
    onClick: () => void;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({ text, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="px-3 py-1.5 text-sm text-white/90 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-200"
        >
            {text}
        </button>
    );
};

export default SuggestionChip;
