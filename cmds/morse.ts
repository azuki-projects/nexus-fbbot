import { CommandHandler } from '../server/types.ts';

const morseMap: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.', '0': '-----', ' ': '/'
};

const reverseMorse: Record<string, string> = {};
for (const [char, code] of Object.entries(morseMap)) {
  reverseMorse[code] = char;
}

const morseCmd: CommandHandler = {
  name: 'morse',
  description: 'Convert plain text into Morse code (• -) or translate Morse back into English.',
  usage: '<text_or_morse>',
  allownoprefix: true,
  role: 0,
  cooldown: 2,
  category: 'Tools',
  execute: async ({ args, reply, config }) => {
    if (args.length === 0) {
      return reply(`❌ Usage: ${config.prefix}morse <text>\nExample: ${config.prefix}morse SOS`);
    }

    const input = args.join(' ').trim();
    // Check if input is Morse code (contains only . - / spaces)
    const isMorse = /^[.\-/\s]+$/.test(input);

    if (isMorse) {
      const tokens = input.split(' ');
      const decoded = tokens.map(t => reverseMorse[t] || (t === '/' ? ' ' : '?')).join('');
      return reply(
        `📡 ══════『 MORSE DECODER 』══════ 📡\n` +
        `📥 Morse: ${input}\n` +
        `📤 English: ${decoded}`
      );
    } else {
      const upper = input.toUpperCase();
      const encoded = upper.split('').map(c => morseMap[c] || c).join(' ');
      return reply(
        `📡 ══════『 MORSE ENCODER 』══════ 📡\n` +
        `📥 Text:  ${input}\n` +
        `📤 Morse: ${encoded}`
      );
    }
  }
};

export default morseCmd;
