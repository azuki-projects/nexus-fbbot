import { CommandHandler } from '../server/types.ts';

const balanceCmd: CommandHandler = {
  name: 'balance',
  description: 'Check your current wallet, bank savings, net worth, or inspect the economy leaderboard.',
  usage: '[top | deposit <amount|all> | withdraw <amount|all>]',
  allownoprefix: true,
  role: 0,
  cooldown: 3,
  category: 'Economy',
  execute: async ({ args, user, usersDB, reply, config }) => {
    const sub = (args[0] || '').toLowerCase();

    // Leaderboard
    if (sub === 'top' || sub === 'leaderboard') {
      const allUsers = usersDB.getAllUsers().slice(0, 10);
      const rows = allUsers.map((u, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        const netWorth = u.balance + u.bank;
        const roleBadge = u.role === 2 ? '👑' : u.role === 1 ? '🛡️' : '👤';
        return `${medal} ${roleBadge} ${u.name} — $${netWorth.toLocaleString()} (Cash: $${u.balance.toLocaleString()})`;
      });

      return reply(
        `🏆 ═════『 ECONOMY LEADERBOARD 』═════ 🏆\n` +
        `Top 10 Richest Users on ${config.botName}:\n\n` +
        rows.join('\n') +
        `\n\n💡 Tip: Play games or work to climb the ranks!`
      );
    }

    // Deposit to bank
    if (sub === 'deposit' || sub === 'dep') {
      const amtStr = args[1] || '';
      let amount = 0;
      if (amtStr.toLowerCase() === 'all') {
        amount = user.balance;
      } else {
        amount = parseInt(amtStr, 10);
      }

      if (isNaN(amount) || amount <= 0) {
        return reply(`❌ Invalid amount. Usage: ${config.prefix}balance deposit <amount|all>`);
      }
      if (user.balance < amount) {
        return reply(`❌ Insufficient funds in wallet! You only have $${user.balance.toLocaleString()}.`);
      }

      usersDB.updateUser(user.uid, {
        balance: user.balance - amount,
        bank: user.bank + amount
      });

      return reply(
        `🏦 Successfully deposited $${amount.toLocaleString()} into your vault!\n` +
        `💵 Wallet: $${(user.balance - amount).toLocaleString()} | 🏛️ Bank: $${(user.bank + amount).toLocaleString()}`
      );
    }

    // Withdraw from bank
    if (sub === 'withdraw' || sub === 'with') {
      const amtStr = args[1] || '';
      let amount = 0;
      if (amtStr.toLowerCase() === 'all') {
        amount = user.bank;
      } else {
        amount = parseInt(amtStr, 10);
      }

      if (isNaN(amount) || amount <= 0) {
        return reply(`❌ Invalid amount. Usage: ${config.prefix}balance withdraw <amount|all>`);
      }
      if (user.bank < amount) {
        return reply(`❌ Insufficient savings! You only have $${user.bank.toLocaleString()} in the bank.`);
      }

      usersDB.updateUser(user.uid, {
        balance: user.balance + amount,
        bank: user.bank - amount
      });

      return reply(
        `💵 Successfully withdrew $${amount.toLocaleString()} from your vault!\n` +
        `💵 Wallet: $${(user.balance + amount).toLocaleString()} | 🏛️ Bank: $${(user.bank - amount).toLocaleString()}`
      );
    }

    // Default balance inquiry
    const netWorth = user.balance + user.bank;
    const roleNames = ['Member (0)', 'Bot Admin (1)', 'Bot Owner (2)'];
    const card = [
      `💳 ═══════『 FINANCIAL PASSPORT 』═══════ 💳`,
      `  👤 Account: ${user.name}`,
      `  🆔 UID: ${user.uid}`,
      `  🎖️ Role: ${roleNames[user.role]}`,
      `  ⭐ Level: ${user.level} (EXP: ${user.exp})`,
      `  ───────────────────────────────`,
      `  💵 Wallet Cash: $${user.balance.toLocaleString()}`,
      `  🏛️ Secure Bank: $${user.bank.toLocaleString()}`,
      `  💎 Net Worth:    $${netWorth.toLocaleString()}`,
      `  🔥 Daily Streak: ${user.dailyStreak} days`,
      `  ───────────────────────────────`,
      `  🎮 Games Played: ${user.stats.gamesPlayed} (Won: ${user.stats.gamesWon})`,
      `  💰 Total Career Earnings: $${user.stats.totalEarned.toLocaleString()}`,
      `═══════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default balanceCmd;
