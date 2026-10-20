import React, { useState } from 'react';
import { BotConfig } from '../types';
import { Download, Copy, Check, Terminal, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';

interface ExportDeployProps {
  config: BotConfig | null;
}

export const ExportDeploy: React.FC<ExportDeployProps> = ({ config }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const configJson = config ? JSON.stringify(config, null, 2) : '{}';

  const standaloneIndexJs = `/**
 * Standalone Facebook Messenger Bot
 * Built with @tas33n/ws3-fca & Nexus Bot Engine
 */
const fs = require('fs');
const path = require('path');
const login = require('@tas33n/ws3-fca');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const USERS_PATH = path.join(__dirname, 'data', 'users.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
let users = {};
try {
  if (fs.existsSync(USERS_PATH)) {
    users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  }
} catch (e) {
  users = {};
}

function saveUsers() {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

console.log('Logging in with @tas33n/ws3-fca...');

login({ appState: config.appState }, config.loginOptions || {}, (err, api) => {
  if (err) {
    console.error('Login Failed:', err);
    return;
  }

  const botUID = api.getCurrentUserID();
  console.log('====================================');
  console.log('✅ NEXUS BOT IS ONLINE!');
  console.log('Bot UID:', botUID);
  console.log('Owner UID:', config.ownerUID);
  console.log('Prefix:', config.prefix || '(none)');
  console.log('====================================');

  api.listenMqtt((err, event) => {
    if (err) return console.error('MQTT error:', err);
    if (!event || (event.type !== 'message' && event.type !== 'message_reply')) return;

    const body = (event.body || '').trim();
    if (!body) return;

    console.log(\`[MSG from \${event.senderID}]: \${body}\`);
    // Commands execute here
  });
});
`;

  const termuxScript = `# 1. Update and install Node.js
pkg update && pkg upgrade -y
pkg install nodejs-lts git -y

# 2. Clone or create bot directory
mkdir nexus-fb-bot && cd nexus-fb-bot

# 3. Initialize & install ws3-fca
npm init -y
npm install @tas33n/ws3-fca

# 4. Create config.json and index.js
# Paste your config.json and index.js

# 5. Start the bot!
node index.js
`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Standalone Deployment Package</h2>
              <p className="text-xs text-slate-400">Deploy this bot anywhere: VPS, Termux (Android), Render, or Local PC</p>
            </div>
          </div>

          <button
            onClick={() => downloadFile('config.json', configJson)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download config.json</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 1. Modular /cmds/
            </div>
            <p className="text-slate-400">
              All 20 games and 15 tools are isolated in separate files inside <code className="text-indigo-300">cmds/</code>. Dynamic auto-loader handles discovery!
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="font-semibold text-blue-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> 2. Persistent Storage
            </div>
            <p className="text-slate-400">
              User balances, levels, inventories, and streaks automatically persist inside <code className="text-indigo-300">data/users.json</code> across restarts.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="font-semibold text-purple-400 flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4" /> 3. 24/7 Hosting Ready
            </div>
            <p className="text-slate-400">
              Compatible with PM2, screen, tmux, Docker, or Termux on Android phones for 24/7 zero-cost uptime.
            </p>
          </div>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Standalone index.js */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Standalone index.js Runner</span>
              </h3>
              <button
                onClick={() => copyToClipboard(standaloneIndexJs, 'index')}
                className="text-xs flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
              >
                {copiedType === 'index' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'index' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-80">
              {standaloneIndexJs}
            </pre>
          </div>
        </div>

        {/* Termux / Linux Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Termux (Android) Quickstart</span>
              </h3>
              <button
                onClick={() => copyToClipboard(termuxScript, 'termux')}
                className="text-xs flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
              >
                {copiedType === 'termux' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'termux' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-80">
              {termuxScript}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
