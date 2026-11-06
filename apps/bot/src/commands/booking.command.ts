import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { BookingServiceModel, BookingModel } from '@tatakae/database';

export const bookingCommand = {
  data: new SlashCommandBuilder()
    .setName('booking')
    .setDescription('Tatakae Labs booking and appointment system')
    .addSubcommand((sub: any) =>
      sub
        .setName('services')
        .setDescription('List available appointment & consultation services')
    )
    .addSubcommand((sub: any) =>
      sub
        .setName('list')
        .setDescription('View your upcoming bookings')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    if (subcommand === 'services') {
      await interaction.deferReply({ ephemeral: true });
      const services = await BookingServiceModel.find({ guildId, active: true }).lean();

      if (services.length === 0) {
        return interaction.editReply('❌ No booking services currently available.');
      }

      const embed = new EmbedBuilder()
        .setTitle('📅 Tatakae Labs — Booking & Consultations')
        .setDescription('Select a service below to schedule an appointment or consultation.')
        .setColor(0x6366f1);

      services.forEach((s: any) => {
        embed.addFields({
          name: `🔹 ${s.name}`,
          value: `${s.description || 'No description'}\n⏳ Duration: **${s.durationMinutes} mins** (Buffer: ${s.bufferMinutes}m)`,
        });
      });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('booking:select_service')
        .setPlaceholder('Choose a service to book...')
        .addOptions(
          services.map((s: any) => ({
            label: s.name,
            value: s._id.toString(),
            description: `${s.durationMinutes} mins consultation`,
          }))
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

      return interaction.editReply({ embeds: [embed], components: [row] });
    }

    if (subcommand === 'list') {
      await interaction.deferReply({ ephemeral: true });
      const bookings = await BookingModel.find({
        guildId,
        discordId: interaction.user.id,
        startAt: { $gte: new Date() },
      })
        .sort({ startAt: 1 })
        .lean();

      if (bookings.length === 0) {
        return interaction.editReply('ℹ️ You have no upcoming bookings.');
      }

      const embed = new EmbedBuilder()
        .setTitle('🗓️ Your Upcoming Appointments')
        .setColor(0x10b981);

      bookings.forEach((b: any) => {
        embed.addFields({
          name: `${b.serviceName} (${b.status})`,
          value: `⏰ **Date:** <t:${Math.floor(new Date(b.startAt).getTime() / 1000)}:F>\n🎯 **Purpose:** ${b.purpose}`,
        });
      });

      return interaction.editReply({ embeds: [embed] });
    }
  },
};
