import { CommandHandler } from '../server/types.ts';

const rpsCmd: CommandHandler = {
  name: 'rps',
  description: 'Classic Rock-Paper-Scissors clash against the AI bot with wager.',
  usage: '<rock|paper|scissors> [bet_amount]',
  allownoprefix: false,
  role: 0,
  cooldown: 4,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    const rawChoice = (args[0] || '').toLowerCase();
    const map: Record<string, string> = {
      'r': 'rock', 'rock': 'rock',
      'p': 'paper', 'paper': 'paper',
      's': 'scissors', 'scissors': 'scissors'
    };
    const playerMove = map[rawChoice];
    if (!playerMove) {
      return reply(`❌ Invalid hand! Usage: ${config.prefix}rps <rock|paper|scissors> [bet]`);
    }

    const bet = parseInt(args[1] || '50', 10);
    if (isNaN(bet) || bet <= 0) return reply(`❌ Invalid bet.`);
    if (user.balance < bet) return reply(`❌ Insufficient balance ($${user.balance.toLocaleString()}).`);

    usersDB.deductBalance(user.uid, bet);

    const moves = ['rock', 'paper', 'scissors'];
    const botMove = moves[Math.floor(Math.random() * moves.length)];

    const icons: Record<string, string> = {
      'rock': '🪨 ROCK',
      'paper': '📜 PAPER',
      'scissors': '✂️ SCISSORS'
    };

    let result = '';
    let payout = 0;

    if (playerMove === botMove) {
      payout = bet;
      result = `🤝 DRAW! You both threw ${icons[playerMove]}. Bet refunded.`;
    } else if (
      (playerMove === 'rock' && botMove === 'scissors') ||
      (playerMove === 'paper' && botMove === 'rock') ||
      (playerMove === 'scissors' && botMove === 'paper')
    ) {
      payout = bet * 2;
      result = `🎉 YOU WON! ${icons[playerMove]} beats ${icons[botMove]}!\n💰 Won: +$${payout.toLocaleString()}`;
      user.stats.gamesWon += 1;
    } else {
      result = `💀 YOU LOST! ${icons[botMove]} beats ${icons[playerMove]}.\n💸 Loss: -$${bet.toLocaleString()}`;
    }

    if (payout > 0) usersDB.addBalance(user.uid, payout);
    user.stats.gamesPlayed += 1;
    usersDB.updateUser(user.uid, { stats: user.stats });

    const card = [
      `⚔️ ══════『 RPS CLASH 』══════ ⚔️`,
      `  👤 You Picked: ${icons[playerMove]}`,
      `  🤖 Bot Picked: ${icons[botMove]}`,
      `  ──────────────────────────`,
      `  ${result}`,
      `  💵 Balance: $${(user.balance - bet + payout).toLocaleString()}`,
      `═════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default rpsCmd;
