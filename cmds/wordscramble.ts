import { CommandHandler } from '../server/types.ts';

const wordList = [
  'FACEBOOK', 'MESSENGER', 'JAVASCRIPT', 'CYBERSECURITY', 'ROBOTICS',
  'ALGORITHM', 'DATABASE', 'TERMINAL', 'BLOCKCHAIN', 'DEVELOPER'
];

const wordscrambleCmd: CommandHandler = {
  name: 'wordscramble',
  description: 'Unscramble mixed-up tech & gaming words for cash and exp.',
  usage: '[guess]',
  allownoprefix: true,
  role: 0,
  cooldown: 6,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    if (args.length === 0) {
      const selected = wordList[Math.floor(Math.random() * wordList.length)];
      const scrambled = selected.split('').sort(() => 0.5 - Math.random()).join('');
      return reply(
        `🔤 ══════『 WORD SCRAMBLE 』══════ 🔤\n` +
        `Unscramble this word:\n` +
        `🌀 [ ${scrambled} ] (${selected.length} letters)\n\n` +
        `💡 Reply with: "${config.prefix}wordscramble <your_guess>"\n` +
        `💰 Reward: $400 cash`
      );
    }

    const guess = args.join('').toUpperCase().trim();
    const matched = wordList.includes(guess);

    if (matched) {
      const prize = 400;
      usersDB.addBalance(user.uid, prize);
      user.stats.gamesWon += 1;
      user.stats.gamesPlayed += 1;
      usersDB.updateUser(user.uid, { stats: user.stats });

      return reply(
        `🎉 SPOT ON! The word was "${guess}"!\n` +
        `💰 Reward: +$${prize.toLocaleString()}\n` +
        `💵 Balance: $${(user.balance + prize).toLocaleString()}`
      );
    } else {
      user.stats.gamesPlayed += 1;
      usersDB.updateUser(user.uid, { stats: user.stats });
      return reply(`❌ "${guess}" is not correct! Try again with "${config.prefix}wordscramble"`);
    }
  }
};

export default wordscrambleCmd;
