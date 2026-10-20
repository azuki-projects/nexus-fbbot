import React, { useState, useEffect } from 'react';
import { BotConfig } from '../types';
import {
  KeyRound,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCode,
  Settings2,
  Lock,
  UserCheck
} from 'lucide-react';

interface WebLoginConfigProps {
  config: BotConfig | null;
  onSaveConfig: (updated: BotConfig) => Promise<boolean>;
  onStartBot: () => void;
  isRunning: boolean;
}

export const WebLoginConfig: React.FC<WebLoginConfigProps> = ({
  config,
  onSaveConfig,
  onStartBot,
  isRunning
}) => {
  const [formData, setFormData] = useState<BotConfig | null>(config);
  const [appStateText, setAppStateText] = useState('');
  const [appStateError, setAppStateError] = useState<string | null>(null);
  const [newAdminUID, setNewAdminUID] = useState('');
  const [isNoPrefix, setIsNoPrefix] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData(config);
      setAppStateText(config.appState && config.appState.length > 0 ? JSON.stringify(config.appState, null, 2) : '');
      setIsNoPrefix(!config.prefix || config.prefix === '');
    }
  }, [config]);

  if (!formData) {
    return <div className="p-8 text-center text-slate-400">Loading configuration...</div>;
  }

  const handleAppStateChange = (val: string) => {
    setAppStateText(val);
    if (!val.trim()) {
      setAppStateError(null);
      setFormData(prev => prev ? { ...prev, appState: [] } : null);
      return;
    }

    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) {
        setAppStateError('AppState must be a JSON array of cookie objects.');
      } else {
        setAppStateError(null);
        setFormData(prev => prev ? { ...prev, appState: parsed } : null);
      }
    } catch {
      setAppStateError('Invalid JSON format. Please verify syntax.');
    }
  };

  const handleNoPrefixToggle = (checked: boolean) => {
    setIsNoPrefix(checked);
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        prefix: checked ? '' : (prev.prefix || '!'),
        allowNoPrefix: checked
      };
    });
  };

  const handleAddAdmin = () => {
    const trimmed = newAdminUID.trim();
    if (!trimmed || isNaN(Number(trimmed))) return;
    if (formData.adminUIDs.includes(trimmed)) return;

    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        adminUIDs: [...prev.adminUIDs, trimmed]
      };
    });
    setNewAdminUID('');
  };

  const handleRemoveAdmin = (uid: string) => {
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        adminUIDs: prev.adminUIDs.filter(id => id !== uid)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    setSaveSuccess(false);

    const success = await onSaveConfig(formData);
    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  const insertSampleAppState = () => {
    const sample = [
      {
        "key": "c_user",
        "value": "100089234123456",
        "domain": "facebook.com",
        "path": "/"
      },
      {
        "key": "xs",
        "value": "2%3Asample_session_cookie%3A2%3A0%3A0",
        "domain": "facebook.com",
        "path": "/"
      },
      {
        "key": "sb",
        "value": "sample_sb_key",
        "domain": "facebook.com",
        "path": "/"
      }
    ];
    handleAppStateChange(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Notification Banner */}
        {saveSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <div className="text-sm">
              <span className="font-semibold">Configuration Saved!</span> Settings updated to <code className="font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded">config.json</code> and all user progress preserved across restarts.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: AppState and Login Credentials */}
          <div className="lg:col-span-2 space-y-6">
            {/* AppState Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Facebook AppState (Cookie JSON)</h2>
                    <p className="text-xs text-slate-400">Required by @tas33n/ws3-fca to authenticate with Facebook</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={insertSampleAppState}
                    className="text-xs px-2.5 py-1 text-slate-300 hover:text-indigo-300 bg-slate-800 hover:bg-slate-700/80 rounded-lg transition border border-slate-700"
                  >
                    Load Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAppStateChange('')}
                    className="text-xs px-2.5 py-1 text-slate-400 hover:text-rose-300 bg-slate-800/50 hover:bg-rose-950/30 rounded-lg transition border border-slate-700/60"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={appStateText}
                  onChange={(e) => handleAppStateChange(e.target.value)}
                  placeholder={`[\n  {\n    "key": "c_user",\n    "value": "1000...",\n    "domain": "facebook.com",\n    "path": "/"\n  }\n]`}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition resize-y"
                  spellCheck={false}
                />
              </div>

              {appStateError && (
                <div className="mt-2.5 flex items-center gap-2 text-xs text-rose-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{appStateError}</span>
                </div>
              )}

              {formData.appState && formData.appState.length > 0 && !appStateError && (
                <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Valid AppState array detected ({formData.appState.length} cookie items). Ready to login!</span>
                </div>
              )}

              <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  How to get AppState:
                </div>
                <p>1. Open Chrome/Firefox on a fresh or secondary Facebook account.</p>
                <p>2. Install "c3c-fbstate" or "EditThisCookie" extension.</p>
                <p>3. Export cookies JSON and paste directly above.</p>
              </div>
            </div>

            {/* Core Role & Credentials Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Owner & Admin Role Hierarchy</h2>
                  <p className="text-xs text-slate-400">Role 0 (Everyone) | Role 1 (Bot Admin) | Role 2 (Owner Only)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bot Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Bot Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.botName}
                    onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Owner UID */}
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <span>👑 Owner UID (Role 2)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Super-admin</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerUID}
                    onChange={(e) => setFormData({ ...formData, ownerUID: e.target.value.trim() })}
                    placeholder="e.g. 100089234123456"
                    className="w-full bg-slate-950 border border-amber-500/30 font-mono rounded-xl px-3.5 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Can broadcast, change prefixes, and grant money.</p>
                </div>
              </div>

              {/* Bot Admins (Role 1) */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                  <span>🛡️ Bot Admin UIDs (Role 1)</span>
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={newAdminUID}
                    onChange={(e) => setNewAdminUID(e.target.value)}
                    placeholder="Enter Facebook UID to promote to Bot Admin..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAdmin}
                    className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl text-xs font-medium transition"
                  >
                    Add Admin
                  </button>
                </div>

                {/* Admins Tag List */}
                <div className="flex flex-wrap gap-2">
                  {formData.adminUIDs.map((uid) => (
                    <div
                      key={uid}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>{uid}</span>
                      {uid === formData.ownerUID && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-sans">Owner</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveAdmin(uid)}
                        className="text-slate-500 hover:text-rose-400 ml-1 text-sm font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Prefix, Options & Action */}
          <div className="space-y-6">
            {/* Prefix & Trigger Mode Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Command Prefix</h2>
                  <p className="text-xs text-slate-400">Trigger character or no-prefix mode</p>
                </div>
              </div>

              {/* No-prefix Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">No Prefix Mode</div>
                  <div className="text-[11px] text-slate-400">Run commands directly without symbols</div>
                </div>
                <input
                  type="checkbox"
                  checked={isNoPrefix}
                  onChange={(e) => handleNoPrefixToggle(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              {/* Custom Prefix Input */}
              {!isNoPrefix && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Custom Prefix Symbol
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      value={formData.prefix}
                      onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                      placeholder="e.g. ! or / or #"
                      className="w-24 text-center font-mono text-sm bg-slate-950 border border-slate-800 rounded-xl py-2 text-indigo-400 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center text-xs text-slate-400">
                      Example: <span className="font-mono text-slate-200 ml-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">{formData.prefix || '!'}help</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cooldown notifications */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Cooldown Warning</div>
                  <div className="text-[11px] text-slate-400">Alert users when cooldown is active</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.cooldownNotice}
                  onChange={(e) => setFormData({ ...formData, cooldownNotice: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Login Options Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">ws3-fca Options</h2>
                  <p className="text-xs text-slate-400">Fine-tune MQTT listener parameters</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                  <span>Listen Events (Join/Leave/Nicknames)</span>
                  <input
                    type="checkbox"
                    checked={formData.loginOptions.listenEvents}
                    onChange={(e) => setFormData({
                      ...formData,
                      loginOptions: { ...formData.loginOptions, listenEvents: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                  <span>Self Listen (Bot answers own messages)</span>
                  <input
                    type="checkbox"
                    checked={formData.loginOptions.selfListen}
                    onChange={(e) => setFormData({
                      ...formData,
                      loginOptions: { ...formData.loginOptions, selfListen: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                  <span>Update Presence (Online indicator)</span>
                  <input
                    type="checkbox"
                    checked={formData.loginOptions.updatePresence}
                    onChange={(e) => setFormData({
                      ...formData,
                      loginOptions: { ...formData.loginOptions, updatePresence: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                  <span>Auto-Restart on Exception</span>
                  <input
                    type="checkbox"
                    checked={formData.autoRestart}
                    onChange={(e) => setFormData({
                      ...formData,
                      autoRestart: e.target.checked
                    })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>
              </div>
            </div>

            {/* Save & Run Action Box */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Configuration (config.json)'}</span>
              </button>

              {!isRunning && (
                <button
                  type="button"
                  onClick={onStartBot}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  🚀 Launch Bot Now
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
