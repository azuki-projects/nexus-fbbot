import fs from 'fs';
import path from 'path';
import { BotConfig, UserProfile, BotRole } from './types.ts';

const ROOT_DIR = process.cwd();
const CONFIG_PATH = path.join(ROOT_DIR, 'config.json');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const USERS_PATH = path.join(DATA_DIR, 'users.json');
const THREADS_PATH = path.join(DATA_DIR, 'threads.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class StorageManager {
  private config: BotConfig;
  private users: Map<string, UserProfile> = new Map();
  private threads: Map<string, any> = new Map();

  constructor() {
    this.config = this.loadConfig();
    this.loadUsers();
    this.loadThreads();
  }

  public getConfig(): BotConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<BotConfig>): BotConfig {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    return this.getConfig();
  }

  private loadConfig(): BotConfig {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[Storage] Error loading config.json:', err);
    }

    const defaultConfig: BotConfig = {
      botName: 'Nexus FB-Bot',
      ownerUID: '100089234123456',
      adminUIDs: ['100089234123456'],
      prefix: '!',
      allowNoPrefix: false,
      appState: [],
      loginOptions: {
        listenEvents: true,
        selfListen: false,
        logLevel: 'silent',
        updatePresence: true,
        forceLogin: false,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      autoRestart: true,
      cooldownNotice: true
    };
    this.saveConfigDirect(defaultConfig);
    return defaultConfig;
  }

  private saveConfig(): void {
    this.saveConfigDirect(this.config);
  }

  private saveConfigDirect(cfg: BotConfig): void {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error saving config.json:', err);
    }
  }

  private loadUsers(): void {
    try {
      if (fs.existsSync(USERS_PATH)) {
        const raw = fs.readFileSync(USERS_PATH, 'utf-8');
        const data = JSON.parse(raw);
        for (const [uid, user] of Object.entries(data)) {
          this.users.set(uid, user as UserProfile);
        }
      }
    } catch (err) {
      console.error('[Storage] Error loading users.json:', err);
    }
  }

  public saveUsers(): void {
    try {
      const obj: Record<string, UserProfile> = {};
      for (const [uid, user] of this.users.entries()) {
        obj[uid] = user;
      }
      fs.writeFileSync(USERS_PATH, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error saving users.json:', err);
    }
  }

  private loadThreads(): void {
    try {
      if (fs.existsSync(THREADS_PATH)) {
        const raw = fs.readFileSync(THREADS_PATH, 'utf-8');
        const data = JSON.parse(raw);
        for (const [tid, thread] of Object.entries(data)) {
          this.threads.set(tid, thread);
        }
      }
    } catch (err) {
      console.error('[Storage] Error loading threads.json:', err);
    }
  }

  public saveThreads(): void {
    try {
      const obj: Record<string, any> = {};
      for (const [tid, thread] of this.threads.entries()) {
        obj[tid] = thread;
      }
      fs.writeFileSync(THREADS_PATH, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error saving threads.json:', err);
    }
  }

  public getUser(uid: string, name?: string): UserProfile {
    let user = this.users.get(uid);
    if (!user) {
      // Determine default role based on config
      let initialRole: BotRole = 0;
      if (uid === this.config.ownerUID) {
        initialRole = 2;
      } else if (this.config.adminUIDs.includes(uid)) {
        initialRole = 1;
      }

      user = {
        uid,
        name: name || `User_${uid.slice(-4)}`,
        role: initialRole,
        balance: 1000, // starter balance
        bank: 500,
        exp: 0,
        level: 1,
        dailyStreak: 0,
        lastDaily: 0,
        lastWork: 0,
        lastRob: 0,
        lastMine: 0,
        lastFish: 0,
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          totalEarned: 0
        },
        inventory: {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      this.users.set(uid, user);
      this.saveUsers();
    } else {
      // Always sync owner role
      if (uid === this.config.ownerUID && user.role !== 2) {
        user.role = 2;
      } else if (this.config.adminUIDs.includes(uid) && user.role === 0) {
        user.role = 1;
      }
      if (name && (!user.name || user.name.startsWith('User_'))) {
        user.name = name;
        user.updatedAt = Date.now();
        this.saveUsers();
      }
    }
    return user;
  }

  public updateUser(uid: string, updates: Partial<UserProfile>): UserProfile {
    const user = this.getUser(uid);
    Object.assign(user, updates, { updatedAt: Date.now() });
    this.users.set(uid, user);
    this.saveUsers();
    return user;
  }

  public addBalance(uid: string, amount: number): UserProfile {
    const user = this.getUser(uid);
    user.balance = Math.max(0, user.balance + amount);
    if (amount > 0) {
      user.stats.totalEarned += amount;
      user.exp += Math.floor(amount / 10);
      const newLevel = Math.floor(Math.sqrt(user.exp / 50)) + 1;
      user.level = Math.max(user.level, newLevel);
    }
    user.updatedAt = Date.now();
    this.saveUsers();
    return user;
  }

  public deductBalance(uid: string, amount: number): boolean {
    const user = this.getUser(uid);
    if (user.balance < amount) return false;
    user.balance -= amount;
    user.updatedAt = Date.now();
    this.saveUsers();
    return true;
  }

  public getAllUsers(): UserProfile[] {
    return Array.from(this.users.values()).sort((a, b) => (b.balance + b.bank) - (a.balance + a.bank));
  }
}

export const storage = new StorageManager();
