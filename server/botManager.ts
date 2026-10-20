import fs from 'fs';
import path from 'path';
import { storage } from './storage.ts';
import {
  CommandHandler,
  BotStatus,
  BotLog,
  CommandContext,
  UserProfile,
  BotRole
} from './types.ts';

// Dynamic import helper for ws3-fca
let ws3fca: any = null;
const loadWs3Fca = async () => {
  if (!ws3fca) {
    try {
      const mod = await import('@tas33n/ws3-fca');
      ws3fca = mod.default || mod;
    } catch (err: any) {
      console.warn('[ws3-fca] Note: ws3-fca module loaded with notice:', err.message);
    }
  }
  return ws3fca;
};

export class BotManager {
  public commands: Map<string, CommandHandler> = new Map();
  private cooldowns: Map<string, number> = new Map();
  private logs: BotLog[] = [];
  private maxLogs = 500;

  private status: BotStatus = {
    state: 'stopped',
    botUID: null,
    botName: 'Nexus FB-Bot',
    uptime: 0,
    startTime: null,
    messagesProcessed: 0,
    commandsExecuted: 0,
    errorsCount: 0,
    commandCount: 0,
    lastError: null
  };

  private activeApi: any = null;
  private stopListener: (() => void) | null = null;

  constructor() {
    this.loadCommands();
    this.addLog('info', 'BotManager initialized. Scanning cmds folder...');
  }

  public getStatus(): BotStatus {
    const config = storage.getConfig();
    const uptime = this.status.startTime ? Math.floor((Date.now() - this.status.startTime) / 1000) : 0;
    return {
      ...this.status,
      botName: config.botName,
      uptime,
      commandCount: this.commands.size
    };
  }

  public getLogs(limit = 100): BotLog[] {
    return this.logs.slice(-limit);
  }

  public addLog(level: BotLog['level'], message: string, details?: any) {
    const entry: BotLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      level,
      message,
      details
    };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    // Also console log
    const timeStr = new Date(entry.timestamp).toLocaleTimeString();
    console.log(`[${timeStr}] [${level.toUpperCase()}] ${message}`);
  }

  public clearLogs() {
    this.logs = [];
  }

  public registerCommand(cmd: CommandHandler) {
    this.commands.set(cmd.name.toLowerCase(), cmd);
  }

  public async loadCommands() {
    this.commands.clear();
    const CMDS_DIR = path.join(process.cwd(), 'cmds');

    if (!fs.existsSync(CMDS_DIR)) {
      fs.mkdirSync(CMDS_DIR, { recursive: true });
    }

    try {
      const files = fs.readdirSync(CMDS_DIR).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
      for (const file of files) {
        try {
          const filePath = path.join(CMDS_DIR, file);
          const mod = await import(`file://${filePath}?t=${Date.now()}`);
          const cmd: CommandHandler = mod.default || mod;
          if (cmd && cmd.name && typeof cmd.execute === 'function') {
            this.registerCommand(cmd);
          }
        } catch (err: any) {
          this.addLog('error', `Failed to load command from cmds/${file}: ${err.message}`);
        }
      }
      this.status.commandCount = this.commands.size;
      this.addLog('info', `Successfully indexed ${this.commands.size} commands from /cmds directory.`);
    } catch (err: any) {
      this.addLog('error', `Error reading cmds directory: ${err.message}`);
    }
  }

  public getCommandsList(): CommandHandler[] {
    return Array.from(this.commands.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Core Message Dispatcher & Command Execution Pipeline
   */
  public async handleMessage(event: any, api: any, simulated = false): Promise<string[]> {
    this.status.messagesProcessed++;
    const config = storage.getConfig();
    const rawBody = (event.body || '').trim();
    if (!rawBody) return [];

    const senderID = event.senderID || '100089234123456';
    const replies: string[] = [];

    // Helper reply function
    const replyFn = async (text: string, options?: any) => {
      replies.push(text);
      if (!simulated && api && typeof api.sendMessage === 'function') {
        try {
          return await new Promise((resolve) => {
            api.sendMessage(text, event.threadID, (err: any, msgInfo: any) => {
              if (err) {
                this.addLog('error', `Send message error: ${err.message || err}`);
              }
              resolve(msgInfo);
            }, event.messageID);
          });
        } catch (err: any) {
          this.addLog('error', `FB API send failure: ${err.message}`);
        }
      }
      return null;
    };

    // Parse prefix & command name
    const prefix = config.prefix || '';
    let isCommand = false;
    let cmdName = '';
    let argsString = '';

    if (prefix && rawBody.startsWith(prefix)) {
      isCommand = true;
      const withoutPrefix = rawBody.slice(prefix.length).trim();
      const parts = withoutPrefix.split(/\s+/);
      cmdName = parts[0].toLowerCase();
      argsString = withoutPrefix.slice(parts[0].length).trim();
    } else {
      // Check for allowNoPrefix commands or global no-prefix mode
      const parts = rawBody.split(/\s+/);
      const candidateName = parts[0].toLowerCase();
      const candidate = this.commands.get(candidateName);

      if (candidate && (candidate.allownoprefix || config.allowNoPrefix || !prefix)) {
        isCommand = true;
        cmdName = candidateName;
        argsString = rawBody.slice(parts[0].length).trim();
      }
    }

    if (!isCommand || !cmdName) return [];

    const command = this.commands.get(cmdName);
    if (!command) {
      // If user explicitly used prefix, inform command not found
      if (prefix && rawBody.startsWith(prefix)) {
        await replyFn(`❌ Command "${cmdName}" not found. Type "${prefix}help" to explore all commands.`);
      }
      return replies;
    }

    // Load or create user from persistent storage
    const user = storage.getUser(senderID);

    // Permission & Role Check: 0: All, 1: Bot Admin, 2: Owner Only
    const roleLabels = ['Member (0)', 'Bot Admin (1)', 'Owner Only (2)'];
    if (user.role < command.role) {
      this.addLog('warn', `Permission denied for ${user.name} (${user.uid}) on cmd: ${command.name}`);
      await replyFn(
        `⛔ ══════『 ACCESS RESTRICTED 』══════ ⛔\n` +
        `This command requires: ${roleLabels[command.role]}\n` +
        `Your current role is:   ${roleLabels[user.role]}\n` +
        `Contact the bot owner (${config.ownerUID}) for elevation.`
      );
      return replies;
    }

    // Cooldown verification
    const cooldownKey = `${senderID}:${command.name}`;
    const now = Date.now();
    const lastExecuted = this.cooldowns.get(cooldownKey) || 0;
    const cooldownMs = (command.cooldown || 0) * 1000;

    if (user.role < 1 && now - lastExecuted < cooldownMs) {
      const remainingSec = Math.ceil((cooldownMs - (now - lastExecuted)) / 1000);
      if (config.cooldownNotice) {
        await replyFn(`⏱️ Cooldown active! Please wait ${remainingSec}s before using "${command.name}" again.`);
      }
      return replies;
    }

    // Set cooldown timestamp
    this.cooldowns.set(cooldownKey, now);

    // Parse arguments
    const args = argsString ? argsString.split(/\s+/) : [];

    // Build context
    const ctx: CommandContext = {
      api,
      event,
      args,
      user,
      usersDB: {
        getUser: (uid, name) => storage.getUser(uid, name),
        updateUser: (uid, updates) => storage.updateUser(uid, updates),
        addBalance: (uid, amount) => storage.addBalance(uid, amount),
        deductBalance: (uid, amount) => storage.deductBalance(uid, amount),
        getAllUsers: () => storage.getAllUsers(),
        save: () => storage.saveUsers()
      },
      config,
      reply: replyFn,
      commands: this.commands
    };

    // Execute command
    try {
      this.addLog('cmd', `Executing "${command.name}" for ${user.name} (Role: ${user.role}) [args: ${args.join(', ') || 'none'}]`);
      await command.execute(ctx);
      this.status.commandsExecuted++;
    } catch (err: any) {
      this.status.errorsCount++;
      this.status.lastError = err.message;
      this.addLog('error', `Execution error in "${command.name}": ${err.message}`, err.stack);
      await replyFn(`⚠️ An internal error occurred while executing "${command.name}": ${err.message}`);
    }

    return replies;
  }

  /**
   * Start Bot using @tas33n/ws3-fca with provided AppState
   */
  public async startBot(): Promise<{ success: boolean; message: string }> {
    const config = storage.getConfig();

    if (!config.appState || (Array.isArray(config.appState) && config.appState.length === 0)) {
      this.status.state = 'error';
      this.status.lastError = 'AppState is empty. Please paste your Facebook AppState JSON in the Web Login.';
      this.addLog('warn', 'Attempted to start bot without AppState credentials.');
      return {
        success: false,
        message: 'No AppState provided. Please paste your Facebook AppState JSON in the configuration panel.'
      };
    }

    this.status.state = 'connecting';
    this.addLog('info', 'Connecting to Facebook Chat Gateway via @tas33n/ws3-fca...');

    try {
      const login = await loadWs3Fca();
      if (!login) {
        throw new Error('Unable to initialize @tas33n/ws3-fca library');
      }

      return new Promise((resolve) => {
        login({ appState: config.appState }, config.loginOptions || {}, (err: any, api: any) => {
          if (err) {
            this.status.state = 'error';
            this.status.lastError = err.error || err.message || JSON.stringify(err);
            this.addLog('error', `Facebook login failed: ${this.status.lastError}`);
            return resolve({
              success: false,
              message: `Facebook Login Error: ${this.status.lastError}`
            });
          }

          this.activeApi = api;
          this.status.state = 'running';
          this.status.startTime = Date.now();
          this.status.botUID = api.getCurrentUserID ? api.getCurrentUserID() : 'Connected';
          this.addLog('info', `🎉 Bot successfully connected to Facebook! Bot UID: ${this.status.botUID}`);

          // Listen for incoming messages
          try {
            const stopListen = api.listenMqtt((listenErr: any, event: any) => {
              if (listenErr) {
                this.addLog('error', `Listener error: ${listenErr.message || listenErr}`);
                return;
              }
              if (!event) return;

              if (event.type === 'message' || event.type === 'message_reply') {
                this.handleMessage(event, api, false).catch(e => {
                  this.addLog('error', `Message handling exception: ${e.message}`);
                });
              }
            });
            this.stopListener = stopListen;
          } catch (e: any) {
            this.addLog('warn', `MQTT listener fallback notice: ${e.message}`);
          }

          resolve({
            success: true,
            message: `Bot connected successfully as UID ${this.status.botUID}`
          });
        });
      });
    } catch (err: any) {
      this.status.state = 'error';
      this.status.lastError = err.message;
      this.addLog('error', `Bot startup failure: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  /**
   * Stop running bot cleanly
   */
  public async stopBot(): Promise<{ success: boolean; message: string }> {
    if (this.stopListener) {
      try {
        this.stopListener();
      } catch (e) {
        // ignore
      }
      this.stopListener = null;
    }

    if (this.activeApi && typeof this.activeApi.logout === 'function') {
      try {
        this.activeApi.logout();
      } catch (e) {
        // ignore
      }
    }

    this.activeApi = null;
    this.status.state = 'stopped';
    this.status.startTime = null;
    this.addLog('info', 'Bot stopped cleanly by operator.');
    return { success: true, message: 'Bot stopped successfully.' };
  }

  /**
   * Interactive Simulator: Test any command with immediate response
   */
  public async simulateMessage(params: {
    senderID: string;
    senderName?: string;
    body: string;
    role?: BotRole;
  }): Promise<{ replies: string[]; user: UserProfile }> {
    const { senderID, senderName, body, role } = params;

    const user = storage.getUser(senderID, senderName);
    if (typeof role === 'number') {
      user.role = role;
      storage.updateUser(senderID, { role });
    }

    const mockEvent = {
      type: 'message',
      senderID,
      threadID: 'sim_thread_123',
      messageID: 'mid.' + Date.now(),
      body,
      isGroup: false,
      mentions: {}
    };

    const mockApi = {
      getCurrentUserID: () => '100088899900011',
      sendMessage: (_text: any, _tid: any, cb: any) => {
        if (cb) cb(null, { messageID: 'mid.sim_reply_' + Date.now() });
      }
    };

    const replies = await this.handleMessage(mockEvent, mockApi, true);
    const updatedUser = storage.getUser(senderID);
    return { replies, user: updatedUser };
  }
}

export const botManager = new BotManager();
