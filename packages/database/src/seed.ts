import { connectDatabase } from './connection.js';
import { GuildModel } from './models/guild.model.js';
import { TicketCategoryModel } from './models/ticket.model.js';
import { BookingServiceModel } from './models/booking.model.js';

export async function seedDatabase() {
  await connectDatabase();

  const defaultGuildId = process.env.DISCORD_GUILD_ID || '1169300074115911820';
  console.log(`🌱 Seeding Tatakae Nexus MongoDB for Guild ID: ${defaultGuildId}...`);

  // Upsert Guild
  await GuildModel.findByIdAndUpdate(
    defaultGuildId,
    {
      _id: defaultGuildId,
      id: defaultGuildId,
      name: 'Tatakae Labs',
      ownerId: '1169300074115911820',
      active: true,
      timezone: 'Asia/Kolkata',
    },
    { upsert: true, new: true }
  );

  // Default Categories
  const categories = [
    {
      name: 'General Support',
      description: 'Questions and general community inquiries.',
      emoji: '💬',
      ticketNamingPattern: 'general-{number}',
    },
    {
      name: 'Technical Support',
      description: 'Technical issues, bug reports, and setup troubleshooting.',
      emoji: '🛠️',
      ticketNamingPattern: 'tech-{number}',
    },
    {
      name: 'Partnership Enquiry',
      description: 'Business, collaboration, and ecosystem partnerships.',
      emoji: '🤝',
      ticketNamingPattern: 'partner-{number}',
    },
    {
      name: 'Billing Enquiry',
      description: 'Invoicing, payments, and commercial plans.',
      emoji: '💳',
      ticketNamingPattern: 'billing-{number}',
    },
  ];

  for (const cat of categories) {
    const existing = await TicketCategoryModel.findOne({
      guildId: defaultGuildId,
      name: cat.name,
    });
    if (!existing) {
      await TicketCategoryModel.create({
        guildId: defaultGuildId,
        ...cat,
      });
    }
  }

  // Default Booking Services
  const services = [
    {
      name: 'Product Demo & Walkthrough',
      description: '30-minute interactive product demonstration with Tatakae engineers.',
      durationMinutes: 30,
      bufferMinutes: 15,
      capacity: 1,
    },
    {
      name: 'Partnership & Strategy Consultation',
      description: '45-minute strategic alignment call for potential partners.',
      durationMinutes: 45,
      bufferMinutes: 15,
      capacity: 1,
    },
    {
      name: 'Technical Architecture Review',
      description: '60-minute in-depth technical exploration and integration review.',
      durationMinutes: 60,
      bufferMinutes: 30,
      capacity: 1,
    },
  ];

  for (const s of services) {
    const existing = await BookingServiceModel.findOne({
      guildId: defaultGuildId,
      name: s.name,
    });
    if (!existing) {
      await BookingServiceModel.create({
        guildId: defaultGuildId,
        ...s,
      });
    }
  }

  console.log('✅ MongoDB Database seeded successfully!');
}

if (process.argv[1]?.endsWith('seed.js') || process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
