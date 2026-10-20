import { CommandHandler } from '../server/types.ts';

const diceCmd: CommandHandler = {
  name: 'dice',
  description: 'Roll high-stakes dice against the bot dealer. Highest roll takes the pot!',
  usage: '[bet_amount]',
  allownoprefix: false,
  role: 0,
  cooldown: 4,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    const bet = parseInt(args[0] || '100', 10);
    if (isNaN(bet) || bet <= 0) {
      return reply(`❌ Invalid bet amount. Usage: ${config.prefix}dice [bet]`);
    }
    if (user.balance < bet) {
      return reply(`❌ You don't have enough money ($${user.balance.toLocaleString()}).`);
    }

    usersDB.deductBalance(user.uid, bet);

    const diceIcons = ['⚀ (1)', '⚁ (2)', '⚂ (3)', '⚃ (4)', '⚄ (5)', '⚅ (6)'];
    const p1 = Math.floor(Math.random() * 6) + 1;
    const p2 = Math.floor(Math.random() * 6) + 1;
    const playerTotal = p1 + p2;

    const b1 = Math.floor(Math.random() * 6) + 1;
    const b2 = Math.floor(Math.random() * 6) + 1;
    const botTotal = b1 + b2;

    user.stats.gamesPlayed += 1;
    let verdict = '';
    let newBal = user.balance - bet;

    if (playerTotal > botTotal) {
      const payout = bet * 2;
      usersDB.addBalance(user.uid, payout);
      user.stats.gamesWon += 1;
      newBal += payout;
      verdict = `🎉 YOU WON! Dealer rolled lower.\n💰 Payout: +$${payout.toLocaleString()}`;
    } else if (playerTotal < botTotal) {
      verdict = `💀 DEALER WON! You lost $${bet.toLocaleString()}.`;
    } else {
      // Tie -> return bet
      usersDB.addBalance(user.uid, bet);
      newBal += bet;
      verdict = `🤝 DRAW! Bets returned ($${bet.toLocaleString()}).`;
    }

    usersDB.updateUser(user.uid, { stats: user.stats });

    const msg = [
      `🎲 ═══════『 DICE DUEL 』═══════ 🎲`,
      `  👤 Your Roll:   ${diceIcons[p1 - 1]} + ${diceIcons[p2 - 1]} = 💥 ${playerTotal}`,
      `  🤖 Dealer Roll: ${diceIcons[b1 - 1]} + ${diceIcons[b2 - 1]} = 🛡️ ${botTotal}`,
      `  ──────────────────────────────`,
      `  ${verdict}`,
      `  💵 New Balance: $${newBal.toLocaleString()}`,
      `════════════════════════════════`
    ].join('\n');

    return reply(msg);
  }
};

export default diceCmd;
