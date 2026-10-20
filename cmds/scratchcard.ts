import { CommandHandler } from '../server/types.ts';

const scratchcardCmd: CommandHandler = {
  name: 'scratchcard',
  description: 'Buy a lottery scratch ticket for $250. Match 3 symbols to win up to $10,000 jackpot!',
  usage: '',
  allownoprefix: false,
  role: 0,
  cooldown: 8,
  category: 'Games',
  execute: async ({ user, usersDB, reply }) => {
    const cost = 250;
    if (user.balance < cost) {
      return reply(`❌ A scratch ticket costs $${cost}. You have $${user.balance.toLocaleString()}.`);
    }

    usersDB.deductBalance(user.uid, cost);

    const icons = ['💎', '💰', '👑', '⭐', '🍀', '💣'];
    // 3x3 grid
    const grid: string[] = [];
    for (let i = 0; i < 9; i++) {
      grid.push(icons[Math.floor(Math.random() * icons.length)]);
    }

    // Check counts
    const counts: Record<string, number> = {};
    for (const item of grid) {
      counts[item] = (counts[item] || 0) + 1;
    }

    let payout = 0;
    let winSym = '';

    if (counts['💎'] >= 3) { payout = 10000; winSym = '💎 3x DIAMONDS (MEGA JACKPOT)'; }
    else if (counts['👑'] >= 3) { payout = 5000; winSym = '👑 3x CROWNS (HUGE WIN)'; }
    else if (counts['💰'] >= 3) { payout = 2000; winSym = '💰 3x BAGS OF GOLD'; }
    else if (counts['⭐'] >= 3) { payout = 1000; winSym = '⭐ 3x STARS'; }
    else if (counts['🍀'] >= 3) { payout = 500; winSym = '🍀 3x CLOVERS'; }

    user.stats.gamesPlayed += 1;
    let result = '';

    if (payout > 0) {
      usersDB.addBalance(user.uid, payout);
      user.stats.gamesWon += 1;
      result = `🎉 BINGO! Matched ${winSym}!\n💰 JACKPOT PAYOUT: +$${payout.toLocaleString()}`;
    } else {
      result = `💔 Better luck next scratch! Lost $${cost}.`;
    }

    usersDB.updateUser(user.uid, { stats: user.stats });

    const card = [
      `🎫 ═════『 LUCKY SCRATCH-OFF 』═════ 🎫`,
      `  ┌─────────────┐`,
      `  │ ${grid[0]}   ${grid[1]}   ${grid[2]} │`,
      `  │ ${grid[3]}   ${grid[4]}   ${grid[5]} │`,
      `  │ ${grid[6]}   ${grid[7]}   ${grid[8]} │`,
      `  └─────────────┘`,
      `  ─────────────────────────────`,
      `  ${result}`,
      `  💵 Balance: $${(user.balance - cost + payout).toLocaleString()}`,
      `═════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default scratchcardCmd;
