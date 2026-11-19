import React, { useEffect, useRef, useState } from 'react';
import {
  Maximize2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useRvedha } from '../context/RvedhaContext';

function VedhaOrb({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  return (
    <div
      className={`${dim} relative rounded-full flex items-center justify-center border border-[#C8A96B]/60 bg-gradient-to-br from-[#1B314E] via-[#101D2E] to-[#07111F] shadow-[0_0_24px_-4px_rgba(200,169,107,0.45)] shrink-0`}
    >
      <div className="absolute inset-1 rounded-full border border-[#C7CED8]/35" />
      <Sparkles className="w-4 h-4 text-[#C8A96B]" />
    </div>
  );
}

interface SpeechRecognitionMinimal {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function VedhaChatSurface({ compact = false }: { compact?: boolean }) {
  const { state, t, currentPatient, currentDoctor, sendAiMessage, clearAiMessages } = useRvedha();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionMinimal | null>(null);

  const isDoctor = state.activeRole === 'doctor';
  const activeId = isDoctor ? currentDoctor?.id : currentPatient?.id;

  const scopedMessages = state.chatMessages.filter(
    (m) =>
      m.roleScope === state.activeRole &&
      (m.userId === activeId || m.id.startsWith('ai-welcome'))
  );

  const prompts = isDoctor ? t.ai.doctorPrompts : t.ai.patientPrompts;

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scopedMessages.length, typing]);

  const submitPrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setInput('');
    setTyping(true);
    setTimeout(() => {
      sendAiMessage(trimmed);
      setTyping(false);
    }, 320);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPrompt(input);
  };

  const handleToggleVoice = () => {
    setVoiceNote(null);
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionMinimal;
      webkitSpeechRecognition?: new () => SpeechRecognitionMinimal;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceNote('Browser speech recognition is unavailable here—type or pick a prompt below.');
      return;
    }

    const rec = new SpeechRec();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) setInput(transcript);
    };
    rec.onerror = () => {
      setListening(false);
      setVoiceNote('Microphone access blocked or unavailable.');
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#C7CED8]/12 bg-[#07111F]/45">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C9BAE] mb-2">
          Quick Queries
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(compact ? prompts.slice(0, 3) : prompts).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submitPrompt(prompt)}
              className="rounded-full border border-[#C7CED8]/20 bg-[#122236] px-3 py-1 text-[11px] text-[#C7CED8] hover:border-[#C8A96B]/60 hover:text-[#F4F6F9] transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {scopedMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && <VedhaOrb size="sm" />}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#C8A96B] text-[#07111F] font-medium'
                    : 'rvedha-card text-[#F4F6F9]'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.highlights && msg.highlights.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 pt-2.5 border-t border-[#C7CED8]/14">
                    {msg.highlights.map((h) => (
                      <div
                        key={h.label}
                        className="rounded-xl bg-[#07111F]/70 border border-[#C7CED8]/12 px-2.5 py-1.5"
                      >
                        <span className="text-[10px] text-[#8C9BAE] block">{h.label}</span>
                        <span className="text-xs font-semibold text-[#C8A96B] tabular-nums">
                          {h.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <span
                  className={`mt-1.5 block text-[10px] ${
                    isUser ? 'text-[#07111F]/70 text-right' : 'text-[#8C9BAE]'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex items-center gap-3">
            <VedhaOrb size="sm" />
            <div className="rvedha-card rounded-2xl px-4 py-3 text-xs text-[#C7CED8] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8A96B] animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#C7CED8] animate-bounce [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8A96B] animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}
        <div ref={listEndRef} />
      </div>

      <div className="border-t border-[#C7CED8]/14 p-3.5 bg-[#07111F]/70 space-y-2">
        {voiceNote && <p className="text-[11px] text-[#C8A96B] px-1">{voiceNote}</p>}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleVoice}
            title={t.ai.voiceHint}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition shrink-0 cursor-pointer ${
              listening
                ? 'border-rose-400/50 bg-rose-500/15 text-rose-300 animate-pulse'
                : 'border-[#C7CED8]/20 bg-[#101D2E] text-[#C7CED8] hover:border-[#C8A96B]/60'
            }`}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.ai.inputPlaceholder}
            className="flex-1 rounded-xl border border-[#C7CED8]/20 bg-[#101D2E] px-3.5 py-2.5 text-xs text-[#F4F6F9] placeholder-[#8C9BAE]/70 focus:border-[#C8A96B] focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="rvedha-gold-btn h-10 px-4 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-semibold disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>

          <button
            type="button"
            onClick={clearAiMessages}
            title={t.ai.clearChat}
            className="h-10 w-10 rounded-xl border border-[#C7CED8]/20 bg-[#101D2E] flex items-center justify-center text-[#8C9BAE] hover:text-[#F4F6F9] cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function AiAssistantPage() {
  const { t } = useRvedha();
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3.5">
        <VedhaOrb />
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F4F6F9]">
            {t.ai.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8C9BAE]">{t.ai.subtitle}</p>
        </div>
      </div>

      <div className="rvedha-card rounded-3xl overflow-hidden h-[620px] flex flex-col">
        <VedhaChatSurface />
      </div>
    </div>
  );
}

export function VedhaAiFloatingWidget() {
  const { aiDrawerOpen, setAiDrawerOpen, setActiveSection, activeSection, t } = useRvedha();

  if (activeSection === 'ai-assistant') return null;

  return (
    <div className="no-print">
      {!aiDrawerOpen && (
        <button
          type="button"
          onClick={() => setAiDrawerOpen(true)}
          aria-label="Open Vedha AI Assistant"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full border border-[#C8A96B]/55 bg-[#101D2E]/95 px-4 py-2.5 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85)] backdrop-blur-xl hover:border-[#C8A96B] transition cursor-pointer"
        >
          <VedhaOrb size="sm" />
          <div className="text-left pr-1">
            <span className="block text-xs font-semibold text-[#F4F6F9]">Vedha AI</span>
            <span className="block text-[10px] text-[#C8A96B]">Ask Concierge</span>
          </div>
        </button>
      )}

      {aiDrawerOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[560px] max-h-[82vh] rounded-3xl border border-[#C8A96B]/40 bg-[#101D2E] shadow-[0_28px_80px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#C7CED8]/14 bg-[#07111F]">
            <div className="flex items-center gap-2.5">
              <VedhaOrb size="sm" />
              <div>
                <p className="text-xs font-bold text-[#F4F6F9]">{t.ai.title}</p>
                <p className="text-[10px] text-[#8C9BAE]">Synced to your active portal</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAiDrawerOpen(false);
                  setActiveSection('ai-assistant');
                }}
                title="Expand full view"
                className="h-8 w-8 rounded-lg border border-[#C7CED8]/20 flex items-center justify-center text-[#C7CED8] hover:border-[#C8A96B] cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAiDrawerOpen(false)}
                aria-label="Close AI assistant"
                className="h-8 w-8 rounded-lg border border-[#C7CED8]/20 flex items-center justify-center text-[#C7CED8] hover:border-[#C8A96B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <VedhaChatSurface compact />
          </div>
        </div>
      )}
    </div>
  );
}
