
import React from 'react';
import MicButton from './MicButton.tsx';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
    isListening: boolean;
    handleMicClick: () => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, handleSend, isListening, handleMicClick, isLoading }) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="flex items-center [gap:var(--space-fluid-xs)] [padding:var(--space-fluid-2xs)] rounded-full bg-surface-2 border border-border mt-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? 'Listening...' : 'Ask Cherry anything...'}
                className="flex-grow bg-transparent text-title placeholder-muted focus:outline-none px-4 [font-size:var(--text-fluid-body)]"
                disabled={isLoading}
            />
            <MicButton isListening={isListening} onClick={handleMicClick} />
            <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-primary rounded-full text-white disabled:bg-primary/50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-110"
                aria-label="Send message"
            >
                <span className="material-symbols-outlined">send</span>
            </button>
        </div>
    );
};

export default ChatInput;
