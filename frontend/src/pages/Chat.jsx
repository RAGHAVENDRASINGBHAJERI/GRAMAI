import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useAppTranslation } from '../hooks/useTranslation';
import { useVoice } from '../hooks/useVoice';
import { useOffline } from '../hooks/useOffline';
import { chatService } from '../services/chatService';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Zap,
  Brain,
} from 'lucide-react';

const TypingIndicator = () => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
      <Bot className="w-4 h-4 text-primary" />
    </div>
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce-dot" style={{ animationDelay: '0s' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce-dot" style={{ animationDelay: '0.16s' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce-dot" style={{ animationDelay: '0.32s' }} />
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
        isUser ? 'bg-primary' : 'bg-primary-50'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-white rounded-tr-md'
            : 'bg-surface border border-gray-100 shadow-sm rounded-tl-md'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        {!isUser && message.metadata && (
          <div className="flex items-center gap-2 mt-1.5 px-1">
            {message.metadata.source && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                message.metadata.source === 'groq-ai'
                  ? 'bg-purple-100 text-purple-700'
                  : message.metadata.source === 'ai-engine'
                  ? 'bg-green-100 text-green-700'
                  : message.metadata.source === 'cache'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {message.metadata.source}
              </span>
            )}
            {message.metadata.confidence && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                message.metadata.confidence >= 0.7
                  ? 'bg-green-100 text-green-700'
                  : message.metadata.confidence >= 0.4
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {message.metadata.confidence >= 0.7 ? 'High' : message.metadata.confidence >= 0.4 ? 'Medium' : 'Low'}
              </span>
            )}
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
        className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-text-secondary hover:border-primary hover:text-primary transition-all duration-200 whitespace-nowrap"
      >
        {q}
      </button>
    ))}
  </div>
);

const Chat = () => {
  const { messages, isTyping, addMessage, setTyping, currentLanguage, useGroq, toggleGroq } = useChatStore();
  const { t, getSpeechLanguage } = useAppTranslation();
  const { isListening, transcript, startListening, stopListening, speak, isSpeaking, stopSpeaking } = useVoice();
  const { isOnline } = useOffline();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickQuestions = [
    'What is PM-KISAN scheme?',
    'How to control pests in paddy?',
    'What are dengue symptoms?',
    'What is MSP for wheat?',
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

    const userMessage = { role: 'user', content: input.trim() };
    addMessage(userMessage);
    setInput('');
    setTyping(true);

    try {
      let response;
      if (isOnline) {
        response = await chatService.sendQuery({
          question: userMessage.content,
          language: currentLanguage,
          useGroq: useGroq,
        });
      } else {
        // Offline fallback - use local TF-IDF logic
        response = { data: { data: await getOfflineResponse(userMessage.content) } };
      }

      const aiMessage = {
        role: 'assistant',
        content: response.data.data.answer || response.data.data.response,
        metadata: {
          source: response.data.data.source || (isOnline ? 'ai-engine' : 'offline-fallback'),
          confidence: response.data.data.confidence || 0.5,
          category: response.data.data.category,
        },
      };
      addMessage(aiMessage);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: t('chat.error'),
        metadata: { source: 'error', confidence: 0 },
      };
      addMessage(errorMessage);
    } finally {
      setTyping(false);
    }
  };

  const getOfflineResponse = async (question) => {
    // Simple offline fallback
    const q = question.toLowerCase();
    if (q.includes('pm-kisan') || q.includes('kisan')) {
      return { answer: 'PM-KISAN provides ₹6,000/year to farmers in 3 installments.', source: 'offline-fallback', confidence: 0.6 };
    }
    if (q.includes('paddy') || q.includes('pest')) {
      return { answer: 'Use neem oil (5ml/liter) for leaf folder. Install pheromone traps at 12-15 per hectare.', source: 'offline-fallback', confidence: 0.6 };
    }
    if (q.includes('dengue')) {
      return { answer: 'Dengue symptoms: high fever, severe headache, pain behind eyes, joint pain. Visit a hospital immediately.', source: 'offline-fallback', confidence: 0.6 };
    }
    if (q.includes('wheat') || q.includes('msp')) {
      return { answer: 'Current MSP for wheat is ₹2,275 per quintal. Market prices vary by state.', source: 'offline-fallback', confidence: 0.6 };
    }
    return { answer: 'I don\'t have specific information on that. Try rephrasing your question.', source: 'offline-fallback', confidence: 0.3 };
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
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t('chat.title')}</h1>
          <p className="text-sm text-text-secondary">
            {isOnline ? 'Online' : 'Offline mode'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Engine Toggle - Groq is default primary */}
          <button
            onClick={toggleGroq}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 active:scale-95 ${
              useGroq
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}
            title={useGroq ? 'Groq AI is active (click to switch to TF-IDF)' : 'TF-IDF Engine is active (click to switch to Groq AI)'}
          >
            <motion.div
              animate={{ rotate: useGroq ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {useGroq ? <Brain className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            </motion.div>
            <span>{useGroq ? 'Groq AI' : 'TF-IDF'}</span>
            <motion.div
              className={`w-1.5 h-1.5 rounded-full ${
                useGroq ? 'bg-purple-500' : 'bg-green-500'
              }`}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </button>
          <button
            onClick={() => useChatStore.getState().clearMessages()}
            className="btn-ghost text-sm flex items-center gap-2"
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
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Ask me anything!
            </h3>
            <p className="text-sm text-text-secondary max-w-sm">
              Ask about farming techniques, health tips, government schemes, or market prices.
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
      <div className="bg-surface rounded-2xl border border-gray-200 p-2 shadow-sm">
        <div className="flex items-end gap-2">
          <button
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl transition-all duration-200 ${
              isListening
                ? 'bg-red-50 text-error voice-recording'
                : 'hover:bg-gray-100 text-text-secondary'
            }`}
            title={t('chat.voiceBtn')}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none max-h-32"
              rows={1}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-primary text-white rounded-xl hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
