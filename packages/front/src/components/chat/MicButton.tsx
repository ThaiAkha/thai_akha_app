
import React from 'react';

interface MicButtonProps {
    isListening: boolean;
    onClick: () => void;
}

const MicButton: React.FC<MicButtonProps> = ({ isListening, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
                isListening
                    ? 'bg-sys-error/80 text-white animate-mic-listening shadow-glow-cherry'
                    : 'bg-surface-3 text-muted hover:bg-surface/50'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
            <span className="material-symbols-outlined">
                {isListening ? 'mic_off' : 'mic'}
            </span>
        </button>
    );
};

export default MicButton;
