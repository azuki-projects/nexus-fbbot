import { CommandHandler } from '../server/types.ts';

const flipMap: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ',
  j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ',
  s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: '𐐒', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I',
  J: 'ſ', K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ',
  S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ',
  '8': '8', '9': '6', '0': '0', '.': '˙', ',': "'", "'": ',', '?': '¿',
  '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
  '<': '>', '>': '<', '&': '⅋', '_': '‾'
};

const fliptextCmd: CommandHandler = {
  name: 'fliptext',
  description: 'Flip text upside down (¿uʍop ǝpᴉsdn) or reverse text characters.',
  usage: '<text>',
  allownoprefix: true,
  role: 0,
  cooldown: 2,
  category: 'Tools',
  execute: async ({ args, reply, config }) => {
    if (args.length === 0) {
      return reply(`❌ Usage: ${config.prefix}fliptext <text>\nExample: ${config.prefix}fliptext Hello world`);
    }

    const text = args.join(' ');
    const flipped = text.split('').map(c => flipMap[c] || c).reverse().join('');
    const reversed = text.split('').reverse().join('');

    return reply(
      `🙃 ══════『 FLIP TEXT 』══════ 🙃\n` +
      `📥 Normal:   ${text}\n` +
      `🔄 Upside:  ${flipped}\n` +
      `⏪ Reversed: ${reversed}`
    );
  }
};

export default fliptextCmd;
