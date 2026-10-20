import { CommandHandler } from '../server/types.ts';

const wordcountCmd: CommandHandler = {
  name: 'wordcount',
  description: 'Analyze any paragraph: word count, character count, sentence count, and reading duration.',
  usage: '<text>',
  allownoprefix: true,
  role: 0,
  cooldown: 2,
  category: 'Tools',
  execute: async ({ args, reply, config }) => {
    if (args.length === 0) {
      return reply(`❌ Usage: ${config.prefix}wordcount <paste text>\nExample: ${config.prefix}wordcount The quick brown fox jumps over the lazy dog.`);
    }

    const text = args.join(' ');
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s+/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
    const estimatedMinutes = Math.max(1, Math.round(words / 200));

    const card = [
      `📊 ══════『 TEXT ANALYSIS 』══════ 📊`,
      `  📝 Word Count:       ${words}`,
      `  🔤 Characters (all): ${charsWithSpaces}`,
      `  🔡 Characters (raw): ${charsNoSpaces}`,
      `  📑 Sentences:        ${sentences}`,
      `  ⏱️ Est. Reading:     ~${estimatedMinutes} min`,
      `══════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default wordcountCmd;
