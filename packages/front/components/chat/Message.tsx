
import React from 'react';
import { ChatMessage } from '../../types.ts';

interface MessageProps {
    message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

    if (message.role === 'system') return null;

    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <img src="https://lh3.googleusercontent.com/a/ACg8ocJ_3fG3B4hW0_ds3Fp_bFzO8KjY9cQjJzQzQzQzQzQ=s96-c" alt="Cherry" className="w-8 h-8 rounded-full border-2 border-primary/50 flex-shrink-0" />
            )}
            <div
                className={`p-3 rounded-2xl max-w-lg text-white ${
                    isUser
                        ? 'bg-primary/80 rounded-br-none'
                        : 'bg-surface-dark/50 glass-effect rounded-tl-none'
                }`}
            >
                <p className="text-base whitespace-pre-wrap">{message.text}</p>
            </div>
             {isUser && (
                <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-white/70 flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">person</span>
                </div>
            )}
        </div>
    );
};

export default Message;
