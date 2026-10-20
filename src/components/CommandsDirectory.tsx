import React, { useState } from 'react';
import { CommandMetadata, BotRole } from '../types';
import {
  Search,
  Gamepad2,
  Wrench,
  Coins,
  ShieldAlert,
  Info,
  Clock,
  Copy,
  Check,
  Zap,
  Tag
} from 'lucide-react';

interface CommandsDirectoryProps {
  commands: CommandMetadata[];
  prefix: string;
  onTestCommand?: (cmd: string) => void;
}

export const CommandsDirectory: React.FC<CommandsDirectoryProps> = ({
  commands,
  prefix,
  onTestCommand
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const categories = ['All', 'Games', 'Tools', 'Economy', 'Admin', 'General'];

  const categoryIcons: Record<string, any> = {
    'Games': Gamepad2,
    'Tools': Wrench,
    'Economy': Coins,
    'Admin': ShieldAlert,
    'General': Info
  };

  const roleBadges: Record<BotRole, { label: string; color: string; border: string }> = {
    0: { label: 'Role 0: Everyone', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/20' },
    1: { label: 'Role 1: Admin', color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
    2: { label: 'Role 2: Owner', color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/20' }
  };

  const filteredCommands = commands.filter((cmd) => {
    const matchesSearch =
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || cmd.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopyUsage = (cmd: CommandMetadata) => {
    const text = `${prefix}${cmd.name} ${cmd.usage}`.trim();
    navigator.clipboard.writeText(text);
    setCopiedCmd(cmd.name);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Group stats
  const gameCount = commands.filter(c => c.category === 'Games').length;
  const toolCount = commands.filter(c => c.category === 'Tools').length;
  const ecoCount = commands.filter(c => c.category === 'Economy').length;
  const adminCount = commands.filter(c => c.category === 'Admin').length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{gameCount}</div>
            <div className="text-xs text-slate-400">Casino & Games (20)</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{toolCount}</div>
            <div className="text-xs text-slate-400">Utility Tools (15+)</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{ecoCount}</div>
            <div className="text-xs text-slate-400">Economy Modules</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{adminCount}</div>
            <div className="text-xs text-slate-400">Admin Controls</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const Icon = categoryIcons[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands by name or desc..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Command Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommands.map((cmd) => {
          const roleInfo = roleBadges[cmd.role] || roleBadges[0];
          const isCopied = copiedCmd === cmd.name;

          return (
            <div
              key={cmd.name}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-xl transition flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-indigo-400">
                      {prefix}{cmd.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-sans">
                      {cmd.category}
                    </span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${roleInfo.color} ${roleInfo.border}`}>
                    {roleInfo.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {cmd.description}
                </p>

                {/* Usage Syntax Box */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 mb-3 flex items-center justify-between font-mono text-[11px] text-slate-300">
                  <div className="truncate mr-2">
                    <span className="text-slate-500">$</span> {prefix}{cmd.name} {cmd.usage}
                  </div>
                  <button
                    onClick={() => handleCopyUsage(cmd)}
                    title="Copy syntax"
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Footer Meta Row */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{cmd.cooldown}s CD</span>
                  </span>

                  {cmd.allownoprefix && (
                    <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                      <Zap className="w-3 h-3" />
                      <span>No-Prefix</span>
                    </span>
                  )}
                </div>

                {onTestCommand && (
                  <button
                    onClick={() => onTestCommand(`${prefix}${cmd.name} ${cmd.usage ? cmd.usage.split(' ')[0] : ''}`.trim())}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                  >
                    Test Run →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCommands.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <Tag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No matching commands found</h3>
          <p className="text-xs text-slate-500 mt-1">Try another search term or reset category filters.</p>
        </div>
      )}
    </div>
  );
};
