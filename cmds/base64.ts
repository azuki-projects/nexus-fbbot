import { CommandHandler } from '../server/types.ts';

const base64Cmd: CommandHandler = {
  name: 'base64',
  description: 'Encode text into Base64 format or decode existing Base64 strings.',
  usage: '<encode|decode> <text>',
  allownoprefix: true,
  role: 0,
  cooldown: 2,
  category: 'Tools',
  execute: async ({ args, reply, config }) => {
    if (args.length < 2) {
      return reply(
        `❌ Usage: ${config.prefix}base64 <encode|decode> <text>\n` +
        `Examples:\n• ${config.prefix}base64 encode Hello World\n• ${config.prefix}base64 decode SGVsbG8gV29ybGQ=`
      );
    }

    const action = args[0].toLowerCase();
    const content = args.slice(1).join(' ');

    if (action === 'encode' || action === 'enc') {
      const encoded = Buffer.from(content, 'utf-8').toString('base64');
      return reply(
        `🔒 ══════『 BASE64 ENCODE 』══════ 🔒\n` +
        `📥 Input:  ${content}\n` +
        `📤 Output: ${encoded}`
      );
    } else if (action === 'decode' || action === 'dec') {
      try {
        const decoded = Buffer.from(content, 'base64').toString('utf-8');
        return reply(
          `🔓 ══════『 BASE64 DECODE 』══════ 🔓\n` +
          `📥 Base64: ${content}\n` +
          `📤 Decoded Text: ${decoded}`
        );
      } catch {
        return reply(`❌ Failed to decode Base64 string. Invalid encoding.`);
      }
    } else {
      return reply(`❌ Invalid action. Choose "encode" or "decode".`);
    }
  }
};

export default base64Cmd;
