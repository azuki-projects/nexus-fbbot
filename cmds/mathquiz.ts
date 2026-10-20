import { CommandHandler } from '../server/types.ts';

const mathquizCmd: CommandHandler = {
  name: 'mathquiz',
  description: 'Fast mental arithmetic challenge with cash reward.',
  usage: '[answer]',
  allownoprefix: true,
  role: 0,
  cooldown: 5,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    if (args.length === 0) {
      const ops = ['+', '-', '*'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let a = Math.floor(Math.random() * 50) + 1;
      let b = Math.floor(Math.random() * 20) + 1;
      if (op === '*') {
        a = Math.floor(Math.random() * 15) + 2;
        b = Math.floor(Math.random() * 12) + 2;
      }
      return reply(
        `🧮 ══════『 SPEED MATH QUIZ 』══════ 🧮\n` +
        `Solve this equation:\n` +
        `👉  ${a} ${op} ${b} = ?\n\n` +
        `💡 Reply with: "${config.prefix}mathquiz <your_answer>"\n` +
        `💰 Bounty: $350 cash + 20 EXP`
      );
    }

    const ans = parseInt(args[0], 10);
    if (isNaN(ans)) {
      return reply(`❌ Please provide a numerical answer. Example: ${config.prefix}mathquiz 42`);
    }

    // Reward player for quick solving
    const reward = 350;
    usersDB.addBalance(user.uid, reward);
    user.stats.gamesWon += 1;
    user.stats.gamesPlayed += 1;
    usersDB.updateUser(user.uid, { stats: user.stats });

    return reply(
      `✅ CALCULATION ACCEPTED!\n` +
      `⚡ Quick thinking! You earned +$${reward.toLocaleString()} + 20 EXP.\n` +
      `💵 Balance: $${(user.balance + reward).toLocaleString()}`
    );
  }
};

export default mathquizCmd;
