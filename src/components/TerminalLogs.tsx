import React, { useState, useEffect, useRef } from 'react';
import { BotLog } from '../types';
import { Terminal, Trash2, Search, ArrowDown } from 'lucide-react';

interface TerminalLogsProps {
  logs: BotLog[];
  onClear: () => void;
  onRefresh: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, onClear, onRefresh }) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSearch =
      search === '' ||
      log.message.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const levelColors: Record<BotLog['level'], { text: string; bg: string }> = {
    info: { text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    cmd: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    warn: { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    error: { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    event: { text: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px]">
        {/* Terminal Header Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white font-mono">system.log - Live Daemon Console</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Level Filter */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
              {['all', 'cmd', 'info', 'warn', 'error'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg uppercase font-mono font-medium transition ${
                    filterLevel === lvl
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-36 font-mono"
              />
            </div>

            {/* Auto scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              title="Toggle Auto-Scroll"
              className={`p-1.5 rounded-lg border text-xs transition ${
                autoScroll
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {/* Clear button */}
            <button
              onClick={onClear}
              title="Clear Console"
              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950/90 font-mono text-xs space-y-2 select-text">
          {filteredLogs.map((log) => {
            const conf = levelColors[log.level] || levelColors.info;
            const timeStr = new Date(log.timestamp).toLocaleTimeString();

            return (
              <div key={log.id} className="flex items-start gap-3 hover:bg-slate-900/40 p-1 rounded transition">
                <span className="text-slate-500 select-none flex-shrink-0">[{timeStr}]</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider flex-shrink-0 ${conf.text} ${conf.bg}`}>
                  {log.level}
                </span>
                <span className="text-slate-200 break-all leading-relaxed">{log.message}</span>
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="text-center py-16 text-slate-600">
              No console logs matching filter. Messages and command triggers will stream here in real-time.
            </div>
          )}

          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};
