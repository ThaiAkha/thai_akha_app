// packages/admin/src/hooks/useGeminiLive.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { Modality } from '@google/genai';
import type { LiveServerMessage, LiveSendClientContentParameters, LiveSendRealtimeInputParameters, Session } from '@google/genai';
import type { UserProfile } from '../services/auth.service';
import { getLiveGeminiClient } from '../services/geminiClient';
import { selectAdminAgent, buildAdminAgentPrompt } from '../prompts/adminAgents';
import { formatScopedDataBlocks } from '../prompts/scopedData';
import { fetchAdminScopedData } from '../prompts/adminScopedFetch';
import { saveMessage } from '@thaiakha/shared/services';
import { GEMINI_LIVE_MODEL } from '@thaiakha/shared/lib/cherry-prompts';

export type SessionStatus = 'idle' | 'connecting' | 'active' | 'error';

/**
 * Sottoinsieme della Session di @google/genai usato da questo hook (speculare al front).
 * `sendRealtimeInput({ clientContent })` e' un uso legacy non descritto dal d.ts dell'SDK:
 * lo tipizziamo qui per non cambiare la logica.
 */
interface LiveSession extends Pick<Session, 'close'> {
  sendRealtimeInput(params: LiveSendRealtimeInputParameters | { clientContent: LiveSendClientContentParameters }): void;
}

interface SessionState {
  status: SessionStatus;
  error: string | null;
  inputTranscript: string;
  outputTranscript: string;
}

export const useGeminiLive = (
  userProfile?: UserProfile | null,
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
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const sessionRef = useRef<LiveSession | null>(null);
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
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch { /* noop: nodo gia' scollegato */ }
      processorRef.current = null;
    }
    if (micSourceRef.current) {
      try { micSourceRef.current.disconnect(); } catch { /* noop: sorgente gia' scollegata */ }
      micSourceRef.current = null;
    }
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch { /* noop: sessione gia' chiusa */ }
      sessionRef.current = null;
    }
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        try { session.close(); } catch { /* noop: sessione gia' chiusa */ }
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
    sourcesRef.current.forEach(s => { try { s.stop(); } catch { /* noop: sorgente gia' ferma */ } });
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
            turnComplete: true,
          },
        });
      }).catch((err) => {
        console.error('[useGeminiLive/admin] Failed to send realtime input:', err);
      });
    }
  };

  const startSession = async (overrideInstruction?: string, initialPrompt?: string) => {
    if (state.status !== 'idle') stopSession();
    setState(prev => ({ ...prev, status: 'connecting', error: null }));

    try {
      const ai = await getLiveGeminiClient();
      const AudioContextClass = (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);

      audioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
      inputAudioCtxRef.current = new AudioContextClass({ sampleRate: 16000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      // Multi-Cherry per ruolo (voce): stesso agente + DATI scopati per ruolo del
      // text chat (Fase 3, fetcher condiviso). isVoiceMode=true.
      const agent = selectAdminAgent(userProfile?.role);
      const scoped = await fetchAdminScopedData(userProfile?.role, userProfile?.id, today, nextWeek);
      const resolvedSystemInstruction = overrideInstruction || buildAdminAgentPrompt(
        agent,
        userProfile || {},
        formatScopedDataBlocks(scoped),
        true,
      );

      const sessionPromise = ai.live.connect({
        // Model id da single source of truth (@thaiakha/shared) → allineato al front.
        // ⚠️ Deve essere l'id COMPLETO: un alias corto fa fallire connect → voce ko.
        model: GEMINI_LIVE_MODEL,
        callbacks: {
          onopen: async () => {
            setState(prev => ({ ...prev, status: 'active' }));

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
                  },
                });
              } catch { /* session may be closing */ }
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
              if (sessionId) {
                setState(prev => {
                  if (prev.outputTranscript) saveMessage(sessionId, 'assistant', prev.outputTranscript, 'voice');
                  if (prev.inputTranscript) saveMessage(sessionId, 'user', prev.inputTranscript, 'voice');
                  return { ...prev, inputTranscript: '', outputTranscript: '' };
                });
              } else {
                setState(prev => ({ ...prev, inputTranscript: '', outputTranscript: '' }));
              }
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
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
              sourcesRef.current.forEach(s => { try { s.stop(); } catch { /* noop: sorgente gia' ferma */ } });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('[useGeminiLive/admin] Live API Error:', e);
            setState(prev => ({ ...prev, status: 'error', error: 'Connection failed kha. Check your network.' }));
            stopSession();
          },
          onclose: () => {
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: agent.voiceName },
            },
          },
          systemInstruction: resolvedSystemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });

      sessionPromiseRef.current = sessionPromise;
      sessionPromise.then(session => { sessionRef.current = session; }).catch(() => {});

    } catch (err: unknown) {
      console.error('[useGeminiLive/admin] Failed to start session:', err);
      setState(prev => ({ ...prev, status: 'error', error: (err as { message?: string } | null)?.message || 'Microphone permission denied kha.' }));
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
    sendTextMessage,
  };
};
