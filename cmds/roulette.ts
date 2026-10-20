import { CommandHandler } from '../server/types.ts';

const rouletteCmd: CommandHandler = {
  name: 'roulette',
  description: 'Spin the roulette wheel! Bet on red, black, odd, even, or exact numbers (0-36).',
  usage: '<red|black|odd|even|0-36> <bet_amount>',
  allownoprefix: false,
  role: 0,
  cooldown: 5,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    if (args.length < 2) {
      return reply(
        `❌ Missing arguments!\nUsage: ${config.prefix}roulette <choice> <bet>\n` +
        `Examples:\n• ${config.prefix}roulette red 200 (Pays 2x)\n• ${config.prefix}roulette 17 50 (Pays 36x)`
      );
    }

    const choice = args[0].toLowerCase();
    const bet = parseInt(args[1], 10);

    if (isNaN(bet) || bet <= 0) {
      return reply(`❌ Invalid bet amount.`);
    }
    if (user.balance < bet) {
      return reply(`❌ Insufficient balance ($${user.balance.toLocaleString()}).`);
    }

    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const landedNumber = Math.floor(Math.random() * 37); // 0 - 36
    const landedColor = landedNumber === 0 ? 'green' : redNumbers.includes(landedNumber) ? 'red' : 'black';
    const isEven = landedNumber !== 0 && landedNumber % 2 === 0;
    const isOdd = landedNumber !== 0 && landedNumber % 2 !== 0;

    usersDB.deductBalance(user.uid, bet);

    let won = false;
    let multiplier = 0;

    if (choice === 'red' && landedColor === 'red') {
      won = true;
      multiplier = 2;
    } else if (choice === 'black' && landedColor === 'black') {
      won = true;
      multiplier = 2;
    } else if (choice === 'even' && isEven) {
      won = true;
      multiplier = 2;
    } else if (choice === 'odd' && isOdd) {
      won = true;
      multiplier = 2;
    } else if (!isNaN(parseInt(choice, 10)) && parseInt(choice, 10) === landedNumber) {
      won = true;
      multiplier = 36;
    }

    user.stats.gamesPlayed += 1;
    let payout = 0;
    let verdict = '';

    if (won) {
      payout = bet * multiplier;
      usersDB.addBalance(user.uid, payout);
      user.stats.gamesWon += 1;
      verdict = `🎉 BINGO! Multiplier: ${multiplier}x\n💰 Won: +$${payout.toLocaleString()}`;
    } else {
      verdict = `💀 HOUSE WINS! Lost: -$${bet.toLocaleString()}`;
    }

    usersDB.updateUser(user.uid, { stats: user.stats });

    const colorEmoji = landedColor === 'red' ? '🔴 RED' : landedColor === 'black' ? '⚫ BLACK' : '🟢 ZERO (Green)';
    const spinMsg = [
      `🎡 ══════『 ROULETTE WHEEL 』══════ 🎡`,
      `  🎯 Your Bet: [ ${choice.toUpperCase()} ] on $${bet.toLocaleString()}`,
      `  ⚪ Marble ball spinning... *rattles*`,
      `  🏁 Ball settled on: [ ${landedNumber} ] ${colorEmoji}`,
      `  ──────────────────────────────`,
      `  ${verdict}`,
      `  💵 Balance: $${(user.balance - bet + payout).toLocaleString()}`,
      `═══════════════════════════════`
    ].join('\n');

    return reply(spinMsg);
  }
};

export default rouletteCmd;
