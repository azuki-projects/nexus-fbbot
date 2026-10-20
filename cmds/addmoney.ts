import { CommandHandler } from '../server/types.ts';

const addmoneyCmd: CommandHandler = {
  name: 'addmoney',
  description: 'Grant or inject virtual economy cash into a user’s balance.',
  usage: '<@mention|uid> <amount>',
  allownoprefix: false,
  role: 1, // Admin or Owner
  cooldown: 2,
  category: 'Admin',
  execute: async ({ args, event, reply, usersDB, config }) => {
    let targetUID = '';
    let amount = 0;

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
      amount = parseInt(args[args.length - 1], 10);
    } else if (event.messageReply && event.messageReply.senderID) {
      targetUID = event.messageReply.senderID;
      amount = parseInt(args[0], 10);
    } else if (args.length >= 2) {
      targetUID = args[0];
      amount = parseInt(args[1], 10);
    }

    if (!targetUID || isNaN(amount) || amount <= 0) {
      return reply(`❌ Usage: ${config.prefix}addmoney <@mention|uid> <amount>`);
    }

    const updated = usersDB.addBalance(targetUID, amount);

    return reply(
      `💸 ══════『 FUNDS GRANTED 』══════ 💸\n` +
      `  👤 Recipient: ${updated.name} (${targetUID})\n` +
      `  💰 Granted:   +$${amount.toLocaleString()}\n` +
      `  💵 New Wallet Total: $${updated.balance.toLocaleString()}`
    );
  }
};

export default addmoneyCmd;
