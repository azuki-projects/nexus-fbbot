import { CommandHandler } from '../server/types.ts';

const duelCmd: CommandHandler = {
  name: 'duel',
  description: 'Challenge the Cyber Boss or another player in an arena duel for honor and gold.',
  usage: '[bet_amount]',
  allownoprefix: false,
  role: 0,
  cooldown: 8,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    const bet = parseInt(args[0] || '150', 10);
    if (isNaN(bet) || bet <= 0) return reply(`❌ Invalid bet.`);
    if (user.balance < bet) return reply(`❌ Insufficient funds ($${user.balance.toLocaleString()}).`);

    usersDB.deductBalance(user.uid, bet);

    const bosses = ['Lord Vorash', 'Shadow Ninja', 'Mecha Titan', 'Viper Assassin'];
    const boss = bosses[Math.floor(Math.random() * bosses.length)];

    let playerHP = 100;
    let bossHP = 100;

    const combatLog: string[] = [];

    // Round 1
    const pDmg1 = Math.floor(Math.random() * 40) + 20;
    bossHP -= pDmg1;
    combatLog.push(`⚔️ Round 1: You struck ${boss} for ${pDmg1} dmg!`);

    const bDmg1 = Math.floor(Math.random() * 35) + 15;
    playerHP -= bDmg1;
    combatLog.push(`🛡️ ${boss} retaliated with ${bDmg1} dmg!`);

    // Round 2
    const pCrit = Math.random() < 0.35;
    const pDmg2 = (Math.floor(Math.random() * 35) + 25) * (pCrit ? 2 : 1);
    bossHP -= pDmg2;
    combatLog.push(`💥 Round 2: ${pCrit ? 'CRITICAL STRIKE! ' : ''}You deal ${pDmg2} dmg!`);

    const won = bossHP <= 0 || playerHP > 30;
    user.stats.gamesPlayed += 1;
    let payout = 0;
    let verdict = '';

    if (won) {
      payout = bet * 2;
      usersDB.addBalance(user.uid, payout);
      user.stats.gamesWon += 1;
      verdict = `🏆 VICTORY! You defeated ${boss} in the Arena!\n💰 Prize Pool: +$${payout.toLocaleString()}`;
    } else {
      verdict = `💀 DEFEAT! ${boss} knocked you out.\n💸 Lost: -$${bet.toLocaleString()}`;
    }

    usersDB.updateUser(user.uid, { stats: user.stats });

    const card = [
      `⚔️ ══════『 GLADIATOR ARENA 』══════ ⚔️`,
      `  🥊 Match: ${user.name} VS ${boss}`,
      `  ─────────────────────────────`,
      `  ${combatLog.join('\n  ')}`,
      `  ─────────────────────────────`,
      `  ${verdict}`,
      `  💵 Balance: $${(user.balance - bet + payout).toLocaleString()}`,
      `═════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default duelCmd;
