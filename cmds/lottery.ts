import { CommandHandler } from '../server/types.ts';

const lotteryCmd: CommandHandler = {
  name: 'lottery',
  description: 'Participate in the high-stakes Mega Lotto draw. Pick 3 lucky numbers between 1-20.',
  usage: '<n1> <n2> <n3>',
  allownoprefix: false,
  role: 0,
  cooldown: 8,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    if (args.length < 3) {
      return reply(
        `🎟️ ══════『 MEGA LOTTO 』══════ 🎟️\n` +
        `Ticket Cost: $300\n` +
        `Pick 3 distinct numbers from 1 to 20.\n` +
        `💡 Usage: ${config.prefix}lottery 3 7 19\n` +
        `🏆 3 Matches: $25,000 | 2 Matches: $2,500 | 1 Match: $300`
      );
    }

    const ticketPrice = 300;
    if (user.balance < ticketPrice) {
      return reply(`❌ Ticket costs $${ticketPrice}. You have $${user.balance.toLocaleString()}.`);
    }

    const n1 = parseInt(args[0], 10);
    const n2 = parseInt(args[1], 10);
    const n3 = parseInt(args[2], 10);

    if ([n1, n2, n3].some(n => isNaN(n) || n < 1 || n > 20)) {
      return reply(`❌ Numbers must be integers between 1 and 20.`);
    }

    usersDB.deductBalance(user.uid, ticketPrice);

    // Draw 3 unique winning numbers
    const pool = Array.from({ length: 20 }, (_, i) => i + 1);
    pool.sort(() => Math.random() - 0.5);
    const drawn = [pool[0], pool[1], pool[2]].sort((a, b) => a - b);

    const playerPicks = [n1, n2, n3].sort((a, b) => a - b);
    const matches = playerPicks.filter(n => drawn.includes(n));

    let payout = 0;
    let prizeTier = '';

    if (matches.length === 3) {
      payout = 25000;
      prizeTier = '🥇 GRAND JACKPOT WINNER (3/3 Matches)!';
    } else if (matches.length === 2) {
      payout = 2500;
      prizeTier = '🥈 SECOND TIER WINNER (2/3 Matches)!';
    } else if (matches.length === 1) {
      payout = 300;
      prizeTier = '🥉 FREE TICKET REFUND (1/3 Match)!';
    }

    user.stats.gamesPlayed += 1;
    let result = '';

    if (payout > 0) {
      usersDB.addBalance(user.uid, payout);
      user.stats.gamesWon += 1;
      result = `🎉 ${prizeTier}\n💰 Payout: +$${payout.toLocaleString()}`;
    } else {
      result = `💔 No matches drawn. Lost: -$${ticketPrice}`;
    }

    usersDB.updateUser(user.uid, { stats: user.stats });

    const card = [
      `🎟️ ══════『 MEGA LOTTO DRAW 』══════ 🎟️`,
      `  🎫 Your Ticket: [ ${playerPicks.join(' - ')} ]`,
      `  🎰 Winning Balls: [ ${drawn.join(' - ')} ]`,
      `  ⭐ Matched: ${matches.length > 0 ? matches.join(', ') : 'None'} (${matches.length}/3)`,
      `  ─────────────────────────────────`,
      `  ${result}`,
      `  💵 Balance: $${(user.balance - ticketPrice + payout).toLocaleString()}`,
      `═════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default lotteryCmd;
