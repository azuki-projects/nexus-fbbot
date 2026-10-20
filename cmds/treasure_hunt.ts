import { CommandHandler } from '../server/types.ts';

const treasureHuntCmd: CommandHandler = {
  name: 'treasure_hunt',
  description: 'Choose 1 of 3 ancient dungeon chests to unlock lost relics or trigger poison traps.',
  usage: '<1|2|3>',
  allownoprefix: true,
  role: 0,
  cooldown: 10,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    const pick = parseInt(args[0], 10);
    if (isNaN(pick) || pick < 1 || pick > 3) {
      return reply(
        `🗺️ ══════『 ANCIENT CATACOMBS 』══════ 🗺️\n` +
        `You stand before 3 ancient ornate chests:\n` +
        `  [ 📦 Chest 1 ]    [ 📦 Chest 2 ]    [ 📦 Chest 3 ]\n\n` +
        `💡 Pick one to open: "${config.prefix}treasure_hunt 1"`
      );
    }

    const scenarios = [
      { text: '👑 King Midas Chalice! Overflowing with ancient gold coins!', payout: 1800, exp: 40 },
      { text: '💎 Sapphire Dragon Egg! Highly sought after by collectors!', payout: 2500, exp: 60 },
      { text: '🐍 Poisonous Sand Viper! You narrowly scrambled away with minor scrape!', payout: 200, exp: 10 },
      { text: '🪙 Bag of Silver Florins left by earlier explorers!', payout: 900, exp: 25 },
      { text: '📜 Ancient Spellbook of Knowledge!', payout: 1200, exp: 50 },
      { text: '💨 Empty dust and cobwebs... nothing inside!', payout: 0, exp: 5 }
    ];

    const outcome = scenarios[Math.floor(Math.random() * scenarios.length)];
    if (outcome.payout > 0) {
      usersDB.addBalance(user.uid, outcome.payout);
      user.stats.gamesWon += 1;
    }
    user.stats.gamesPlayed += 1;
    usersDB.updateUser(user.uid, { stats: user.stats });

    const card = [
      `🗝️ ══════『 CHEST #${pick} OPENED 』══════ 🗝️`,
      `  ✨ *Creaaak* ... The heavy bronze lid opens!`,
      `  🔍 You discovered: ${outcome.text}`,
      `  ─────────────────────────────────────`,
      `  💰 Bounty: +$${outcome.payout.toLocaleString()} | ⭐ EXP: +${outcome.exp}`,
      `  💵 New Balance: $${(user.balance + outcome.payout).toLocaleString()}`,
      `═════════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default treasureHuntCmd;
