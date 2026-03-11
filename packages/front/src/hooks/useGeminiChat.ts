
import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { SYSTEM_PROMPT } from '../prompts/cherrySystem.ts';
import { ChatMessage } from '../types.ts';

export const useGeminiChat = (initialMessage?: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const chatInitialized = useRef(false);

    useEffect(() => {
        if (chatInitialized.current) return;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const initialSystemMessage: ChatMessage = {
            id: 'system-init',
            role: 'system',
            text: 'System Initialized.',
            suggestions: ["Info Classes", "Menu & Diet", "Pickup Info", "Play Quiz"]
        };

        chatRef.current = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: { 
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.5 
            },
        });

        const greetingMessage: ChatMessage = {
            id: 'greeting-0',
            role: 'model',
            text: "Sawasdee kha! I'm Cherry from Thai Akha Kitchen. How can I help you? kha",
            suggestions: ["Info Classes", "Menu & Diet", "Pickup Info", "Play Quiz"]
        };

        setMessages([initialSystemMessage, greetingMessage]);
        chatInitialized.current = true;
    }, []);

    useEffect(() => {
        if (initialMessage && chatInitialized.current && messages.length === 2) {
            sendMessage(initialMessage);
        }
    }, [initialMessage]);

    const sendMessage = async (userMessage: string) => {
        if (!chatRef.current) return;
        
        setIsLoading(true);
        setError(null);

        const userMsgId = `user-${Date.now()}`;
        const modelMsgId = `model-${Date.now()}`;

        setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: userMessage }, { id: modelMsgId, role: 'model', text: '', isStreaming: true }]);

        try {
            const streamResponse = await chatRef.current.sendMessageStream({ message: userMessage });
            let fullResponse = '';
            
            for await (const chunk of streamResponse) {
                const chunkResponse = chunk as GenerateContentResponse;
                const text = chunkResponse.text;
                if (text) {
                    fullResponse += text;
                    setMessages(prev => prev.map(msg =>
                        msg.id === modelMsgId ? { ...msg, text: fullResponse } : msg
                    ));
                }
            }

            let suggestions: string[] = [];
            const suggestionMatch = fullResponse.match(/\{\{SUGGESTIONS:\s*(.*?)\}\}/);
            let finalText = fullResponse;

            if (suggestionMatch) {
                suggestions = suggestionMatch[1].split('|').map(s => s.trim());
                finalText = fullResponse.replace(/\{\{SUGGESTIONS:.*?\}\}/g, '').trim();
            }

            setMessages(prev => prev.map(msg =>
                msg.id === modelMsgId ? { 
                    ...msg, 
                    text: finalText, 
                    suggestions, 
                    isStreaming: false 
                } : msg
            ));

        } catch (err: any) {
            console.error("Gemini Chat Error:", err);
            setError("I am sorry, I had a little trouble responding. Please try again. kha");
            setMessages(prev => prev.filter(msg => msg.id !== modelMsgId));
        } finally {
            setIsLoading(false);
        }
    };

    return { messages, sendMessage, isLoading, error };
};
