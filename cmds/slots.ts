import { CommandHandler } from '../server/types.ts';

const slotsCmd: CommandHandler = {
  name: 'slots',
  description: 'Spin the 3-reel high-stakes slot machine and multiply your bet.',
  usage: '[bet_amount]',
  allownoprefix: false,
  role: 0,
  cooldown: 5,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    const bet = parseInt(args[0] || '100', 10);
    if (isNaN(bet) || bet <= 0) {
      return reply(`❌ Please provide a valid bet amount. Example: ${config.prefix}slots 200`);
    }
    if (user.balance < bet) {
      return reply(`❌ Insufficient balance! You have $${user.balance.toLocaleString()}, but bet is $${bet.toLocaleString()}.`);
    }

    // Deduct bet
    usersDB.deductBalance(user.uid, bet);

    const symbols = [
      { icon: '🍒', weight: 35, mult: 2 },
      { icon: '🍋', weight: 25, mult: 3 },
      { icon: '🍇', weight: 20, mult: 5 },
      { icon: '🔔', weight: 12, mult: 10 },
      { icon: '💎', weight: 6, mult: 25 },
      { icon: '7️⃣', weight: 2, mult: 77 }
    ];

    const pickSymbol = () => {
      const totalWeight = symbols.reduce((acc, s) => acc + s.weight, 0);
      let rand = Math.random() * totalWeight;
      for (const s of symbols) {
        if (rand < s.weight) return s;
        rand -= s.weight;
      }
      return symbols[0];
    };

    const r1 = pickSymbol();
    const r2 = pickSymbol();
    const r3 = pickSymbol();

    let winMultiplier = 0;
    let winType = '';

    if (r1.icon === r2.icon && r2.icon === r3.icon) {
      winMultiplier = r1.mult;
      winType = `🎉 TRIPLE MATCH! JACKPOT ${r1.mult}x!`;
    } else if (r1.icon === r2.icon || r2.icon === r3.icon || r1.icon === r3.icon) {
      const matchSym = r1.icon === r2.icon ? r1 : (r2.icon === r3.icon ? r2 : r1);
      winMultiplier = 1.5;
      winType = `✨ DOUBLE MATCH! Win 1.5x!`;
    }

    const wonAmount = Math.floor(bet * winMultiplier);
    let outcomeText = '';

    if (wonAmount > 0) {
      usersDB.addBalance(user.uid, wonAmount);
      user.stats.gamesWon += 1;
      outcomeText = `🏆 YOU WON: +$${wonAmount.toLocaleString()}!\n💵 New Balance: $${(user.balance - bet + wonAmount).toLocaleString()}`;
    } else {
      outcomeText = `💀 YOU LOST: -$${bet.toLocaleString()}\n💵 New Balance: $${(user.balance - bet).toLocaleString()}`;
    }

    user.stats.gamesPlayed += 1;
    usersDB.updateUser(user.uid, { stats: user.stats });

    const reels = [
      `🎰 ═════『 CASINO SLOTS 』═════ 🎰`,
      `  ┌───────────┐`,
      `  │  ${r1.icon} │ ${r2.icon} │ ${r3.icon}  │  ◀`,
      `  └───────────┘`,
      winType ? `  ${winType}` : `  💔 No matching symbols.`,
      `  ─────────────────────────`,
      `  ${outcomeText}`,
      `═══════════════════════════════`
    ].join('\n');

    return reply(reels);
  }
};

export default slotsCmd;
