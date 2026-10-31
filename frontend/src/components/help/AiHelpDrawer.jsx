import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Compass,
  ArrowRight,
  Bot,
  User,
  RotateCcw,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { aiApi } from '../../services/api';

const QUICK_PROMPTS_BY_ROLE = {
  admin: [
    { label: '✨ Explain this page', prompt: 'Explain this page and what actions I can perform here.' },
    { label: '🏷️ How to add discounts?', prompt: 'How do I add or adjust a discount for a subscription plan?' },
    { label: '👥 How to manage staff?', prompt: 'How do I add a new staff member or remove an existing one?' },
    { label: '🔄 How does renewal work?', prompt: 'How does automated renewal and cron tracking work?' },
    { label: '🧾 Where are customer invoices?', prompt: 'Where can I inspect customer invoices and PDF printouts?' }
  ],
  staff: [
    { label: '✨ Explain this page', prompt: 'Explain this page and what actions I can perform here.' },
    { label: '📊 View subscriptions', prompt: 'Where can I see all active and pending subscriptions?' },
    { label: '💳 Check payment ledger', prompt: 'How do I view recent payment gateway settlements?' },
    { label: '🔄 Run renewal check', prompt: 'How can I trigger an automated renewal cycle check?' }
  ],
  customer: [
    { label: '✨ Explain this page', prompt: 'Explain this page and what actions I can perform here.' },
    { label: '💳 How to pay an invoice?', prompt: 'How do I pay a pending invoice and confirm my subscription?' },
    { label: '🏷️ Which plans have discounts?', prompt: 'Where can I browse subscription plans and see discounted prices?' },
    { label: '❌ How to cancel a subscription?', prompt: 'How do I cancel my active subscription?' },
    { label: '🧾 Where are my invoices?', prompt: 'Where can I view and download my tax invoices?' }
  ]
};

export default function AiHelpDrawer({
  isOpen,
  onClose,
  currentPath = '/admin',
  onNavigate,
  userRole = 'admin'
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Welcome to Brightloop AI Copilot!**\n\nI'm powered by OpenAI to help you navigate Brightloop and understand everything on your screen.\n\nYou are currently on: **${currentPath}**.\n\nAsk me anything, or tap a quick question below to get started!`,
      suggestedNav: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickPrompts = QUICK_PROMPTS_BY_ROLE[userRole] || QUICK_PROMPTS_BY_ROLE.customer;

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen, messages]);

  // Handle asking AI
  const handleSend = async (textToSend) => {
    const question = (textToSend || input).trim();
    if (!question || loading) return;

    const userMsg = {
      id: 'u-' + Date.now(),
      role: 'user',
      content: question
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history format for backend
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));

      const res = await aiApi.getHelp({
        message: question,
        currentPage: currentPath,
        history
      });

      const assistantMsg = {
        id: 'a-' + Date.now(),
        role: 'assistant',
        content: res.reply || 'Here is what I found for you.',
        suggestedNav: res.suggestedNav || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI Help Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an issue connecting to the AI assistant: ${err.message || 'Please try again in a moment.'}`,
          suggestedNav: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: `👋 **Chat reset!**\n\nYou are on **${currentPath}**. What would you like help with?`,
        suggestedNav: []
      }
    ]);
  };

  const handleNavClick = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  // Helper to render markdown and [NAV:/path:Label] tags safely
  const renderMessageContent = (content) => {
    // Regex for [NAV:/path:Label]
    const navTagRegex = /\[NAV:([^:]+):([^\]]+)\]/g;

    // Split content into lines to handle headers, bullets, etc.
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Heading 3 / 4
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 mt-2 text-xs sm:text-sm tracking-tight border-b border-slate-100 pb-1">
                {parseInlineNav(trimmed.replace('### ', ''))}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-slate-900 mt-3 text-sm tracking-tight border-b border-slate-100 pb-1">
                {parseInlineNav(trimmed.replace('## ', ''))}
              </h3>
            );
          }

          // Bullet list items
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const itemText = trimmed.replace(/^[-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-brand-500 font-bold leading-tight">•</span>
                <span className="flex-1">{parseInlineNav(itemText)}</span>
              </div>
            );
          }

          // Numbered list items
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-brand-600 font-semibold text-xs min-w-[16px]">{numMatch[1]}.</span>
                <span className="flex-1">{parseInlineNav(numMatch[2])}</span>
              </div>
            );
          }

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Standard paragraph
          return (
            <p key={idx} className="text-slate-700">
              {parseInlineNav(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Parses inline [NAV:/path:Label] and **bold** within a line
  const parseInlineNav = (text) => {
    const parts = [];
    let lastIndex = 0;
    const regex = /\[NAV:([^:]+):([^\]]+)\]/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderBoldText(text.substring(lastIndex, match.index)));
      }
      const navPath = match[1];
      const navLabel = match[2];
      parts.push(
        <button
          key={`nav-${match.index}`}
          type="button"
          onClick={() => handleNavClick(navPath)}
          className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 my-0.5 rounded-md bg-gradient-to-r from-brand-50 to-indigo-50 hover:from-brand-100 hover:to-indigo-100 text-brand-700 hover:text-brand-800 border border-brand-200/80 font-medium text-xs shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
          title={`Click to navigate to ${navLabel}`}
        >
          <Compass className="h-3 w-3 text-brand-600 animate-pulse" />
          <span>{navLabel}</span>
          <ArrowRight className="h-2.5 w-2.5 text-brand-500" />
        </button>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderBoldText(text.substring(lastIndex)));
    }

    return parts;
  };

  // Helper for **bold** text inside segments
  const renderBoldText = (subtext) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const pieces = [];
    let prev = 0;
    let bMatch;
    while ((bMatch = boldRegex.exec(subtext)) !== null) {
      if (bMatch.index > prev) {
        pieces.push(subtext.substring(prev, bMatch.index));
      }
      pieces.push(
        <strong key={`b-${bMatch.index}`} className="font-semibold text-slate-900">
          {bMatch[1]}
        </strong>
      );
      prev = boldRegex.lastIndex;
    }
    if (prev < subtext.length) {
      pieces.push(subtext.substring(prev));
    }
    return pieces;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 pointer-events-auto"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-auto">
        <aside className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-brand-500/30">
                <Sparkles className="h-5 w-5 text-white animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                    Brightloop Copilot
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30">
                      gpt-4o-mini
                    </span>
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-slate-300 flex items-center gap-1">
                    <Compass className="h-3 w-3 text-brand-400" />
                    Screen: <code className="text-brand-300 font-mono text-[10px] bg-slate-800 px-1 py-0.5 rounded">{currentPath}</code>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close AI Help"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 overflow-x-auto no-scrollbar flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <HelpCircle className="h-3 w-3 text-brand-500" />
              Quick:
            </span>
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleSend(item.prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-white hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 hover:border-brand-300 transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                      isAssistant
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm'
                        : 'bg-brand-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {isAssistant ? (
                      <div>
                        {renderMessageContent(msg.content)}

                        {/* Suggested Navigation Quick Buttons */}
                        {msg.suggestedNav && msg.suggestedNav.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                              <Compass className="h-3 w-3 text-brand-600" />
                              One-Click Navigation:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.suggestedNav.map((nav, nIdx) => (
                                <button
                                  key={nIdx}
                                  type="button"
                                  onClick={() => handleNavClick(nav.path)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/90 transition-all hover:scale-[1.02] shadow-2xs cursor-pointer"
                                >
                                  <span>{nav.label}</span>
                                  <ChevronRight className="h-3.5 w-3.5 text-brand-500" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="h-7 w-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="h-7 w-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-xs flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-brand-600 animate-spin" />
                  <span className="text-xs text-slate-500 font-medium">Brightloop AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask AI about ${currentPath} or how to perform any action...`}
                  className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 pr-10 shadow-inner"
                />
                <div className="absolute right-2.5 bottom-3 text-[10px] text-slate-400 hidden sm:block">
                  ↵ Send
                </div>
              </div>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 cursor-pointer shrink-0"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Press Shift + Enter for new line</span>
              <span className="flex items-center gap-1 text-brand-600 font-medium">
                <Sparkles className="h-3 w-3" />
                Context-aware navigation
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
