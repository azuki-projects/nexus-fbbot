import { CommandHandler } from '../server/types.ts';
import { storage } from '../server/storage.ts';

const setprefixCmd: CommandHandler = {
  name: 'setprefix',
  description: 'Change the bot command prefix or disable prefix requirement entirely (set to none).',
  usage: '<new_prefix | none>',
  allownoprefix: false,
  role: 1, // Admin or Owner
  cooldown: 3,
  category: 'Admin',
  execute: async ({ args, reply, config }) => {
    if (args.length === 0) {
      return reply(
        `⚙️ Current Prefix: "${config.prefix || '(none)'}"\n` +
        `💡 Usage: ${config.prefix}setprefix <symbol | none>\n` +
        `Examples:\n• ${config.prefix}setprefix !\n• ${config.prefix}setprefix /\n• ${config.prefix}setprefix none`
      );
    }

    const input = args[0].trim();
    if (input.toLowerCase() === 'none' || input.toLowerCase() === 'clear' || input.toLowerCase() === 'noprefix') {
      config.prefix = '';
      config.allowNoPrefix = true;
      storage.updateConfig({ prefix: '', allowNoPrefix: true });
      return reply(`✅ Prefix cleared! The bot now operates in NO-PREFIX mode (commands run directly).`);
    }

    if (input.length > 5) {
      return reply(`❌ Prefix must be between 1 and 5 characters.`);
    }

    config.prefix = input;
    storage.updateConfig({ prefix: input });

    return reply(
      `✅ Prefix updated successfully!\n` +
      `🔑 New command prefix is now: "${input}"\n` +
      `✨ Example: ${input}help`
    );
  }
};

export default setprefixCmd;
