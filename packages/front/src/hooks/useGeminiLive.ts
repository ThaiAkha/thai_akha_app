import { useState, useRef, useCallback, useEffect } from 'react';
import { getLiveGeminiClient } from '../services/geminiClient';
import type { LiveServerMessage, LiveSendClientContentParameters, LiveSendRealtimeInputParameters, Session } from '@google/genai';
import { buildCherryPrompt, cherryFront } from '../prompts/cherryPrompt';
import { checkRateLimit, getGuestSessionToken, getUserBookingState } from '@thaiakha/shared/services';
import { tObj } from '../i18n';
import { getAllStaticKnowledge } from '@thaiakha/shared/data/cherryKnowledge';
import type { UserProfile } from '@thaiakha/shared/types';
import { encodeAudio, decodeAudio, decodeAudioDataToBuffer } from '../lib/audioUtils';

export type SessionStatus = 'idle' | 'connecting' | 'active' | 'error';

/**
 * Sottoinsieme della Session di @google/genai usato da questo hook.
 * `sendRealtimeInput({ clientContent })` e `ws` sono usi legacy non descritti
 * dal d.ts dell'SDK: li tipizziamo qui per non cambiare la logica.
 */
interface LiveSession extends Pick<Session, 'close'> {
    sendRealtimeInput(params: LiveSendRealtimeInputParameters | { clientContent: LiveSendClientContentParameters }): void;
    ws?: { readyState: number };
}

interface SessionState {
    status: SessionStatus;
    error: string | null;
    inputTranscript: string;
    outputTranscript: string;
}

export const useGeminiLive = (
  userProfile?: UserProfile,
  _sessionId?: string | null,
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
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const sessionRef = useRef<LiveSession | null>(null); // resolved session for sync access
    const isSessionActiveRef = useRef<boolean>(false); // guards sendRealtimeInput against CLOSING/CLOSED WebSocket
    const processorRef = useRef<AudioWorkletNode | null>(null);
    const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const inputTranscriptRef = useRef<string>(''); // accumulates user speech transcription
    const outputTranscriptRef = useRef<string>(''); // accumulates Cherry's response transcription
    const analyserRef = useRef<AnalyserNode | null>(null); // for waveform visualization


    const stopSession = useCallback(() => {
        // Mark session inactive immediately — prevents worklet onmessage from calling sendRealtimeInput
        isSessionActiveRef.current = false;

        // Disconnect mic pipeline first to stop sending audio
        if (processorRef.current) {
            processorRef.current.port.onmessage = null; // detach handler before disconnect
            try { processorRef.current.disconnect(); } catch { /* noop: already disconnected */ }
            processorRef.current = null;
        }
        if (micSourceRef.current) {
            try { micSourceRef.current.disconnect(); } catch { /* noop: already disconnected */ }
            micSourceRef.current = null;
        }

        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch { /* noop: session already closed */ }
            sessionRef.current = null;
        }
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                try { session.close(); } catch { /* noop: session already closed */ }
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
            try { analyserRef.current.disconnect(); } catch { /* noop: already disconnected */ }
            analyserRef.current = null;
        }
        if (inputAudioCtxRef.current) {
            inputAudioCtxRef.current.close().catch(() => {});
            inputAudioCtxRef.current = null;
        }
        sourcesRef.current.forEach(s => { try { s.stop(); } catch { /* noop: source already stopped */ } });
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
        const rateLimit = await checkRateLimit(userProfile?.id, getGuestSessionToken() ?? undefined);
        if (!rateLimit.allowed) {
            setState(prev => ({ ...prev, status: 'error', error: rateLimit.reason ?? 'Voice limit reached.' }));
            return;
        }

        setState(prev => ({ ...prev, status: 'connecting', error: null }));

        try {
            // `Modality` e' un enum, quindi un import di VALORE: da solo teneva l'SDK
            // Gemini nel chunk d'ingresso di ogni pagina. Qui il chunk e' gia' in cache
            // (getLiveGeminiClient lo ha appena scaricato), quindi non si aspetta nulla.
            const [ai, { Modality }] = await Promise.all([
                getLiveGeminiClient(),
                import('@google/genai'),
            ]);
            const AudioContextClass = (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
            
            audioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
            inputAudioCtxRef.current = new AudioContextClass({ sampleRate: 16000 });

            const stream = await navigator.mediaDevices.getUserMedia({
              audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });
            streamRef.current = stream;

            // Stessa conoscenza del testo: booking_state + diete/spice mappate leggibili.
            const booking = await getUserBookingState(userProfile?.id);
            const resolvedSystemInstruction = overrideInstruction || buildCherryPrompt({
              isLogged: !!userProfile,
              role: userProfile?.role, // #17 Chameleon: modula persona anche in voce
              name: userProfile?.full_name,
              dietary_profile: userProfile?.dietary_profile
                ? ((tObj('cherry:dietaryMap') as Record<string, string>)[userProfile.dietary_profile] ?? userProfile.dietary_profile)
                : undefined,
              allergies: userProfile?.allergies,
              preferred_spiciness: userProfile?.preferred_spiciness_id
                ? (tObj('cherry:spicinessMap') as Record<string, string>)[String(userProfile.preferred_spiciness_id)]
                : undefined,
              booking_state: booking.state,
              days_until_class: booking.daysUntil,
              session_type: booking.sessionType ?? undefined,
            });

            const sessionPromise = ai.live.connect({
                model: cherryFront.liveModel,
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
                                        data: encodeAudio(new Uint8Array(int16.buffer)),
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

                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && audioCtxRef.current) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
                            const audioBuffer = await decodeAudioDataToBuffer(decodeAudio(base64Audio), audioCtxRef.current, 24000);
                            const sourceNode = audioCtxRef.current.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(audioCtxRef.current.destination);
                            sourceNode.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            
                            sourcesRef.current.add(sourceNode);
                            sourceNode.onended = () => sourcesRef.current.delete(sourceNode);
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => { try { s.stop(); } catch { /* noop: source already stopped */ } });
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        // Surface the REAL reason (non solo "network") → diagnosi immediata.
                        const errDetail = e?.error as { message?: string } | undefined;
                        const reason = e?.message || errDetail?.message || (e as ErrorEvent & { reason?: string })?.reason || 'unknown';
                        console.error("Live API Error:", reason, e);
                        isSessionActiveRef.current = false;
                        setState(prev => ({ ...prev, status: 'error', error: `Voice error: ${reason} kha` }));
                        stopSession();
                    },
                    onclose: (e: CloseEvent) => {
                        // Chiusura ANOMALA durante connecting/active (code ≠ 1000) → mostra la ragione.
                        const abnormal = e && typeof e.code === 'number' && e.code !== 1000;
                        console.log("Live API Closed", e?.code, e?.reason);
                        isSessionActiveRef.current = false;
                        if (abnormal) {
                            setState(prev =>
                                prev.status === 'error'
                                    ? prev // errore già impostato da onerror
                                    : { ...prev, status: 'error', error: `Voice closed (${e.code})${e.reason ? `: ${e.reason}` : ''} kha` },
                            );
                        }
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
                    systemInstruction: `${resolvedSystemInstruction}\n${getAllStaticKnowledge()}`,
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                }
            });

            sessionPromiseRef.current = sessionPromise;
            // Store resolved session for sync access in onaudioprocess (no .then() per chunk)
            sessionPromise.then(session => { sessionRef.current = session; }).catch(() => {});

        } catch (err: unknown) {
            console.error("Failed to start session:", err);
            // Distingui la causa reale invece del generico "mic denied":
            // permesso microfono negato/assente vs token/edge vs altro.
            const name = (err as { name?: string } | null | undefined)?.name;
            let msg: string;
            if (name === 'NotAllowedError' || name === 'SecurityError') {
                msg = 'Microphone permission denied kha — allow the mic and retry.';
            } else if (name === 'NotFoundError' || name === 'NotReadableError') {
                msg = 'No microphone found kha.';
            } else {
                // Token/edge (getLiveGeminiClient) o altro → mostra il messaggio reale.
                msg = err instanceof Error ? `Voice start failed: ${err.message} kha` : 'Voice start failed kha.';
            }
            setState(prev => ({ ...prev, status: 'error', error: msg }));
            stopSession();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isSessionActiveRef.current = false;
            stopSession();
        };
    }, [stopSession]); // stopSession e' un useCallback([]) stabile: dimensione deps costante

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
