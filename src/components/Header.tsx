import React from 'react';
import { BotStatus } from '../types';
import { Bot, Play, Square, RefreshCw, Terminal, Shield, Users, Command } from 'lucide-react';

interface HeaderProps {
  status: BotStatus | null;
  onStart: () => void;
  onStop: () => void;
  onReloadCmds: () => void;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onStart,
  onStop,
  onReloadCmds,
  loading,
  activeTab,
  setActiveTab
}) => {
  const isRunning = status?.state === 'running';
  const isConnecting = status?.state === 'connecting';
  const isError = status?.state === 'error';

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">NEXUS</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                  ws3-fca v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">Facebook Messenger Bot Engine</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Status:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${
                isRunning
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : isConnecting
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                  : isError
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isRunning ? 'bg-emerald-400 animate-ping' : isConnecting ? 'bg-amber-400' : isError ? 'bg-rose-400' : 'bg-slate-500'
                }`} />
                {isRunning ? 'RUNNING' : isConnecting ? 'CONNECTING...' : isError ? 'ERROR' : 'STOPPED'}
              </span>
            </div>

            {status?.botUID && isRunning && (
              <div className="hidden lg:flex items-center gap-1.5 font-mono text-slate-300">
                <span className="text-slate-400">UID:</span>
                <span className="text-indigo-300">{status.botUID}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Uptime:</span>
              <span className="font-mono text-slate-200">{formatUptime(status?.uptime || 0)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5 text-indigo-400" />
              <span>{status?.commandCount || 0} Cmds</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReloadCmds}
              title="Rescan /cmds folder"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition border border-transparent hover:border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {isRunning ? (
              <button
                onClick={onStop}
                disabled={loading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-600/20 transition disabled:opacity-50"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Bot</span>
              </button>
            ) : (
              <button
                onClick={onStart}
                disabled={loading || isConnecting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isConnecting ? 'Starting...' : 'Start Bot'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-800/60 pt-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'login', label: 'Web Login & Config', icon: Shield },
            { id: 'simulator', label: 'Messenger Simulator', icon: Terminal },
            { id: 'commands', label: 'Commands (/cmds)', icon: Command },
            { id: 'users', label: 'Users & Economy', icon: Users },
            { id: 'logs', label: 'Console Logs', icon: Bot },
            { id: 'deploy', label: 'Standalone Deploy', icon: Play },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
