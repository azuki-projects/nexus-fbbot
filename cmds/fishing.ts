import { CommandHandler } from '../server/types.ts';

const fishTypes = [
  { name: 'Common Sardine', icon: '🐟', rarity: 'Common', price: 60, weight: 40 },
  { name: 'Rainbow Trout', icon: '🐠', rarity: 'Uncommon', price: 150, weight: 28 },
  { name: 'King Salmon', icon: '🐡', rarity: 'Rare', price: 400, weight: 18 },
  { name: 'Electric Eel', icon: '⚡', rarity: 'Epic', price: 950, weight: 10 },
  { name: 'Mythic Golden Koi', icon: '✨', rarity: 'Legendary', price: 3500, weight: 4 }
];

const fishingCmd: CommandHandler = {
  name: 'fishing',
  description: 'Cast your fishing rod into deep waters to catch rare fish and sell to the market.',
  usage: '[sell]',
  allownoprefix: true,
  role: 0,
  cooldown: 12,
  category: 'Games',
  execute: async ({ args, user, usersDB, reply, config }) => {
    // Check inventory
    if (!user.inventory) user.inventory = {};
    if (!user.inventory.fish) user.inventory.fish = {};

    const sub = (args[0] || '').toLowerCase();

    // Sell inventory
    if (sub === 'sell') {
      let totalValue = 0;
      let totalFishCount = 0;

      for (const [fishName, count] of Object.entries(user.inventory.fish)) {
        const item = fishTypes.find(f => f.name === fishName);
        if (item && count > 0) {
          totalValue += item.price * count;
          totalFishCount += count;
        }
      }

      if (totalFishCount === 0) {
        return reply(`🎣 Your fish basket is empty! Cast your rod with "${config.prefix}fishing" first.`);
      }

      user.inventory.fish = {};
      usersDB.addBalance(user.uid, totalValue);
      usersDB.updateUser(user.uid, { inventory: user.inventory });

      return reply(
        `🐟 Sold ${totalFishCount} fish to the docks market!\n` +
        `💰 Earnings: +$${totalValue.toLocaleString()}\n` +
        `💵 New Balance: $${(user.balance + totalValue).toLocaleString()}`
      );
    }

    // Cast rod
    const totalWeight = fishTypes.reduce((a, f) => a + f.weight, 0);
    let rand = Math.random() * totalWeight;
    let caught = fishTypes[0];

    for (const f of fishTypes) {
      if (rand < f.weight) {
        caught = f;
        break;
      }
      rand -= f.weight;
    }

    // Add to inventory
    user.inventory.fish[caught.name] = (user.inventory.fish[caught.name] || 0) + 1;
    usersDB.updateUser(user.uid, { inventory: user.inventory });

    const card = [
      `🎣 ══════『 DEEP SEA FISHING 』══════ 🎣`,
      `  🌊 You cast your graphite rod into the misty waters...`,
      `  🎣 *Tug tug* ... REELING IN!`,
      `  ✨ Caught: ${caught.icon} ${caught.name} [${caught.rarity}]!`,
      `  💵 Market Value: $${caught.price.toLocaleString()}`,
      `  ─────────────────────────────────────`,
      `  🧺 In Basket: ${user.inventory.fish[caught.name]}x ${caught.name}`,
      `  💡 Sell all fish anytime with "${config.prefix}fishing sell"`,
      `═════════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default fishingCmd;
