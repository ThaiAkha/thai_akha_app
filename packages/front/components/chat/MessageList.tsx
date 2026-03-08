
import React, { useRef, useEffect } from 'react';
import { ChatMessage as MessageType } from '../../types.ts';
import Message from './Message.tsx';
import LoadingIndicator from './LoadingIndicator.tsx';

interface MessageListProps {
    messages: MessageType[];
    isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const visibleMessages = messages.filter(msg => msg.role !== 'system');

    return (
        <div className="flex-grow overflow-y-auto p-4 space-y-6">
            {visibleMessages.map((msg) => (
                <Message key={msg.id} message={msg} />
            ))}
            {isLoading && visibleMessages[visibleMessages.length - 1]?.role === 'user' && (
                 <div className="flex items-start gap-3">
                    <img src="https://lh3.googleusercontent.com/a/ACg8ocJ_3fG3B4hW0_ds3Fp_bFzO8KjY9cQjJzQzQzQzQzQ=s96-c" alt="Cherry" className="w-8 h-8 rounded-full border-2 border-primary/50" />
                    <div className="bg-surface-dark/50 glass-effect rounded-2xl rounded-tl-none p-3 max-w-lg">
                        <LoadingIndicator />
                    </div>
                </div>
            )}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default MessageList;
