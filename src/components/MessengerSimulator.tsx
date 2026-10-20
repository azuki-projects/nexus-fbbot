import React, { useState, useRef, useEffect } from 'react';
import { BotRole, CommandMetadata, UserProfile } from '../types';
import {
  Send,
  Sparkles,
  User,
  Shield,
  Crown,
  Trash2,
  Wallet,
  PlayCircle
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  senderName: string;
  senderRole?: BotRole;
  text: string;
  timestamp: number;
}

interface MessengerSimulatorProps {
  commands: CommandMetadata[];
  prefix: string;
  onRefreshUsers: () => void;
}

export const MessengerSimulator: React.FC<MessengerSimulatorProps> = ({
  commands,
  prefix,
  onRefreshUsers
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      senderName: 'Nexus FB-Bot',
      text: `👋 Greetings! I am Nexus FB-Bot running @tas33n/ws3-fca.\nType "${prefix || ''}help" to inspect all 20 games, 15 tools, and economy commands!\nYou can toggle your identity between Member (0), Admin (1), and Owner (2) above.`,
      timestamp: Date.now() - 30000
    }
  ]);

  const [input, setInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<BotRole>(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const testUsers: Record<BotRole, { uid: string; name: string }> = {
    0: { uid: '100012345678901', name: 'Alex Mercer (Member)' },
    1: { uid: '100098765432100', name: 'Sarah Connor (Admin)' },
    2: { uid: '100089234123456', name: 'Nexus Master (Owner)' }
  };

  const currentTestUser = testUsers[selectedRole];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      senderName: currentTestUser.name,
      senderRole: selectedRole,
      text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/bot/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderID: currentTestUser.uid,
          senderName: currentTestUser.name,
          body: text,
          role: selectedRole
        })
      });

      const data = await res.json();
      if (data.user) {
        setUserProfile(data.user);
        onRefreshUsers();
      }

      if (data.replies && data.replies.length > 0) {
        for (const rep of data.replies) {
          const botMsg: Message = {
            id: Math.random().toString(36).substring(2, 9),
            sender: 'bot',
            senderName: 'Nexus FB-Bot',
            text: rep,
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, botMsg]);
        }
      } else {
        // No command trigger or silent response
        const silentMsg: Message = {
          id: Math.random().toString(36).substring(2, 9),
          sender: 'bot',
          senderName: 'Nexus FB-Bot',
          text: `(Message received by listener. No command triggered. Use "${prefix}help" to run commands)`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, silentMsg]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          sender: 'bot',
          senderName: 'System',
          text: `⚠️ Simulation error: ${err.message}`,
          timestamp: Date.now()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'help', cmd: `${prefix}help` },
    { label: 'balance', cmd: `${prefix}balance` },
    { label: 'slots 200', cmd: `${prefix}slots 200` },
    { label: 'coinflip heads 300', cmd: `${prefix}coinflip heads 300` },
    { label: 'blackjack 250', cmd: `${prefix}blackjack 250` },
    { label: 'scratchcard', cmd: `${prefix}scratchcard` },
    { label: 'fishing', cmd: `${prefix}fishing` },
    { label: 'mining', cmd: `${prefix}mining` },
    { label: 'work', cmd: `${prefix}work` },
    { label: 'daily', cmd: `${prefix}daily` },
    { label: 'uid', cmd: `${prefix}uid` },
    { label: 'weather Tokyo', cmd: `${prefix}weather Tokyo` },
    { label: 'calc (25*4)+14', cmd: `${prefix}calc (25*4)+14` },
    { label: 'botinfo', cmd: `${prefix}botinfo` }
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Role Switcher & Live Stats */}
        <div className="lg:col-span-1 space-y-4">
          {/* Identity Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Simulated Identity
            </h3>

            <div className="space-y-2">
              {[
                { role: 0 as BotRole, label: 'Role 0: Regular Member', desc: 'General access to Games & Tools', icon: User, color: 'text-slate-300' },
                { role: 1 as BotRole, label: 'Role 1: Bot Admin', desc: 'Can addmoney, setprefix', icon: Shield, color: 'text-blue-400' },
                { role: 2 as BotRole, label: 'Role 2: Bot Owner', desc: 'Full access + setrole & broadcast', icon: Crown, color: 'text-amber-400' },
              ].map(item => {
                const isSelected = selectedRole === item.role;
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRole(item.role)}
                    className={`w-full text-left p-2.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-sm shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 pl-6">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Financial Balance Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Live Wallet
              </h3>
              <span className="text-[10px] font-mono text-slate-500">UID: {currentTestUser.uid.slice(-6)}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Cash Balance:</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                ${userProfile ? userProfile.balance.toLocaleString() : '1,000+'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                <span>Level {userProfile?.level || 1}</span>
                <span>Streak: {userProfile?.dailyStreak || 0}d</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Wins and losses in casino games and work commands persist automatically in <code className="text-indigo-300">data/users.json</code>!
            </p>
          </div>

          {/* Quick Command Launcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Command Test
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.cmd)}
                  className="px-2 py-1 bg-slate-950 hover:bg-indigo-950/40 text-slate-300 hover:text-indigo-300 rounded-lg text-[11px] font-mono border border-slate-800 hover:border-indigo-500/40 transition flex items-center gap-1"
                >
                  <PlayCircle className="w-2.5 h-2.5" />
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Chat Window: Facebook Messenger Mockup */}
        <div className="lg:col-span-3 flex flex-col h-[650px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                  FB
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 absolute bottom-0 right-0" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Facebook Messenger Thread Simulator</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">
                    Live FCA Listener
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Testing as: <span className="text-indigo-300 font-medium">{currentTestUser.name}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setMessages([])}
              title="Clear Thread"
              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40 font-sans">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-500 mb-1 px-1">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md whitespace-pre-wrap font-mono leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm border border-blue-400/20'
                        : 'bg-slate-900 text-slate-100 rounded-bl-sm border border-slate-800/90 shadow-slate-950/50'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="italic">Nexus FB-Bot is executing command...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Type a command (e.g. ${prefix}slots 100 or ${prefix}help)...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
