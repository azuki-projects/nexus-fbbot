import { CommandHandler } from '../server/types.ts';

const jobs = [
  { title: 'Fullstack Node.js Engineer', company: 'Metaverse Tech', wage: 850, tip: 250 },
  { title: 'Artisan Espresso Barista', company: 'Neon Cafe', wage: 500, tip: 180 },
  { title: 'High-Speed Courier', company: 'Cyber Express', wage: 620, tip: 150 },
  { title: 'Ethical Hacker', company: 'Sentinel Security', wage: 1100, tip: 400 },
  { title: 'Game Streamer', company: 'Twitch/FB Gaming', wage: 750, tip: 320 },
  { title: 'Formula Pit Crew Mechanic', company: 'Apex Racing', wage: 900, tip: 220 }
];

const workCmd: CommandHandler = {
  name: 'work',
  description: 'Work an hourly shift at various prestigious jobs to earn honest salary and customer tips.',
  usage: '',
  allownoprefix: true,
  role: 0,
  cooldown: 30, // 30s cooldown
  category: 'Games',
  execute: async ({ user, usersDB, reply }) => {
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const tipsEarned = Math.floor(Math.random() * job.tip) + 50;
    const totalWage = job.wage + tipsEarned;

    usersDB.addBalance(user.uid, totalWage);
    user.lastWork = Date.now();
    usersDB.updateUser(user.uid, { lastWork: user.lastWork });

    const card = [
      `💼 ══════『 SHIFT COMPLETED 』══════ 💼`,
      `  🏢 Position: ${job.title}`,
      `  📍 Workplace: ${job.company}`,
      `  💵 Base Pay:  +$${job.wage.toLocaleString()}`,
      `  ☕ Tips/Bonus: +$${tipsEarned.toLocaleString()}`,
      `  ───────────────────────────────`,
      `  💰 Total Direct Deposit: +$${totalWage.toLocaleString()}`,
      `  💳 Wallet Balance: $${(user.balance + totalWage).toLocaleString()}`,
      `═════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default workCmd;
