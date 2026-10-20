import { CommandHandler } from '../server/types.ts';

const coinflipCmd: CommandHandler = {
  name: 'coinflip',
  description: 'Flip a shiny gold coin on Heads or Tails with double or nothing stakes.',
  usage: '<heads|tails> [bet_amount]',
  allownoprefix: false,
  role: 0,
  cooldown: 4,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'heads' && choice !== 'tails' && choice !== 'h' && choice !== 't') {
      return reply(`❌ Invalid call! Usage: ${config.prefix}coinflip <heads|tails> [bet]\nExample: ${config.prefix}coinflip heads 500`);
    }

    const predicted = (choice === 'heads' || choice === 'h') ? 'heads' : 'tails';
    const bet = parseInt(args[1] || '100', 10);
    if (isNaN(bet) || bet <= 0) {
      return reply(`❌ Invalid bet amount.`);
    }
    if (user.balance < bet) {
      return reply(`❌ Insufficient funds! You only have $${user.balance.toLocaleString()}.`);
    }

    usersDB.deductBalance(user.uid, bet);
    const flipped = Math.random() < 0.5 ? 'heads' : 'tails';
    const icon = flipped === 'heads' ? '🪙 [HEADS - Eagle]' : '🪙 [TAILS - Shield]';
    const won = predicted === flipped;

    user.stats.gamesPlayed += 1;
    let resultMsg = '';

    if (won) {
      const payout = bet * 2;
      usersDB.addBalance(user.uid, payout);
      user.stats.gamesWon += 1;
      resultMsg = `🎉 VICTORY! You guessed correctly!\n💰 Payout: +$${payout.toLocaleString()} (Net +$${bet.toLocaleString()})`;
    } else {
      resultMsg = `💀 DEFEAT! The coin favored the house.\n💸 Loss: -$${bet.toLocaleString()}`;
    }

    usersDB.updateUser(user.uid, { stats: user.stats });

    const card = [
      `🪙 ═════『 COIN TOSS 』═════ 🪙`,
      `  🎯 Your Prediction: ${predicted.toUpperCase()}`,
      `  💨 Coin in the air... *CLINK*`,
      `  🎲 Landed on: ${icon}`,
      `  ──────────────────────────`,
      `  ${resultMsg}`,
      `  💵 Current Balance: $${(won ? user.balance + bet : user.balance - bet).toLocaleString()}`,
      `════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default coinflipCmd;
