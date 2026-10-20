export type BotRole = 0 | 1 | 2;

export interface CommandMetadata {
  name: string;
  description: string;
  usage: string;
  allownoprefix: boolean;
  role: BotRole;
  cooldown: number;
  category: 'Games' | 'Tools' | 'Economy' | 'Admin' | 'General';
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  totalEarned: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  role: BotRole;
  balance: number;
  bank: number;
  exp: number;
  level: number;
  dailyStreak: number;
  lastDaily: number;
  lastWork: number;
  lastRob: number;
  lastMine: number;
  lastFish: number;
  stats: UserStats;
  inventory: Record<string, Record<string, number>>;
  createdAt: number;
  updatedAt: number;
}

export interface BotConfig {
  botName: string;
  ownerUID: string;
  adminUIDs: string[];
  prefix: string;
  allowNoPrefix: boolean;
  appState: any[];
  loginOptions: {
    listenEvents: boolean;
    selfListen: boolean;
    logLevel: 'silent' | 'info' | 'warn' | 'error';
    updatePresence: boolean;
    forceLogin: boolean;
    userAgent: string;
  };
  autoRestart: boolean;
  cooldownNotice: boolean;
}

export interface BotLog {
  id: string;
  timestamp: number;
  level: 'info' | 'cmd' | 'warn' | 'error' | 'event';
  message: string;
  details?: any;
}

export interface BotStatus {
  state: 'stopped' | 'running' | 'connecting' | 'error';
  botUID: string | null;
  botName: string;
  uptime: number;
  startTime: number | null;
  messagesProcessed: number;
  commandsExecuted: number;
  errorsCount: number;
  commandCount: number;
  lastError: string | null;
}
