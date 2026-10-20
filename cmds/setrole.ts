import { CommandHandler, BotRole } from '../server/types.ts';

const setroleCmd: CommandHandler = {
  name: 'setrole',
  description: 'Promote or demote a user to Role 0 (Member), 1 (Bot Admin), or 2 (Owner).',
  usage: '<@mention|uid> <0|1|2>',
  allownoprefix: false,
  role: 2, // Owner only!
  cooldown: 2,
  category: 'Admin',
  execute: async ({ args, event, reply, usersDB, config }) => {
    let targetUID = '';
    let roleVal: number = -1;

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
      roleVal = parseInt(args[args.length - 1], 10);
    } else if (event.messageReply && event.messageReply.senderID) {
      targetUID = event.messageReply.senderID;
      roleVal = parseInt(args[0], 10);
    } else if (args.length >= 2) {
      targetUID = args[0];
      roleVal = parseInt(args[1], 10);
    }

    if (!targetUID || isNaN(roleVal) || (roleVal !== 0 && roleVal !== 1 && roleVal !== 2)) {
      return reply(
        `❌ Usage: ${config.prefix}setrole <@mention|uid> <0|1|2>\n` +
        `Roles: 0 = All/Member, 1 = Bot Admin, 2 = Owner`
      );
    }

    const target = usersDB.getUser(targetUID);
    target.role = roleVal as BotRole;

    // Update config adminUIDs if role changed
    if (roleVal === 1 && !config.adminUIDs.includes(targetUID)) {
      config.adminUIDs.push(targetUID);
    } else if (roleVal === 0) {
      config.adminUIDs = config.adminUIDs.filter(id => id !== targetUID);
    }

    usersDB.updateUser(targetUID, { role: roleVal as BotRole });

    const roleNames = ['🌐 Regular Member (0)', '🛡️ Bot Admin (1)', '👑 Bot Owner (2)'];
    return reply(
      `👑 ══════『 ROLE UPDATED 』══════ 👑\n` +
      `  👤 User: ${target.name} (${targetUID})\n` +
      `  🎖️ New Role: ${roleNames[roleVal]}\n` +
      `  💾 Saved to persistent database!`
    );
  }
};

export default setroleCmd;
