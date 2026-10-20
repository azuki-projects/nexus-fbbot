export type BotRole = 0 | 1 | 2; // 0: All, 1: Bot Admin, 2: Owner Only

export interface CommandMetadata {
  name: string;
  description: string;
  usage: string;
  allownoprefix: boolean;
  role: BotRole;
  cooldown: number; // in seconds
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
  prefix: string; // "" means no prefix required by default
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

export interface CommandContext {
  api: any;
  event: {
    type: string;
    senderID: string;
    threadID: string;
    messageID: string;
    body: string;
    isGroup?: boolean;
    mentions?: Record<string, string>;
    messageReply?: {
      messageID: string;
      senderID: string;
      body: string;
    };
    attachments?: any[];
  };
  args: string[];
  user: UserProfile;
  usersDB: {
    getUser: (uid: string, name?: string) => UserProfile;
    updateUser: (uid: string, updates: Partial<UserProfile>) => UserProfile;
    addBalance: (uid: string, amount: number) => UserProfile;
    deductBalance: (uid: string, amount: number) => boolean;
    getAllUsers: () => UserProfile[];
    save: () => void;
  };
  config: BotConfig;
  reply: (text: string, options?: any) => Promise<any>;
  commands: Map<string, CommandHandler>;
}

export interface CommandHandler extends CommandMetadata {
  execute: (ctx: CommandContext) => Promise<any> | any;
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
