import { CommandHandler } from '../server/types.ts';

const ores = [
  { name: 'Coal', icon: '⚫', val: 50, weight: 45 },
  { name: 'Iron Ingot', icon: '⚪', val: 120, weight: 30 },
  { name: 'Gold Nugget', icon: '🟡', val: 350, weight: 15 },
  { name: 'Emerald', icon: '🟢', val: 800, weight: 7 },
  { name: 'Diamond Gem', icon: '💎', val: 2000, weight: 3 }
];

const miningCmd: CommandHandler = {
  name: 'mining',
  description: 'Dig deep into the underground caverns for precious ores and gems.',
  usage: '[sell]',
  allownoprefix: true,
  role: 0,
  cooldown: 15,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    if (!user.inventory) user.inventory = {};
    if (!user.inventory.ores) user.inventory.ores = {};

    const sub = (args[0] || '').toLowerCase();

    // Sell ores
    if (sub === 'sell') {
      let totalValue = 0;
      let totalOresCount = 0;

      for (const [oreName, count] of Object.entries(user.inventory.ores)) {
        const item = ores.find(o => o.name === oreName);
        if (item && count > 0) {
          totalValue += item.val * count;
          totalOresCount += count;
        }
      }

      if (totalOresCount === 0) {
        return reply(`⛏️ Your ore bag is empty! Go mining with "${config.prefix}mining" first.`);
      }

      user.inventory.ores = {};
      usersDB.addBalance(user.uid, totalValue);
      usersDB.updateUser(user.uid, { inventory: user.inventory });

      return reply(
        `⛏️ Sold ${totalOresCount} refined ores to the Blacksmith Guild!\n` +
        `💰 Earnings: +$${totalValue.toLocaleString()}\n` +
        `💵 Balance: $${(user.balance + totalValue).toLocaleString()}`
      );
    }

    // Mine
    const totalWeight = ores.reduce((a, o) => a + o.weight, 0);
    let rand = Math.random() * totalWeight;
    let mined = ores[0];

    for (const o of ores) {
      if (rand < o.weight) {
        mined = o;
        break;
      }
      rand -= o.weight;
    }

    const qty = Math.floor(Math.random() * 3) + 1;
    user.inventory.ores[mined.name] = (user.inventory.ores[mined.name] || 0) + qty;
    usersDB.updateUser(user.uid, { inventory: user.inventory });

    const card = [
      `⛏️ ══════『 CRYSTAL MINES 』══════ ⛏️`,
      `  🔦 Venturing into deep Shaft #42...`,
      `  💥 *CLANG! CLANG!* Pickaxe strikes the vein!`,
      `  ✨ Extracted: ${mined.icon} ${qty}x ${mined.name}!`,
      `  💎 Unit Value: $${mined.val.toLocaleString()} each`,
      `  ─────────────────────────────────────`,
      `  🎒 Bag Total: ${user.inventory.ores[mined.name]}x ${mined.name}`,
      `  💡 Sell all ores with "${config.prefix}mining sell"`,
      `═════════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default miningCmd;
