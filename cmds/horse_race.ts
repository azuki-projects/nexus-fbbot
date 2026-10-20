import { CommandHandler } from '../server/types.ts';

const horses = [
  { id: 1, name: 'Blaze Runner', icon: '🐎🔥', odds: 3 },
  { id: 2, name: 'Pegasus Star', icon: '🐎✨', odds: 4 },
  { id: 3, name: 'Cyclone Gale', icon: '🐎🌪️', odds: 2 },
  { id: 4, name: 'Shadow Phantom', icon: '🐎🌑', odds: 5 }
];

const horseRaceCmd: CommandHandler = {
  name: 'horse_race',
  description: 'Place your wager on 1 of 4 thoroughbred racing horses with dynamic multiplier odds.',
  usage: '<1-4> [bet_amount]',
  allownoprefix: false,
  role: 0,
  cooldown: 8,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    if (args.length === 0) {
      const list = horses.map(h => `  ${h.id}. ${h.icon} ${h.name} (Payout: ${h.odds}x)`).join('\n');
      return reply(
        `🏇 ══════『 GRAND DERBY CUP 』══════ 🏇\n` +
        `Pick a champion horse (1-4):\n${list}\n\n` +
        `💡 Example: ${config.prefix}horse_race 1 200`
      );
    }

    const horseId = parseInt(args[0], 10);
    const selected = horses.find(h => h.id === horseId);
    if (!selected) {
      return reply(`❌ Invalid horse selection! Pick a number between 1 and 4.`);
    }

    const bet = parseInt(args[1] || '100', 10);
    if (isNaN(bet) || bet <= 0) return reply(`❌ Invalid bet amount.`);
    if (user.balance < bet) return reply(`❌ Insufficient balance ($${user.balance.toLocaleString()}).`);

    usersDB.deductBalance(user.uid, bet);

    // Run race
    const winner = horses[Math.floor(Math.random() * horses.length)];
    const won = winner.id === selected.id;

    user.stats.gamesPlayed += 1;
    let payout = 0;
    let result = '';

    if (won) {
      payout = bet * selected.odds;
      usersDB.addBalance(user.uid, payout);
      user.stats.gamesWon += 1;
      result = `🎉 YOUR HORSE WON! ${selected.icon} ${selected.name} stormed across the finish line first!\n💰 Payout: +$${payout.toLocaleString()}`;
    } else {
      result = `💀 ${winner.icon} ${winner.name} took 1st place! Your pick came up short.\n💸 Lost: -$${bet.toLocaleString()}`;
    }

    usersDB.updateUser(user.uid, { stats: user.stats });

    const card = [
      `🏇 ══════『 RACE RESULTS 』══════ 🏇`,
      `  🚩 Track: Grand Emerald Downs`,
      `  🥇 1st Place: ${winner.icon} ${winner.name}`,
      `  🎯 Your Bet:  ${selected.icon} ${selected.name} ($${bet.toLocaleString()})`,
      `  ──────────────────────────────`,
      `  ${result}`,
      `  💵 Balance: $${(user.balance - bet + payout).toLocaleString()}`,
      `══════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default horseRaceCmd;
