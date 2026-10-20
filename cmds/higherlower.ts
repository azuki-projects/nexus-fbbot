import { CommandHandler } from '../server/types.ts';

const higherlowerCmd: CommandHandler = {
  name: 'higherlower',
  description: 'Guess whether the dealer’s next hidden card is Higher or Lower than the current card.',
  usage: '<higher|lower> [bet_amount]',
  allownoprefix: false,
  role: 0,
  cooldown: 4,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    const rawChoice = (args[0] || '').toLowerCase();
    if (rawChoice !== 'higher' && rawChoice !== 'lower' && rawChoice !== 'h' && rawChoice !== 'l') {
      return reply(`❌ Usage: ${config.prefix}higherlower <higher|lower> [bet]`);
    }

    const bet = parseInt(args[1] || '100', 10);
    if (isNaN(bet) || bet <= 0) return reply(`❌ Invalid bet.`);
    if (user.balance < bet) return reply(`❌ Insufficient funds ($${user.balance.toLocaleString()}).`);

    usersDB.deductBalance(user.uid, bet);

    const cardNames = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const currentVal = Math.floor(Math.random() * 11) + 1; // 1 - 11
    const nextVal = Math.floor(Math.random() * 13); // 0 - 12

    const currentCard = cardNames[currentVal];
    const nextCard = cardNames[nextVal];

    const isHigher = nextVal > currentVal;
    const isLower = nextVal < currentVal;
    const playerPickedHigher = (rawChoice === 'higher' || rawChoice === 'h');

    let won = (playerPickedHigher && isHigher) || (!playerPickedHigher && isLower);
    let outcome = '';
    let payout = 0;

    user.stats.gamesPlayed += 1;

    if (nextVal === currentVal) {
      // Tie
      payout = bet;
      outcome = `🤝 SAME VALUE! Both cards were ${nextCard}. Bet refunded.`;
    } else if (won) {
      payout = bet * 2;
      user.stats.gamesWon += 1;
      outcome = `🎉 CORRECT CALL! The card was ${nextCard}.\n💰 Payout: +$${payout.toLocaleString()}`;
    } else {
      outcome = `💀 WRONG CALL! The card was ${nextCard}.\n💸 Loss: -$${bet.toLocaleString()}`;
    }

    if (payout > 0) usersDB.addBalance(user.uid, payout);
    usersDB.updateUser(user.uid, { stats: user.stats });

    const card = [
      `🃏 ═════『 HIGHER OR LOWER 』═════ 🃏`,
      `  🂠 Base Card: [ ${currentCard} ]`,
      `  🔮 Your Guess: [ ${playerPickedHigher ? 'HIGHER ⬆️' : 'LOWER ⬇️'} ]`,
      `  🂡 Next Card: [ ${nextCard} ]`,
      `  ────────────────────────────`,
      `  ${outcome}`,
      `  💵 Balance: $${(user.balance - bet + payout).toLocaleString()}`,
      `══════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default higherlowerCmd;
