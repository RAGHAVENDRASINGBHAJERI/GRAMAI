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
  const utteranceRef = useRef(null);

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

    // 3. Look for voice name matches (e.g. "Google हिन्दी")
    const langName = language.includes('hi') ? 'hindi' : language.includes('kn') ? 'kannada' : '';
    if (langName) {
      voice = voices.find((v) => v.name.toLowerCase().includes(langName));
      if (voice) return voice;
    }

    // Do NOT fallback to English for non-English text to prevent broken pronunciation
    if (langPrefix === 'en') {
      voice = voices.find((v) => v.lang.startsWith('en-IN'));
      if (voice) return voice;
      voice = voices.find((v) => v.lang.startsWith('en'));
      if (voice) return voice;
      return voices[0];
    }
    
    return null; // Allow browser to natively handle lang via string
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
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      setTranscript(fullTranscript);
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

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    // Clean text: remove Markdown and Emojis
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance; // Keep reference to prevent garbage collection
    utterance.lang = language;
    utterance.rate = 1.0; 
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = findVoice(language);
    if (voice) {
      utterance.voice = voice;
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
