import { CommandHandler } from '../server/types.ts';

const uidCmd: CommandHandler = {
  name: 'uid',
  description: 'Retrieve Facebook User ID (UID) of yourself, a tagged user, or the author of a replied message.',
  usage: '[@mention | reply]',
  allownoprefix: true,
  role: 0,
  cooldown: 2,
  category: 'Tools',
  execute: async ({ event, reply }) => {
    // Check if replied to a message
    if (event.messageReply && event.messageReply.senderID) {
      return reply(
        `🆔 Target UID: ${event.messageReply.senderID}\n👤 Context: Replied Message Author\n🔗 Profile: https://facebook.com/${event.messageReply.senderID}`
      );
    }

    // Check if mentions exist
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      const entries = Object.entries(event.mentions);
      if (entries.length === 1) {
        const [targetUID, targetName] = entries[0];
        return reply(
          `🆔 Target UID: ${targetUID}\n👤 Name: ${targetName}\n🔗 Profile: https://facebook.com/${targetUID}`
        );
      } else {
        const list = entries.map(([uid, name]) => `• ${name}: ${uid}`).join('\n');
        return reply(`🆔 Tagged Users UIDs:\n${list}`);
      }
    }

    // Default: sender's own UID
    return reply(
      `🆔 Your UID: ${event.senderID}\n👤 Sender ID: ${event.senderID}\n🔗 Profile: https://facebook.com/${event.senderID}`
    );
  }
};

export default uidCmd;
