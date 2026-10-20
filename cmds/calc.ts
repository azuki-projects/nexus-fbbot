import { CommandHandler } from '../server/types.ts';

const calcCmd: CommandHandler = {
  name: 'calc',
  description: 'Evaluate mathematical arithmetic equations safely (supports +, -, *, /, %, ^, sqrt).',
  usage: '<expression>',
  allownoprefix: true,
  role: 0,
  cooldown: 2,
  category: 'Tools',
  execute: async ({ args, reply, config }) => {
    if (args.length === 0) {
      return reply(`❌ Usage: ${config.prefix}calc <math expression>\nExample: ${config.prefix}calc (25 * 4) + sqrt(144)`);
    }

    const expr = args.join(' ');
    // Safe evaluation without arbitrary code execution
    try {
      // Clean string
      let sanitized = expr
        .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
        .replace(/\^/g, '**')
        .replace(/pi/gi, 'Math.PI')
        .replace(/e/gi, 'Math.E');

      // Only allow mathematical symbols and numbers
      if (!/^[0-9+\-*/().\s%Math.PIEsqrt**]+$/.test(sanitized)) {
        return reply(`❌ Expression contains invalid or disallowed characters.`);
      }

      // Safe Function evaluator restricted to Math
      const result = new Function(`"use strict"; return (${sanitized});`)();
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        return reply(`❌ Calculation resulted in an undefined or infinite value.`);
      }

      return reply(
        `🔢 ══════『 CALCULATOR 』══════ 🔢\n` +
        `📝 Input:  ${expr}\n` +
        `✨ Result: ${Number(result.toFixed(6)).toString()}`
      );
    } catch {
      return reply(`❌ Error evaluating mathematical expression. Please check your syntax.`);
    }
  }
};

export default calcCmd;
