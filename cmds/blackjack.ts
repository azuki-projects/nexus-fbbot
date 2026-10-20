import { CommandHandler } from '../server/types.ts';

const blackjackCmd: CommandHandler = {
  name: 'blackjack',
  description: 'Play a full hand of Blackjack 21 against the casino dealer.',
  usage: '[bet_amount]',
  allownoprefix: false,
  role: 0,
  cooldown: 5,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    const bet = parseInt(args[0] || '200', 10);
    if (isNaN(bet) || bet <= 0) {
      return reply(`❌ Invalid bet amount. Usage: ${config.prefix}blackjack [bet]`);
    }
    if (user.balance < bet) {
      return reply(`❌ Insufficient funds! You have $${user.balance.toLocaleString()}.`);
    }

    usersDB.deductBalance(user.uid, bet);

    const suits = ['♠', '♥', '♦', '♣'];
    const cards = [
      { name: 'A', val: 11 }, { name: '2', val: 2 }, { name: '3', val: 3 },
      { name: '4', val: 4 }, { name: '5', val: 5 }, { name: '6', val: 6 },
      { name: '7', val: 7 }, { name: '8', val: 8 }, { name: '9', val: 9 },
      { name: '10', val: 10 }, { name: 'J', val: 10 }, { name: 'Q', val: 10 },
      { name: 'K', val: 10 }
    ];

    const draw = () => {
      const card = cards[Math.floor(Math.random() * cards.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      return { str: `[${card.name}${suit}]`, val: card.val, isAce: card.name === 'A' };
    };

    const calcHand = (hand: Array<{ str: string; val: number; isAce: boolean }>) => {
      let total = hand.reduce((a, c) => a + c.val, 0);
      let aces = hand.filter(c => c.isAce).length;
      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }
      return total;
    };

    // Deal
    const playerHand = [draw(), draw()];
    const dealerHand = [draw(), draw()];

    let playerTotal = calcHand(playerHand);
    let dealerTotal = calcHand(dealerHand);

    // Dealer hits up to 17
    while (dealerTotal < 17) {
      dealerHand.push(draw());
      dealerTotal = calcHand(dealerHand);
    }

    let verdict = '';
    let payout = 0;
    const isPlayerBJ = playerTotal === 21 && playerHand.length === 2;
    const isDealerBJ = dealerTotal === 21 && dealerHand.length === 2;

    if (isPlayerBJ && !isDealerBJ) {
      payout = Math.floor(bet * 2.5); // Natural blackjack pays 3:2
      verdict = `🌟 NATURAL BLACKJACK! Payout: +$${payout.toLocaleString()}`;
    } else if (playerTotal > 21) {
      verdict = `💥 BUST! You went over 21. Loss: -$${bet.toLocaleString()}`;
    } else if (dealerTotal > 21) {
      payout = bet * 2;
      verdict = `🎉 DEALER BUSTED (${dealerTotal})! You win: +$${payout.toLocaleString()}`;
    } else if (playerTotal > dealerTotal) {
      payout = bet * 2;
      verdict = `🏆 YOU WIN! (${playerTotal} vs ${dealerTotal}) Payout: +$${payout.toLocaleString()}`;
    } else if (playerTotal < dealerTotal) {
      verdict = `💀 DEALER WINS! (${dealerTotal} vs ${playerTotal}) Loss: -$${bet.toLocaleString()}`;
    } else {
      payout = bet;
      verdict = `🤝 PUSH (TIE)! Bet refunded: $${bet.toLocaleString()}`;
    }

    if (payout > 0) {
      usersDB.addBalance(user.uid, payout);
      if (payout > bet) user.stats.gamesWon += 1;
    }
    user.stats.gamesPlayed += 1;
    usersDB.updateUser(user.uid, { stats: user.stats });

    const cardStr = [
      `🃏 ═══════『 CASINO BLACKJACK 』═══════ 🃏`,
      `  👤 Your Hand:   ${playerHand.map(c => c.str).join(' ')} ➜ Total: ${playerTotal}`,
      `  🤖 Dealer Hand: ${dealerHand.map(c => c.str).join(' ')} ➜ Total: ${dealerTotal}`,
      `  ─────────────────────────────────────`,
      `  ${verdict}`,
      `  💵 New Balance: $${(user.balance - bet + payout).toLocaleString()}`,
      `═════════════════════════════════════`
    ].join('\n');

    return reply(cardStr);
  }
};

export default blackjackCmd;
