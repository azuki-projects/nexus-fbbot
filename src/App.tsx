/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BotStatus, BotConfig, CommandMetadata, UserProfile, BotLog } from './types';
import { Header } from './components/Header';
import { WebLoginConfig } from './components/WebLoginConfig';
import { MessengerSimulator } from './components/MessengerSimulator';
import { CommandsDirectory } from './components/CommandsDirectory';
import { UsersManager } from './components/UsersManager';
import { TerminalLogs } from './components/TerminalLogs';
import { ExportDeploy } from './components/ExportDeploy';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [commands, setCommands] = useState<CommandMetadata[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [prefilledCmd, setPrefilledCmd] = useState<string | null>(null);

  // Fetch status & logs
  const fetchStatusAndLogs = useCallback(async () => {
    try {
      const [statusRes, logsRes] = await Promise.all([
        fetch('/api/bot/status'),
        fetch('/api/bot/logs?limit=150')
      ]);

      if (statusRes.ok) {
        const s = await statusRes.json();
        setStatus(s);
      }
      if (logsRes.ok) {
        const l = await logsRes.json();
        setLogs(l);
      }
    } catch {
      // ignore transient network errors
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      const [cfgRes, cmdRes, userRes] = await Promise.all([
        fetch('/api/bot/config'),
        fetch('/api/bot/commands'),
        fetch('/api/bot/users')
      ]);

      if (cfgRes.ok) setConfig(await cfgRes.json());
      if (cmdRes.ok) setCommands(await cmdRes.json());
      if (userRes.ok) setUsers(await userRes.json());

      await fetchStatusAndLogs();
    } catch (err) {
      console.error('Failed to load initial bot data:', err);
    }
  }, [fetchStatusAndLogs]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchStatusAndLogs, 3000);
    return () => clearInterval(interval);
  }, [fetchAllData, fetchStatusAndLogs]);

  // Actions
  const handleStartBot = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/start', { method: 'POST' });
      const data = await res.json();
      await fetchStatusAndLogs();
      if (!data.success) {
        alert(data.message || 'Failed to start bot');
      }
    } catch (err: any) {
      alert(`Error starting bot: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStopBot = async () => {
    setLoading(true);
    try {
      await fetch('/api/bot/stop', { method: 'POST' });
      await fetchStatusAndLogs();
    } catch (err: any) {
      alert(`Error stopping bot: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReloadCmds = async () => {
    setLoading(true);
    try {
      await fetch('/api/bot/reload-cmds', { method: 'POST' });
      const cmdRes = await fetch('/api/bot/commands');
      if (cmdRes.ok) setCommands(await cmdRes.json());
      await fetchStatusAndLogs();
    } catch (err: any) {
      console.error('Failed to reload commands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (newConfig: BotConfig): Promise<boolean> => {
    try {
      const res = await fetch('/api/bot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        await fetchStatusAndLogs();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleUpdateUser = async (uid: string, updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/bot/users/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.uid === uid ? data.user : u));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/bot/logs/clear', { method: 'POST' });
      setLogs([]);
    } catch (err) {
      console.error('Error clearing logs:', err);
    }
  };

  const handleTestCommand = (cmdText: string) => {
    setPrefilledCmd(cmdText);
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <Header
        status={status}
        onStart={handleStartBot}
        onStop={handleStopBot}
        onReloadCmds={handleReloadCmds}
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'login' && (
          <WebLoginConfig
            config={config}
            onSaveConfig={handleSaveConfig}
            onStartBot={handleStartBot}
            isRunning={status?.state === 'running'}
          />
        )}

        {activeTab === 'simulator' && (
          <MessengerSimulator
            commands={commands}
            prefix={config?.prefix || ''}
            onRefreshUsers={fetchAllData}
          />
        )}

        {activeTab === 'commands' && (
          <CommandsDirectory
            commands={commands}
            prefix={config?.prefix || ''}
            onTestCommand={handleTestCommand}
          />
        )}

        {activeTab === 'users' && (
          <UsersManager
            users={users}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {activeTab === 'logs' && (
          <TerminalLogs
            logs={logs}
            onClear={handleClearLogs}
            onRefresh={fetchStatusAndLogs}
          />
        )}

        {activeTab === 'deploy' && (
          <ExportDeploy config={config} />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Nexus Facebook Messenger Bot System • Node.js & @tas33n/ws3-fca</span>
          </div>
          <div>
            Roles: 0 (All) • 1 (Bot Admin) • 2 (Owner) | Persistent JSON Storage
          </div>
        </div>
      </footer>
    </div>
  );
}
