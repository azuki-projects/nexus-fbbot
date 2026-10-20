import { CommandHandler } from '../server/types.ts';

const currencyRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 154.5,
  PHP: 57.8,
  CAD: 1.38,
  AUD: 1.52,
  SGD: 1.35,
  INR: 84.1,
  THB: 36.7,
  VND: 25400
};

const currencyCmd: CommandHandler = {
  name: 'currency',
  description: 'Convert amounts between major world fiat currencies with real-time baseline rates.',
  usage: '<amount> <from> <to>',
  allownoprefix: true,
  role: 0,
  cooldown: 3,
  category: 'Tools',
  execute: async ({ args, reply, config }) => {
    if (args.length < 3) {
      const supported = Object.keys(currencyRates).join(', ');
      return reply(
        `💱 ══════『 CURRENCY CONVERTER 』══════ 💱\n` +
        `Usage: ${config.prefix}currency <amount> <from> <to>\n` +
        `Example: ${config.prefix}currency 100 USD PHP\n` +
        `Supported: ${supported}`
      );
    }

    const amount = parseFloat(args[0]);
    const from = args[1].toUpperCase();
    const to = args[2].toUpperCase();

    if (isNaN(amount) || amount <= 0) {
      return reply(`❌ Invalid amount.`);
    }

    const rateFrom = currencyRates[from];
    const rateTo = currencyRates[to];

    if (!rateFrom || !rateTo) {
      return reply(`❌ Unsupported currency code. Available: ${Object.keys(currencyRates).join(', ')}`);
    }

    // Convert: amount in USD = amount / rateFrom, then * rateTo
    const converted = (amount / rateFrom) * rateTo;

    return reply(
      `💱 ══════『 CONVERSION RESULT 』══════ 💱\n` +
      `  💵 From: ${amount.toLocaleString()} ${from}\n` +
      `  🎯 To:   ${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}\n` +
      `  📊 Rate: 1 ${from} = ${(rateTo / rateFrom).toFixed(4)} ${to}\n` +
      `═══════════════════════════════════`
    );
  }
};

export default currencyCmd;
