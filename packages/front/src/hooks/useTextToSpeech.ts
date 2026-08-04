import { useState, useEffect } from 'react';

// Voice priority list for Thai Akha phonetics — Thai first, English fallback
const PREFERRED_TTS_VOICES = [
  'Google th-TH',      // Android / Chrome Thai
  'Kanya',             // Apple Thai
  'Narisa',            // Windows Thai
  'Google US English', // English fallback
  'Samantha',          // Apple English fallback
] as const;

export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
        }
    };

    useEffect(() => {
        loadVoices();
        // Le voci vengono caricate in modo asincrono, rimaniamo in ascolto
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
            window.speechSynthesis.cancel();
        };
    }, []);

    const speak = (text: string) => {
        if (!text || !window.speechSynthesis) return;

        window.speechSynthesis.cancel(); // Cancella eventuali letture precedenti

        const utterance = new SpeechSynthesisUtterance(text);

        const preferredVoices = PREFERRED_TTS_VOICES;

        let selectedVoice: SpeechSynthesisVoice | undefined;

        // 1. Forza la priorità iterando ESATTAMENTE nell'ordine del nostro array
        for (const voiceName of preferredVoices) {
            const found = voices.find(v => v.name === voiceName);
            if (found) {
                selectedVoice = found;
                break; // Ferma il ciclo non appena trova la voce migliore disponibile
            }
        }

        // 2. Fallback: prima voce femminile americana generica
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.startsWith('en-US') && voice.name.includes('Female'));
        }

        // 3. Fallback estremo: voce di default di sistema
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.default);
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            // FIX CRITICO: allinea la lingua altrimenti il browser usa la fonetica inglese sulle voci Thai
            utterance.lang = selectedVoice.lang;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const cancel = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    return { speak, cancel, isSpeaking };
};
