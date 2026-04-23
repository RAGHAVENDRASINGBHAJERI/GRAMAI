import { useState, useCallback, useRef, useEffect } from 'react';

// Map language codes to their voice language tags
const VOICE_LANG_MAP = {
  'en-IN': 'en',
  'hi-IN': 'hi',
  'kn-IN': 'kn',
};

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  // Load available voices and wait for them to be ready
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      if (voices.length > 0) {
        voicesRef.current = voices;
        setVoicesLoaded(true);
      }
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Fallback: try loading voices after a short delay
    const timer = setTimeout(loadVoices, 500);

    return () => {
      clearTimeout(timer);
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  /**
   * Find the best matching voice for a given language code.
   * Prioritizes exact match, then language prefix match, then any voice.
   */
  const findVoice = useCallback((language) => {
    const langPrefix = VOICE_LANG_MAP[language] || language.split('-')[0];
    const voices = voicesRef.current;

    if (voices.length === 0) return null;

    // 1. Try exact match (e.g., "hi-IN")
    let voice = voices.find((v) => v.lang === language);
    if (voice) return voice;

    // 2. Try language prefix match (e.g., "hi" matches "hi-IN", "hi_IN")
    voice = voices.find((v) => v.lang.startsWith(langPrefix));
    if (voice) return voice;

    // 3. Try any Indian English voice as fallback
    voice = voices.find((v) => v.lang.startsWith('en-IN'));
    if (voice) return voice;

    // 4. Fallback to any English voice
    voice = voices.find((v) => v.lang.startsWith('en'));
    if (voice) return voice;

    // 5. Last resort: first available voice
    return voices[0];
  }, []);

  const startListening = useCallback((language = 'en-IN') => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptText = result[0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const speak = useCallback((text, language = 'en-IN') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a matching voice for the language
    const voice = findVoice(language);
    if (voice) {
      utterance.voice = voice;
      // Override lang with the voice's lang to ensure proper pronunciation
      utterance.lang = voice.lang;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e.error);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [findVoice]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    voicesLoaded,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};
