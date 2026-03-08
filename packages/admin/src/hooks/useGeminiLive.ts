
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SYSTEM_PROMPT } from '../prompts/cherrySystem';

export type SessionStatus = 'idle' | 'connecting' | 'active' | 'error';

interface SessionState {
    status: SessionStatus;
    error: string | null;
    inputTranscript: string;
    outputTranscript: string;
}

export const useGeminiLive = () => {
    const [state, setState] = useState<SessionState>({
        status: 'idle',
        error: null,
        inputTranscript: '',
        outputTranscript: '',
    });

    const audioCtxRef = useRef<AudioContext | null>(null);
    const inputAudioCtxRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const sessionPromiseRef = useRef<Promise<any> | null>(null);

    const encode = (bytes: Uint8Array): string => {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
        return btoa(binary);
    };

    const decode = (base64: string): Uint8Array => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
        return bytes;
    };

    const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> => {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length;
        const buffer = ctx.createBuffer(1, frameCount, sampleRate);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i] / 32768.0; }
        return buffer;
    };

    const stopSession = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                try { session.close(); } catch (e) { }
            });
            sessionPromiseRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => { });
            audioCtxRef.current = null;
        }
        if (inputAudioCtxRef.current) {
            inputAudioCtxRef.current.close().catch(() => { });
            inputAudioCtxRef.current = null;
        }
        sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setState(prev => ({ ...prev, status: 'idle', inputTranscript: '', outputTranscript: '' }));
    }, []);

    const sendTextMessage = (text: string) => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                session.sendRealtimeInput({
                    clientContent: {
                        turns: [{ role: 'user', parts: [{ text }] }],
                        turnComplete: true
                    }
                });
            }).catch((err) => {
                console.error("Failed to send realtime input:", err);
            });
        }
    };

    const startSession = async (overrideInstruction?: string, initialPrompt?: string) => {
        if (state.status !== 'idle') stopSession();
        setState(prev => ({ ...prev, status: 'connecting', error: null }));

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("API Key is missing from environment.");
            }

            const ai = new GoogleGenAI({ apiKey });
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);

            audioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
            inputAudioCtxRef.current = new AudioContextClass({ sampleRate: 16000 });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.0-flash-exp', // Updated model
                callbacks: {
                    onopen: () => {
                        setState(prev => ({ ...prev, status: 'active' }));
                        const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
                        const processor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);

                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) { int16[i] = inputData[i] * 32768; }

                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({
                                    media: {
                                        data: encode(new Uint8Array(int16.buffer)),
                                        mimeType: 'audio/pcm;rate=16000',
                                    }
                                });
                            });
                        };

                        source.connect(processor);
                        processor.connect(inputAudioCtxRef.current!.destination);
                        if (initialPrompt) sendTextMessage(initialPrompt);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setState(prev => ({ ...prev, inputTranscript: prev.inputTranscript + message.serverContent!.inputTranscription!.text }));
                        }
                        if (message.serverContent?.outputTranscription) {
                            setState(prev => ({ ...prev, outputTranscript: prev.outputTranscript + message.serverContent!.outputTranscription!.text }));
                        }
                        if (message.serverContent?.turnComplete) {
                            setState(prev => ({ ...prev, inputTranscript: '', outputTranscript: '' }));
                        }

                        const base64Audio = (message.serverContent?.modelTurn?.parts?.[0] as any)?.inlineData?.data;
                        if (base64Audio && audioCtxRef.current) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtxRef.current, 24000);
                            const sourceNode = audioCtxRef.current.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(audioCtxRef.current.destination);
                            sourceNode.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;

                            sourcesRef.current.add(sourceNode);
                            sourceNode.onended = () => sourcesRef.current.delete(sourceNode);
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e) => {
                        console.error("Live API Error:", e);
                        setState(prev => ({ ...prev, status: 'error', error: 'Connection failed kha. Check your network.' }));
                        stopSession();
                    },
                    onclose: () => {
                        console.log("Live API Closed");
                        stopSession();
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: overrideInstruction || SYSTEM_PROMPT,
                    outputAudioTranscription: {}, // Request input/output transcriptions
                    inputAudioTranscription: {},
                }
            });

            sessionPromiseRef.current = sessionPromise;

        } catch (err: any) {
            console.error("Failed to start session:", err);
            setState(prev => ({ ...prev, status: 'error', error: err.message || 'Microphone permission denied kha.' }));
            stopSession();
        }
    };

    useEffect(() => () => stopSession(), [stopSession]);

    return {
        isActive: state.status === 'active',
        isConnecting: state.status === 'connecting',
        status: state.status,
        error: state.error,
        inputTranscript: state.inputTranscript,
        outputTranscript: state.outputTranscript,
        startSession,
        stopSession,
        sendTextMessage
    };
};
