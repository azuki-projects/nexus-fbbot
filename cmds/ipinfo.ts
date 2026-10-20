import { CommandHandler } from '../server/types.ts';

const ipinfoCmd: CommandHandler = {
  name: 'ipinfo',
  description: 'Lookup geolocation, ISP organization, country, and ASN details of any IP address.',
  usage: '<ip_address>',
  allownoprefix: true,
  role: 0,
  cooldown: 4,
  category: 'Tools',
  execute: async ({ args, reply, config }) => {
    if (args.length === 0) {
      return reply(`❌ Usage: ${config.prefix}ipinfo <ip_address>\nExample: ${config.prefix}ipinfo 8.8.8.8`);
    }

    const ip = args[0].trim();
    try {
      const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
      if (!res.ok) throw new Error('Failed to query IP');
      const data = await res.json();

      if (data.error) {
        return reply(`❌ Error: ${data.reason || 'Invalid IP address.'}`);
      }

      const card = [
        `🌐 ══════『 IP LOOKUP REPORT 』══════ 🌐`,
        `  📌 IP:       ${data.ip}`,
        `  🏙️ City:     ${data.city || 'N/A'}, ${data.region || ''}`,
        `  🏳️ Country:  ${data.country_name} (${data.country_code})`,
        `  📡 Org/ISP:  ${data.org || data.asn || 'N/A'}`,
        `  🧭 Location: Lat ${data.latitude}, Lon ${data.longitude}`,
        `  ⏱️ Timezone: ${data.timezone || 'N/A'}`,
        `═════════════════════════════════════`
      ].join('\n');

      return reply(card);
    } catch {
      return reply(`❌ Failed to retrieve IP information for "${ip}".`);
    }
  }
};

export default ipinfoCmd;
