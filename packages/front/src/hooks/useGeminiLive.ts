
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { orchestrator } from '@thaiakha/shared/prompts';
import { getVoiceConfig } from '@thaiakha/shared/config/voice.config';
import { saveMessage } from '@thaiakha/shared/services';

export type SessionStatus = 'idle' | 'connecting' | 'active' | 'error';

interface SessionState {
    status: SessionStatus;
    error: string | null;
    inputTranscript: string;
    outputTranscript: string;
}

export const useGeminiLive = (
  userProfile?: any,
  appContext: 'front' | 'admin' = 'front',
  sessionId?: string | null
) => {
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
    const sessionRef = useRef<any | null>(null); // resolved session for sync access
    const processorRef = useRef<AudioWorkletNode | null>(null);
    const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

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
        // Disconnect mic pipeline first to stop sending audio
        if (processorRef.current) {
            try { processorRef.current.disconnect(); } catch(e) {}
            processorRef.current = null;
        }
        if (micSourceRef.current) {
            try { micSourceRef.current.disconnect(); } catch(e) {}
            micSourceRef.current = null;
        }

        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch(e) {}
            sessionRef.current = null;
        }
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                try { session.close(); } catch(e) {}
            });
            sessionPromiseRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }
        if (inputAudioCtxRef.current) {
            inputAudioCtxRef.current.close().catch(() => {});
            inputAudioCtxRef.current = null;
        }
        sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
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
            console.log("DEBUG: Voice Mode API Key Check:", {
                exists: !!apiKey,
                length: apiKey?.length,
                prefix: apiKey?.substring(0, 5),
                suffix: apiKey?.substring(apiKey.length - 5)
            });
            if (!apiKey) {
                throw new Error("API Key is missing from environment.");
            }

            const ai = new GoogleGenAI({ apiKey });
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            
            audioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
            inputAudioCtxRef.current = new AudioContextClass({ sampleRate: 16000 });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const voiceConfig = getVoiceConfig(userProfile, appContext);
            const activeAgent = orchestrator.getAgent(appContext, userProfile?.role);
            const resolvedSystemInstruction = overrideInstruction || orchestrator.buildPrompt(
              activeAgent,
              userProfile || {},
              userProfile?.dietary_profile || 'diet_regular',
              userProfile?.allergies || [],
              true,
              'front'
            );

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: async () => {
                        setState(prev => ({ ...prev, status: 'active' }));

                        // Resume AudioContexts — required by Chrome autoplay policy
                        inputAudioCtxRef.current?.resume();
                        audioCtxRef.current?.resume();

                        const inputCtx = inputAudioCtxRef.current!;
                        await inputCtx.audioWorklet.addModule('/audio-processor.js');
                        const source = inputCtx.createMediaStreamSource(stream);
                        const workletNode = new AudioWorkletNode(inputCtx, 'audio-processor');

                        micSourceRef.current = source;
                        processorRef.current = workletNode;

                        workletNode.port.onmessage = (event) => {
                            if (!sessionRef.current) return;
                            const float32Data = event.data as Float32Array;
                            const int16 = new Int16Array(float32Data.length);
                            for (let i = 0; i < float32Data.length; i++) { int16[i] = float32Data[i] * 32768; }
                            try {
                                sessionRef.current.sendRealtimeInput({
                                    media: {
                                        data: encode(new Uint8Array(int16.buffer)),
                                        mimeType: 'audio/pcm;rate=16000',
                                    }
                                });
                            } catch(e) { /* session may be closing */ }
                        };

                        source.connect(workletNode);
                        workletNode.connect(inputCtx.destination);

                        if (initialPrompt) {
                            setTimeout(() => sendTextMessage(initialPrompt), 500);
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setState(prev => ({ ...prev, inputTranscript: prev.inputTranscript + message.serverContent!.inputTranscription!.text }));
                        }
                        if (message.serverContent?.outputTranscription) {
                            setState(prev => ({ ...prev, outputTranscript: prev.outputTranscript + message.serverContent!.outputTranscription!.text }));
                        }
                        if (message.serverContent?.turnComplete) {
                            // Salva trascrizioni in Supabase se abbiamo una sessionId
                            if (sessionId) {
                                setState(prev => {
                                    if (prev.outputTranscript) {
                                        saveMessage(sessionId, 'assistant', prev.outputTranscript, 'voice');
                                    }
                                    if (prev.inputTranscript) {
                                        saveMessage(sessionId, 'user', prev.inputTranscript, 'voice');
                                    }
                                    return { ...prev, inputTranscript: '', outputTranscript: '' };
                                });
                            } else {
                                setState(prev => ({ ...prev, inputTranscript: '', outputTranscript: '' }));
                            }
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
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
                            sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
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
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: voiceConfig.voiceName }
                        }
                    },
                    systemInstruction: resolvedSystemInstruction,
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                }
            });

            sessionPromiseRef.current = sessionPromise;
            // Store resolved session for sync access in onaudioprocess (no .then() per chunk)
            sessionPromise.then(session => { sessionRef.current = session; }).catch(() => {});

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
