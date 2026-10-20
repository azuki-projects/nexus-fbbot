import { CommandHandler } from '../server/types.ts';
import crypto from 'crypto';

const passwordCmd: CommandHandler = {
  name: 'password',
  description: 'Generate high-entropy, cryptographically strong random passwords.',
  usage: '[length (8-32)]',
  allownoprefix: true,
  role: 0,
  cooldown: 3,
  category: 'Tools',
  execute: async ({ args, reply }) => {
    let length = parseInt(args[0] || '16', 10);
    if (isNaN(length) || length < 8) length = 16;
    if (length > 32) length = 32;

    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*()_+~';
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }

    return reply(
      `🔑 ══════『 SECURE PASSWORD 』══════ 🔑\n` +
      `🛡️ Length: ${length} characters\n` +
      `🔐 Generated: ${result}\n\n` +
      `⚠️ Never share your private credentials with anyone.`
    );
  }
};

export default passwordCmd;
