import { CommandHandler } from '../server/types.ts';

const triviaQuestions = [
  { q: 'What is the chemical symbol for Gold?', a: 'au', opt: 'A) Au  B) Ag  C) Fe  D) Gd' },
  { q: 'Which planet in our solar system is known as the Red Planet?', a: 'mars', opt: 'A) Venus  B) Mars  C) Jupiter  D) Saturn' },
  { q: 'What year did the Titanic sink?', a: '1912', opt: 'A) 1905  B) 1912  C) 1918  D) 1923' },
  { q: 'Who wrote the play Romeo and Juliet?', a: 'shakespeare', opt: 'A) Dickens  B) Shakespeare  C) Hemingway  D) Poe' },
  { q: 'What is the largest organ in the human body?', a: 'skin', opt: 'A) Liver  B) Heart  C) Skin  D) Brain' },
  { q: 'In computing, what does CPU stand for?', a: 'central processing unit', opt: 'A) Core Power Unit  B) Central Processing Unit' },
  { q: 'Which language has the most native speakers worldwide?', a: 'mandarin', opt: 'A) English  B) Spanish  C) Mandarin  D) Hindi' },
  { q: 'How many continents are there on Earth?', a: '7', opt: 'A) 5  B) 6  C) 7  D) 8' }
];

const triviaCmd: CommandHandler = {
  name: 'trivia',
  description: 'Answer knowledge trivia questions to earn instant bounty coins.',
  usage: '[answer]',
  allownoprefix: true,
  role: 0,
  cooldown: 8,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    // If no argument, pose a question
    if (args.length === 0) {
      const item = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
      return reply(
        `🧠 ══════『 TRIVIA CHALLENGE 』══════ 🧠\n` +
        `❓ Question: ${item.q}\n` +
        `📋 Options:\n   ${item.opt}\n\n` +
        `💡 How to submit: Type "${config.prefix}trivia <your_answer>"\n` +
        `💰 Reward: $500 cash + 25 EXP`
      );
    }

    const userAnswer = args.join(' ').toLowerCase().trim();
    // Check against matching trivia
    const matched = triviaQuestions.find(t => 
      userAnswer.includes(t.a) || (t.a === 'au' && userAnswer === 'a') || (t.a === 'mars' && userAnswer === 'b')
    );

    if (matched) {
      const reward = 500;
      usersDB.addBalance(user.uid, reward);
      user.stats.gamesWon += 1;
      user.stats.gamesPlayed += 1;
      usersDB.updateUser(user.uid, { stats: user.stats });

      return reply(
        `🎉 CORRECT! Brilliant work, ${user.name}!\n` +
        `💰 Bounty Earned: +$${reward.toLocaleString()} + 25 EXP\n` +
        `💵 New Balance: $${(user.balance + reward).toLocaleString()}`
      );
    } else {
      user.stats.gamesPlayed += 1;
      usersDB.updateUser(user.uid, { stats: user.stats });

      return reply(
        `❌ Not quite! Keep practicing your trivia knowledge.\n` +
        `💡 Type "${config.prefix}trivia" to roll another question.`
      );
    }
  }
};

export default triviaCmd;
