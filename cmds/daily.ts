import { CommandHandler } from '../server/types.ts';

const dailyCmd: CommandHandler = {
  name: 'daily',
  description: 'Claim your 24-hour daily reward with streak multipliers and level bonuses.',
  usage: '',
  allownoprefix: true,
  role: 0,
  cooldown: 5,
  category: 'Economy',
  execute: async ({ user, usersDB, reply }) => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const timeSinceLast = now - (user.lastDaily || 0);

    // If claimed less than 20 hours ago
    const minClaimInterval = 20 * 60 * 60 * 1000;
    if (timeSinceLast < minClaimInterval) {
      const remainingMs = minClaimInterval - timeSinceLast;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      return reply(
        `⏳ You already claimed your daily gift today!\n` +
        `Come back in ${hours}h ${mins}m to claim your next bonus.`
      );
    }

    // Streak calculation
    let streak = user.dailyStreak || 0;
    if (timeSinceLast < 48 * 60 * 60 * 1000) {
      streak += 1;
    } else {
      streak = 1; // streak reset
    }

    const baseReward = 1500;
    const streakBonus = Math.min(streak * 200, 3000);
    const levelBonus = (user.level || 1) * 100;
    const totalReward = baseReward + streakBonus + levelBonus;

    usersDB.addBalance(user.uid, totalReward);
    usersDB.updateUser(user.uid, {
      dailyStreak: streak,
      lastDaily: now
    });

    const card = [
      `🎁 ══════『 DAILY REWARD 』══════ 🎁`,
      `  🎉 Welcome back, ${user.name}!`,
      `  🔥 Current Daily Streak: ${streak} Days`,
      `  ───────────────────────────────`,
      `  💵 Base Reward:   +$${baseReward.toLocaleString()}`,
      `  ⚡ Streak Bonus:  +$${streakBonus.toLocaleString()}`,
      `  ⭐ Level Bonus:   +$${levelBonus.toLocaleString()}`,
      `  ───────────────────────────────`,
      `  💰 Total Received: +$${totalReward.toLocaleString()}`,
      `  💳 Wallet Balance: $${(user.balance + totalReward).toLocaleString()}`,
      `═════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default dailyCmd;
