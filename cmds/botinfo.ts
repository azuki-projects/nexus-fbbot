import { CommandHandler } from '../server/types.ts';

const botinfoCmd: CommandHandler = {
  name: 'botinfo',
  description: 'View bot runtime metrics, node version, memory consumption, uptime, and command stats.',
  usage: '',
  allownoprefix: true,
  role: 0,
  cooldown: 3,
  category: 'General',
  execute: async ({ reply, commands, config, usersDB }) => {
    const uptimeSec = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSec / 3600);
    const mins = Math.floor((uptimeSec % 3600) / 60);
    const secs = uptimeSec % 60;

    const memoryMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const totalUsers = usersDB.getAllUsers().length;

    const card = [
      `🤖 ══════『 ${config.botName.toUpperCase()} SYSTEM INFO 』══════ 🤖`,
      `  ⚙️ Engine: Node.js ${process.version} with @tas33n/ws3-fca`,
      `  ⏱️ Process Uptime: ${hours}h ${mins}m ${secs}s`,
      `  🧠 Memory Usage:   ${memoryMB} MB`,
      `  📂 Loaded Cmds:    ${commands.size} commands in /cmds`,
      `  👥 Saved Users:    ${totalUsers} registered in database`,
      `  🔑 Prefix:         "${config.prefix || '(none)'}"`,
      `  👑 Owner UID:      ${config.ownerUID}`,
      `  🛡️ Bot Admins:     ${config.adminUIDs.length} assigned`,
      `═════════════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default botinfoCmd;
