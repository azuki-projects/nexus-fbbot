import { CommandHandler } from '../server/types.ts';

const defineCmd: CommandHandler = {
  name: 'define',
  description: 'Lookup English dictionary definitions, word phonetics, part of speech, and usage.',
  usage: '<word>',
  allownoprefix: true,
  role: 0,
  cooldown: 4,
  category: 'Tools',
  execute: async ({ args, reply, config }) => {
    if (args.length === 0) {
      return reply(`❌ Usage: ${config.prefix}define <word>\nExample: ${config.prefix}define serendipity`);
    }

    const word = args[0].toLowerCase().trim();
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) {
        return reply(`❌ Could not find a dictionary entry for "${word}".`);
      }
      const data = await res.json();
      const entry = data[0];
      const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics[0]?.text) || '';
      const meaning = entry.meanings[0];
      const partOfSpeech = meaning ? meaning.partOfSpeech : 'noun';
      const def = meaning?.definitions[0]?.definition || 'No definition available.';
      const example = meaning?.definitions[0]?.example;

      const card = [
        `📖 ══════『 DICTIONARY 』══════ 📖`,
        `  🔤 Word: ${entry.word.toUpperCase()} ${phonetic ? `(${phonetic})` : ''}`,
        `  🏷️ Part of Speech: [ ${partOfSpeech} ]`,
        `  📝 Definition: ${def}`,
        example ? `  💬 Example: "${example}"` : '',
        `═════════════════════════════════`
      ].filter(Boolean).join('\n');

      return reply(card);
    } catch {
      return reply(`❌ Dictionary service temporarily unreachable.`);
    }
  }
};

export default defineCmd;
