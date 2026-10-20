import { CommandHandler } from '../server/types.ts';

const robCmd: CommandHandler = {
  name: 'rob',
  description: 'Attempt a daring heist or pickpocket another user. High risk of police fines!',
  usage: '[@mention | user_uid]',
  allownoprefix: false,
  role: 0,
  cooldown: 25,
  category: 'Games',
  execute: async ({ args, event, user, usersDB, reply, config }) => {
    let targetUID = '';

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    } else if (event.messageReply && event.messageReply.senderID) {
      targetUID = event.messageReply.senderID;
    } else if (args[0] && args[0].length > 5) {
      targetUID = args[0];
    }

    if (!targetUID || targetUID === user.uid) {
      return reply(
        `❌ You must tag someone or reply to their message to attempt a robbery!\n` +
        `Example: ${config.prefix}rob @username`
      );
    }

    const target = usersDB.getUser(targetUID);
    if (target.balance < 500) {
      return reply(`🛡️ ${target.name} is broke (less than $500 cash in wallet)! Not worth the crime.`);
    }

    // Success probability: 45%
    const success = Math.random() < 0.45;

    if (success) {
      const percentage = (Math.random() * 0.3) + 0.1; // 10% - 40%
      const loot = Math.floor(target.balance * percentage);

      usersDB.deductBalance(target.uid, loot);
      usersDB.addBalance(user.uid, loot);

      return reply(
        `🦹 ══════『 HEIST SUCCESSFUL 』══════ 🦹\n` +
        `💨 You slipped past security and pickpocketed ${target.name}!\n` +
        `💰 Loot Snatched: +$${loot.toLocaleString()}\n` +
        `💵 Your New Balance: $${(user.balance + loot).toLocaleString()}`
      );
    } else {
      const fine = Math.min(Math.floor(user.balance * 0.25) + 300, 2000);
      usersDB.deductBalance(user.uid, fine);

      return reply(
        `🚨 ══════『 CAUGHT RED-HANDED 』══════ 🚨\n` +
        `👮 The Cyber Police apprehended you attempting to rob ${target.name}!\n` +
        `💸 Bail & Fines Paid: -$${fine.toLocaleString()}\n` +
        `💵 Remaining Balance: $${Math.max(0, user.balance - fine).toLocaleString()}`
      );
    }
  }
};

export default robCmd;
