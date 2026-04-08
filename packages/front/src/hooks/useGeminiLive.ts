import { useState, useRef, useCallback, useEffect } from 'react';
import { getLiveGeminiClient } from '../services/geminiClient';
import { LiveServerMessage, Modality, Type } from '@google/genai';
import { buildCherryPrompt, cherryFront } from '../prompts/cherryPrompt';
import { saveMessage, checkRateLimit } from '@thaiakha/shared/services';

export type SessionStatus = 'idle' | 'connecting' | 'active' | 'error';

interface SessionState {
    status: SessionStatus;
    error: string | null;
    inputTranscript: string;
    outputTranscript: string;
}

export const useGeminiLive = (
  userProfile?: any,
  sessionId?: string | null,
  onTurnComplete?: (userText: string, assistantText: string) => void
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
    const isSessionActiveRef = useRef<boolean>(false); // guards sendRealtimeInput against CLOSING/CLOSED WebSocket
    const processorRef = useRef<AudioWorkletNode | null>(null);
    const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const inputTranscriptRef = useRef<string>(''); // accumulates user speech transcription
    const outputTranscriptRef = useRef<string>(''); // accumulates Cherry's response transcription
    const analyserRef = useRef<AnalyserNode | null>(null); // for waveform visualization

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
        // Mark session inactive immediately — prevents worklet onmessage from calling sendRealtimeInput
        isSessionActiveRef.current = false;

        // Disconnect mic pipeline first to stop sending audio
        if (processorRef.current) {
            processorRef.current.port.onmessage = null; // detach handler before disconnect
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
        if (analyserRef.current) {
            try { analyserRef.current.disconnect(); } catch(e) {}
            analyserRef.current = null;
        }
        if (inputAudioCtxRef.current) {
            inputAudioCtxRef.current.close().catch(() => {});
            inputAudioCtxRef.current = null;
        }
        sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        // Reset transcript refs
        inputTranscriptRef.current = '';
        outputTranscriptRef.current = '';

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

        // Rate limit check before connecting
        const rateLimit = await checkRateLimit(userProfile?.id, undefined);
        if (!rateLimit.allowed) {
            setState(prev => ({ ...prev, status: 'error', error: rateLimit.reason ?? 'Voice limit reached.' }));
            return;
        }

        setState(prev => ({ ...prev, status: 'connecting', error: null }));

        try {
            const ai = await getLiveGeminiClient();
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            
            audioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
            inputAudioCtxRef.current = new AudioContextClass({ sampleRate: 16000 });

            const stream = await navigator.mediaDevices.getUserMedia({
              audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });
            streamRef.current = stream;

            const resolvedSystemInstruction = overrideInstruction || buildCherryPrompt({
              isLogged: !!userProfile,
              name: userProfile?.full_name,
              dietary_profile: userProfile?.dietary_profile,
              allergies: userProfile?.allergies,
              preferred_spiciness: userProfile?.preferred_spiciness_id ? String(userProfile.preferred_spiciness_id) : undefined,
            });

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: async () => {
                        isSessionActiveRef.current = true;
                        setState(prev => ({ ...prev, status: 'active' }));

                        // Resume AudioContexts — required by Chrome autoplay policy
                        inputAudioCtxRef.current?.resume();
                        audioCtxRef.current?.resume();

                        const inputCtx = inputAudioCtxRef.current!;
                        await inputCtx.audioWorklet.addModule('/audio-processor.js');
                        const source = inputCtx.createMediaStreamSource(stream);
                        const workletNode = new AudioWorkletNode(inputCtx, 'audio-processor');

                        const analyser = inputCtx.createAnalyser();
                        analyser.fftSize = 64;
                        analyserRef.current = analyser;

                        micSourceRef.current = source;
                        processorRef.current = workletNode;

                        workletNode.port.onmessage = (event) => {
                            if (!isSessionActiveRef.current || !sessionRef.current) return;
                            
                            // Extra safety: Check if WebSocket is actually OPEN before calling send
                            // The underlying lib uses a WebSocket or similar stream
                            const session = sessionRef.current;
                            if (session.ws && session.ws.readyState !== 1) { // 1 = OPEN
                                return;
                            }

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
                            } catch {
                                // WebSocket entered CLOSING before onclose fired — mark inactive
                                // to prevent further calls until onclose resets the pipeline
                                isSessionActiveRef.current = false;
                            }
                        };

                        source.connect(analyser);
                        analyser.connect(workletNode);
                        workletNode.connect(inputCtx.destination);

                        if (initialPrompt) {
                            setTimeout(() => sendTextMessage(initialPrompt), 500);
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {

                        // Accumulate input transcription in ref for closure access
                        if (message.serverContent?.inputTranscription) {
                            inputTranscriptRef.current += message.serverContent!.inputTranscription!.text;
                            setState(prev => ({ ...prev, inputTranscript: inputTranscriptRef.current }));
                        }

                        // Accumulate output transcription in ref for closure access
                        if (message.serverContent?.outputTranscription) {
                            outputTranscriptRef.current += message.serverContent!.outputTranscription!.text;
                            setState(prev => ({ ...prev, outputTranscript: outputTranscriptRef.current }));
                        }

                        // Use refs (not state) to avoid stale closure
                        if (message.serverContent?.turnComplete) {
                            const userTranscript = inputTranscriptRef.current;
                            const assistantTranscript = outputTranscriptRef.current;

                            if (userTranscript && assistantTranscript && onTurnComplete) {
                                onTurnComplete(userTranscript, assistantTranscript);
                            }

                            // Reset refs and state
                            inputTranscriptRef.current = '';
                            outputTranscriptRef.current = '';
                            setState(prev => ({ ...prev, inputTranscript: '', outputTranscript: '' }));
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
                        isSessionActiveRef.current = false;
                        setState(prev => ({ ...prev, status: 'error', error: 'Connection failed kha. Check your network.' }));
                        stopSession();
                    },
                    onclose: () => {
                        console.log("Live API Closed");
                        isSessionActiveRef.current = false;
                        stopSession();
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: cherryFront.voiceName }
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isSessionActiveRef.current = false;
            stopSession();
        };
    }, []); // Fixed: empty array to prevent "changed size between renders" error

    return {
        isActive: state.status === 'active',
        isConnecting: state.status === 'connecting',
        status: state.status,
        error: state.error,
        inputTranscript: state.inputTranscript,
        outputTranscript: state.outputTranscript,
        analyserRef,
        startSession,
        stopSession,
        sendTextMessage
    };
};
