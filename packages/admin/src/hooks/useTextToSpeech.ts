
import { useState, useEffect } from 'react';

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
        // Voices are loaded asynchronously, so we need to listen for the event
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
            window.speechSynthesis.cancel();
        };
    }, []);

    const speak = (text: string) => {
        if (!text || !window.speechSynthesis) return;

        window.speechSynthesis.cancel(); // Cancel any previous speech

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a suitable voice
        const preferredVoices = [
            'Google th-TH', // <--- Il trucco è mettere questa per prima!
            'Kanya',        // Apple Thai
            'Narisa',       // Windows Thai
            'Google US English', // Fallback Americano
            'Samantha',
        ];
        let selectedVoice = voices.find(voice => preferredVoices.includes(voice.name) && voice.lang.startsWith('en'));
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.startsWith('en-US') && voice.name.includes('Female'));
        }
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.startsWith('en') && voice.default);
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
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
