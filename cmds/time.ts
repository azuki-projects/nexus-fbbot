import { CommandHandler } from '../server/types.ts';

const timeCmd: CommandHandler = {
  name: 'time',
  description: 'Display current real-time clock across major global cities and timezones.',
  usage: '',
  allownoprefix: true,
  role: 0,
  cooldown: 2,
  category: 'Tools',
  execute: async ({ reply }) => {
    const now = new Date();

    const formatZone = (timeZone: string, label: string) => {
      try {
        const timeStr = now.toLocaleTimeString('en-US', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const dateStr = now.toLocaleDateString('en-US', { timeZone, month: 'short', day: 'numeric', year: 'numeric' });
        return `  ${label}: ${timeStr} (${dateStr})`;
      } catch {
        return `  ${label}: N/A`;
      }
    };

    const card = [
      `🌐 ══════『 WORLD CLOCK 』══════ 🌐`,
      formatZone('UTC', '⏱️ UTC / GMT'),
      formatZone('Asia/Manila', '🇵🇭 Manila / Singapore'),
      formatZone('Asia/Tokyo', '🇯🇵 Tokyo / Seoul'),
      formatZone('Europe/London', '🇬🇧 London'),
      formatZone('America/New_York', '🇺🇸 New York (EDT/EST)'),
      formatZone('America/Los_Angeles', '🇺🇸 Los Angeles (PDT/PST)'),
      formatZone('Australia/Sydney', '🇦🇺 Sydney'),
      `═════════════════════════════════`
    ].join('\n');

    return reply(card);
  }
};

export default timeCmd;
