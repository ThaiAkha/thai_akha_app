import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionAPI extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void; // <-- Aggiunto per il cleanup sicuro
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

// FIX: Aggiunto parametro lingua dinamico (default su Thai per la fonetica Akha/Thai)
export const useSpeechRecognition = (language: string = 'th-TH') => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition API non supportata in questo browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language; // <-- Ora è dinamico!

        recognition.onresult = (event: any) => {
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

        recognition.onerror = (event: any) => {
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
