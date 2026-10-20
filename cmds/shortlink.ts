import { CommandHandler } from '../server/types.ts';

const shortlinkCmd: CommandHandler = {
  name: 'shortlink',
  description: 'Shorten any long internet URL using the free TinyURL engine.',
  usage: '<url>',
  allownoprefix: true,
  role: 0,
  cooldown: 4,
  category: 'Tools',
  execute: async ({ args, reply, config }) => {
    if (args.length === 0) {
      return reply(`❌ Usage: ${config.prefix}shortlink <url>\nExample: ${config.prefix}shortlink https://github.com/tas33n/ws3-fca`);
    }

    const targetUrl = args[0];
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(targetUrl)}`);
      if (!res.ok) throw new Error('API failed');
      const shortUrl = await res.text();

      return reply(
        `🔗 ══════『 LINK SHORTENER 』══════ 🔗\n` +
        `🌐 Original: ${targetUrl.slice(0, 50)}${targetUrl.length > 50 ? '...' : ''}\n` +
        `⚡ Short URL: ${shortUrl}`
      );
    } catch {
      return reply(`❌ Failed to shorten URL. Make sure it starts with http:// or https://`);
    }
  }
};

export default shortlinkCmd;
