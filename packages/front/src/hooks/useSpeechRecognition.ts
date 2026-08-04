import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly transcript: string;
    [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionResultList {
    readonly length: number;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognitionAPI extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

// FIX: Aggiunto parametro lingua dinamico (default su Thai per la fonetica Akha/Thai)
export const useSpeechRecognition = (language: string = 'th-TH') => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);

    useEffect(() => {
        const w = window as Window & { SpeechRecognition?: new () => SpeechRecognitionAPI; webkitSpeechRecognition?: new () => SpeechRecognitionAPI };
        const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition API non supportata in questo browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language; // <-- Ora è dinamico!

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i].transcript;
                } else {
                    interimTranscript += event.results[i].transcript;
                }
            }
            setTranscript(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Errore Speech Recognition:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        // FIX: Cleanup corretto quando il componente viene smontato
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort(); // abort() forza la chiusura istantanea
            }
        };
    }, [language]); // <-- Si riavvia se cambi lingua (es. da TH a EN)

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error("Il microfono è già in ascolto o bloccato", err);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return { isListening, transcript, startListening, stopListening };
};
