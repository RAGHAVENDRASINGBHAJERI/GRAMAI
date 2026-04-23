import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppTranslation } from '../hooks/useTranslation';
import { useVoice } from '../hooks/useVoice';
import { useOffline } from '../hooks/useOffline';
import { chatService } from '../services/chatService';
import MarkdownRenderer from '../components/shared/MarkdownRenderer';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Heart,
  RefreshCw
} from 'lucide-react';

const TypingIndicator = () => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="w-8 h-8 bg-error-50 rounded-full flex items-center justify-center">
      <Bot className="w-4 h-4 text-error" />
    </div>
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-error rounded-full animate-bounce-dot" style={{ animationDelay: '0s' }} />
      <div className="w-2 h-2 bg-error rounded-full animate-bounce-dot" style={{ animationDelay: '0.16s' }} />
      <div className="w-2 h-2 bg-error rounded-full animate-bounce-dot" style={{ animationDelay: '0.32s' }} />
    </div>
  </div>
);

const ChatBubble = ({ message, onSpeak, isSpeaking }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-error' : 'bg-red-50'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-error" />
        )}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-error text-white rounded-tr-md'
            : 'bg-surface border border-red-100 shadow-sm rounded-tl-md'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} colorTheme="red" />
          )}
        </div>
        {!isUser && (
          <div className="flex items-center gap-2 mt-1.5 px-1">
            <button
              onClick={() => onSpeak(message.content)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              title={isSpeaking ? 'Stop' : 'Read aloud'}
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 text-text-secondary" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-text-secondary" />
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const QuickQuestions = ({ onSelect, questions }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    {questions.map((q, i) => (
      <button
        key={i}
        onClick={() => onSelect(q)}
        className="flex-shrink-0 px-4 py-2 bg-white border border-red-200 rounded-full text-sm text-text-secondary hover:border-error hover:text-error transition-all duration-200 whitespace-nowrap"
      >
        {q}
      </button>
    ))}
  </div>
);

const Healthcare = () => {
  const { t, getSpeechLanguage, currentLanguage } = useAppTranslation();
  const { isListening, transcript, startListening, stopListening, speak, isSpeaking, stopSpeaking } = useVoice();
  const { isOnline } = useOffline();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickQuestions = [
    'I have fever and body ache',
    'What should a pregnant woman eat?',
    'Home remedies for a minor burn',
    'How to prevent mosquito bites?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim(), id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      let aiContent = '';
      if (isOnline) {
        const response = await chatService.sendQuery({
          question: userMessage.content,
          language: currentLanguage,
          category: 'health', // explicitly passing health
        });
        aiContent = response.data.data.response || response.data.data.answer || "I'm sorry, I couldn't process your health query.";
      } else {
        aiContent = "I'm currently offline. For severe health issues, please consult a doctor immediately. Regular offline first-aid tips will be available here.";
      }

      const aiMessage = {
        role: 'assistant',
        content: aiContent,
        id: Date.now() + 1
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again or visit a local clinic for urgent issues.",
        id: Date.now() + 1
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(getSpeechLanguage(currentLanguage));
    }
  };

  const handleSpeak = (text) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text, getSpeechLanguage(currentLanguage));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-error flex items-center gap-2">
            <Heart className="w-6 h-6" />
            {t('healthcare.title') || 'Interactive Healthcare Assistant'}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {isOnline ? 'Share your symptoms or health queries.' : 'Offline Mode. Basic queries only.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([])}
            className="btn-ghost text-sm text-error flex items-center gap-2 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length === 0 && (
        <div className="mb-4">
          <QuickQuestions
            questions={quickQuestions}
            onSelect={(q) => {
              setInput(q);
              inputRef.current?.focus();
            }}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1 p-4 rounded-xl border border-red-50 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              How are you feeling today?
            </h3>
            <p className="text-sm text-text-secondary max-w-sm">
              Describe your symptoms, ask for home remedies, or get first-aid advice. Always consult a doctor for severe issues!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              onSpeak={handleSpeak}
              isSpeaking={isSpeaking}
            />
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-surface rounded-2xl border border-red-200 p-2 shadow-sm">
        <div className="flex items-end gap-2">
          <button
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl transition-all duration-200 ${
              isListening
                ? 'bg-red-50 text-error voice-recording'
                : 'hover:bg-red-50 text-text-secondary hover:text-error'
            }`}
            title="Voice input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your health condition..."
              className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none max-h-32"
              rows={1}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-error text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Healthcare;
