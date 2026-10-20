import { CommandHandler } from '../server/types.ts';

const helpCmd: CommandHandler = {
  name: 'help',
  description: 'View the professional directory of all available bot commands or get detailed manual for a command.',
  usage: '[command_name]',
  allownoprefix: true,
  role: 0,
  cooldown: 3,
  category: 'General',
  execute: async ({ args, reply, commands, config }) => {
    const prefix = config.prefix || '(none)';

    // Specific command manual requested
    if (args.length > 0 && args[0].trim() !== '') {
      const targetName = args[0].toLowerCase().trim();
      const target = commands.get(targetName);

      if (!target) {
        return reply(`❌ Command "${targetName}" not found in the cmds registry.\nType "${config.prefix}help" to see all available commands.`);
      }

      const roleLabels = ['🌐 Everyone (0)', '🛡️ Bot Admin (1)', '👑 Owner Only (2)'];
      const roleBadge = roleLabels[target.role] || `Role ${target.role}`;

      const card = [
        `╔═══════『 COMMAND MANUAL 』═══════╗`,
        `  📌 Name: ${target.name.toUpperCase()}`,
        `  📂 Category: ${target.category}`,
        `  📝 Description: ${target.description}`,
        `  💡 Usage: ${config.prefix}${target.name} ${target.usage}`,
        `  🔒 Permission: ${roleBadge}`,
        `  ⏱️ Cooldown: ${target.cooldown}s`,
        `  ⚡ Allow No-Prefix: ${target.allownoprefix ? 'Yes' : 'No'}`,
        `╚══════════════════════════════════╝`
      ].join('\n');

      return reply(card);
    }

    // Full command listing categorized automatically from cmds folder
    const categories: Record<string, string[]> = {
      'Games': [],
      'Tools': [],
      'Economy': [],
      'Admin': [],
      'General': []
    };

    let totalCount = 0;
    const sortedCommands = Array.from(commands.values()).sort((a, b) => a.name.localeCompare(b.name));

    for (const cmd of sortedCommands) {
      totalCount++;
      const cat = categories[cmd.category] || (categories[cmd.category] = []);
      const roleIcon = cmd.role === 2 ? '👑' : cmd.role === 1 ? '🛡️' : '';
      cat.push(`${cmd.name}${roleIcon}`);
    }

    const catHeaders: Record<string, string> = {
      'Games': '🎮 GAMES & CASINO (20)',
      'Tools': '🛠️ UTILITIES & TOOLS (15+)',
      'Economy': '💰 ECONOMY & FINANCE',
      'Admin': '👑 BOT MANAGEMENT & ADMIN',
      'General': 'ℹ️ GENERAL & SYSTEM'
    };

    const lines = [
      `╭───────────『 ${config.botName.toUpperCase()} 』───────────╮`,
      `│ 🤖 Total Commands: ${totalCount} loaded from /cmds`,
      `│ 🔑 Active Prefix: [ ${prefix} ] | No-Prefix: ${config.allowNoPrefix ? 'Enabled' : 'Disabled'}`,
      `│ 🛡️ Roles: [ 👑 Owner (2) | 🛡️ Admin (1) | 🌐 Member (0) ]`,
      `╰──────────────────────────────────────────╯\n`
    ];

    for (const [catKey, cmdList] of Object.entries(categories)) {
      if (cmdList.length === 0) continue;
      const header = catHeaders[catKey] || `📂 ${catKey.toUpperCase()}`;
      lines.push(`╭───『 ${header} 』───╮`);
      // Format into 3-column rows for clean compact mobile/desktop view
      const formattedList = cmdList.map(c => `• ${c}`).join('   ');
      lines.push(`  ${formattedList}`);
      lines.push(`╰───────────────────────────╯\n`);
    }

    lines.push(`💡 Tip: Type "${prefix}help <command>" for detailed manual & usage.`);
    lines.push(`✨ Example: ${prefix}help slots or ${prefix}help weather`);

    return reply(lines.join('\n'));
  }
};

export default helpCmd;
