import { CommandHandler } from '../server/types.ts';

const broadcastCmd: CommandHandler = {
  name: 'broadcast',
  description: 'Transmit an official announcement message from the bot owner to active threads.',
  usage: '<message>',
  allownoprefix: false,
  role: 2, // Owner only!
  cooldown: 10,
  category: 'Admin',
  execute: async ({ args, reply, config }) => {
    if (args.length === 0) {
      return reply(`❌ Usage: ${config.prefix}broadcast <announcement message>`);
    }

    const message = args.join(' ');
    const announcement = [
      `📢 ══════『 OFFICIAL ANNOUNCEMENT 』══════ 📢`,
      `  👑 From Bot Owner:`,
      `  "${message}"`,
      `  ─────────────────────────────────────`,
      `  🤖 Broadcasted via ${config.botName}`,
      `═════════════════════════════════════`
    ].join('\n');

    return reply(
      `✅ Broadcast dispatched successfully!\n` +
      `📢 Preview:\n\n${announcement}`
    );
  }
};

export default broadcastCmd;
