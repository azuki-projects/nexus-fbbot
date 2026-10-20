import { CommandHandler } from '../server/types.ts';

const userinfoCmd: CommandHandler = {
  name: 'userinfo',
  description: 'Inspect full profile card, roles, balance, level, and stats of yourself or a tagged member.',
  usage: '[@mention | uid]',
  allownoprefix: true,
  role: 0,
  cooldown: 3,
  category: 'Tools',
  execute: async ({ args, event, user, usersDB, reply }) => {
    let targetUID = user.uid;

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    } else if (event.messageReply && event.messageReply.senderID) {
      targetUID = event.messageReply.senderID;
    } else if (args[0] && args[0].length > 4) {
      targetUID = args[0];
    }

    const target = usersDB.getUser(targetUID);
    const roleLabels = ['🌐 Regular Member (0)', '🛡️ Bot Admin (1)', '👑 Bot Owner (2)'];
    const createdDate = new Date(target.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const card = [
      `🪪 ══════『 USER PROFILE CARD 』══════ 🪪`,
      `  👤 Display Name: ${target.name}`,
      `  🆔 Facebook UID: ${target.uid}`,
      `  🛡️ Access Role:  ${roleLabels[target.role] || target.role}`,
      `  ⭐ Account Level: Level ${target.level} (${target.exp} EXP)`,
      `  ──────────────────────────────`,
      `  💵 Wallet Cash:  $${target.balance.toLocaleString()}`,
      `  🏛️ Bank Savings: $${target.bank.toLocaleString()}`,
      `  💎 Net Worth:    $${(target.balance + target.bank).toLocaleString()}`,
      `  🎮 Games Record: ${target.stats.gamesWon}W / ${target.stats.gamesPlayed}P`,
      `  📅 First Seen:   ${createdDate}`,
      `  🔗 Profile Link: https://facebook.com/${target.uid}`,
      `═════════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default userinfoCmd;
