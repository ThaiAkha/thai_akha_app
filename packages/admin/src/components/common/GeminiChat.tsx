import React, { useState, useRef, useEffect } from 'react';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { Bot, Mic, MicOff, Send, X, MessageSquare, Loader2 } from 'lucide-react';

const GeminiChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, isLoading, error: chatError } = useGeminiChat();
    const {
        isActive: isLiveActive,
        isConnecting: isLiveConnecting,
        startSession,
        stopSession,
        error: liveError
    } = useGeminiLive();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleLive = () => {
        if (isLiveActive) {
            stopSession();
        } else {
            startSession();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out h-[500px]">

                    {/* Header */}
                    <div className="bg-primary p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Bot className="w-6 h-6" />
                            <h3 className="font-semibold">Cherry Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-meta-4/20">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 dark:text-gray-400 mt-10 text-sm">
                                <p>Sawasdee kha! How can I help you today?</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-white dark:bg-boxdark border border-stroke dark:border-strokedark text-black dark:text-white rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    {msg.isStreaming && (
                                        <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse" />
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Suggestions */}
                        {messages.length > 0 && messages[messages.length - 1].role === 'model' && messages[messages.length - 1].suggestions && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {messages[messages.length - 1].suggestions?.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(suggestion)}
                                        className="text-xs px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 rounded-full transition"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-boxdark p-3 rounded-lg rounded-bl-none border border-stroke dark:border-strokedark shadow-sm">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Error Display */}
                    {(chatError || liveError) && (
                        <div className="px-4 py-2 bg-error-100 dark:bg-error-900/20 text-error-600 dark:text-error-400 text-xs border-t border-error-200 dark:border-error-800">
                            {chatError || liveError}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-boxdark border-t border-stroke dark:border-strokedark">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleLive}
                                className={`p-2 rounded-full transition-colors ${isLiveActive
                                    ? 'bg-brand-500 text-white animate-pulse'
                                    : isLiveConnecting
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-gray-100 dark:bg-meta-4 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-opacity-80'
                                    }`}
                                title={isLiveActive ? "Stop Voice Chat" : "Start Voice Chat"}
                            >
                                {isLiveConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : isLiveActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isLiveActive ? "Listening..." : "Type a message..."}
                                disabled={isLiveActive || isLoading}
                                className="flex-1 bg-gray-50 dark:bg-meta-4 border border-stroke dark:border-strokedark rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary dark:focus:border-primary disabled:opacity-50"
                            />

                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading || isLiveActive}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${isOpen ? 'bg-gray-500 hover:bg-gray-600' : 'bg-primary hover:bg-opacity-90'
                    } text-white`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
        </div>
    );
};

export default GeminiChat;
