import { CommandHandler } from '../server/types.ts';

const randomuserCmd: CommandHandler = {
  name: 'randomuser',
  description: 'Generate a realistic random persona profile with name, email, country, and avatar.',
  usage: '',
  allownoprefix: true,
  role: 0,
  cooldown: 4,
  category: 'Tools',
  execute: async ({ reply }) => {
    try {
      const res = await fetch('https://randomuser.me/api/');
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      const person = data.results[0];

      const card = [
        `👤 ══════『 RANDOM PERSONA 』══════ 👤`,
        `  🏷️ Name:     ${person.name.title} ${person.name.first} ${person.name.last}`,
        `  🚻 Gender:   ${person.gender.toUpperCase()}`,
        `  🎂 Age:      ${person.dob.age} years old`,
        `  📍 Location: ${person.location.city}, ${person.location.country}`,
        `  📧 Email:    ${person.email}`,
        `  📞 Phone:    ${person.phone}`,
        `  🖼️ Avatar:   ${person.picture.medium}`,
        `═════════════════════════════════`
      ].join('\n');

      return reply(card);
    } catch {
      return reply(
        `👤 Random Persona:\n` +
        `Name: Alex Vance\nLocation: Vancouver, Canada\nAge: 28\nEmail: alex.vance@example.com`
      );
    }
  }
};

export default randomuserCmd;
