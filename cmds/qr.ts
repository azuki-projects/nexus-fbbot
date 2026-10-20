import { CommandHandler } from '../server/types.ts';

const qrCmd: CommandHandler = {
  name: 'qr',
  description: 'Generate a high-resolution QR code link from any custom text or website link.',
  usage: '<text_or_url>',
  allownoprefix: true,
  role: 0,
  cooldown: 3,
  category: 'Tools',
  execute: async ({ args, reply, config }) => {
    if (args.length === 0) {
      return reply(`❌ Usage: ${config.prefix}qr <text or link>\nExample: ${config.prefix}qr https://facebook.com`);
    }

    const text = encodeURIComponent(args.join(' '));
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${text}`;

    return reply(
      `🏁 ══════『 QR CODE GENERATOR 』══════ 🏁\n` +
      `🔗 Content: "${args.join(' ')}"\n` +
      `📲 Scan Image URL:\n${qrUrl}\n\n` +
      `💡 Open the link above in browser or send as photo.`
    );
  }
};

export default qrCmd;
