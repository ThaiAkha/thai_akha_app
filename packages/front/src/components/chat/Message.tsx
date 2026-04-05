import React from 'react';
import { ChatMessage } from '@thaiakha/shared';
import { Typography } from '../ui/Typography';
interface MessageProps {
    message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

    if (message.role === 'system') return null;

    return (
        <div className={`flex items-start [gap:var(--space-fluid-xs)] ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <img src="https://lh3.googleusercontent.com/a/ACg8ocJ_3fG3B4hW0_ds3Fp_bFzO8KjY9cQjJzQzQzQzQzQ=s96-c" alt="Cherry" className="w-8 h-8 rounded-full border-2 border-primary/50 flex-shrink-0" />
            )}
            <div
                className={`[padding:var(--space-fluid-xs)] rounded-2xl max-w-[85%] ${
                    isUser
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-surface-2 border border-border text-title rounded-tl-none'
                }`}
            >
                <Typography variant="body" color={isUser ? 'inverse' : 'title'} className="whitespace-pre-wrap">
                    {message.text}
                </Typography>
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
