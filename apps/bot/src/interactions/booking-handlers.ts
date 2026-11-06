import {
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} from 'discord.js';
import { BookingServiceModel } from '@tatakae/database';
import { bookingService } from '@tatakae/core';

export async function handleBookingServiceSelect(interaction: StringSelectMenuInteraction) {
  const serviceId = interaction.values[0];
  const service: any = await BookingServiceModel.findById(serviceId).lean();
  if (!service) return interaction.reply({ content: '❌ Service not found.', ephemeral: true });

  const modal = new ModalBuilder()
    .setCustomId(`booking:create_modal:${serviceId}`)
    .setTitle(`Book: ${service.name}`.slice(0, 45));

  const nameInput = new TextInputBuilder()
    .setCustomId('client_name')
    .setLabel('Your Full Name')
    .setStyle(TextInputStyle.Short)
    .setValue(interaction.user.username)
    .setRequired(true);

  const emailInput = new TextInputBuilder()
    .setCustomId('client_email')
    .setLabel('Your Email Address')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('you@example.com')
    .setRequired(true);

  const purposeInput = new TextInputBuilder()
    .setCustomId('purpose')
    .setLabel('Purpose of Appointment / Consultation')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Describe what you would like to discuss...')
    .setRequired(true);

  const dateInput = new TextInputBuilder()
    .setCustomId('date_time')
    .setLabel('Date & Time (YYYY-MM-DD HH:MM)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. 2026-11-10 14:00')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(purposeInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(dateInput)
  );

  await interaction.showModal(modal);
}

export async function handleBookingModalSubmit(interaction: ModalSubmitInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const serviceId = interaction.customId.replace('booking:create_modal:', '');
  const clientName = interaction.fields.getTextInputValue('client_name');
  const clientEmail = interaction.fields.getTextInputValue('client_email');
  const purpose = interaction.fields.getTextInputValue('purpose');
  const dateTimeStr = interaction.fields.getTextInputValue('date_time');

  const startAt = new Date(dateTimeStr);
  if (isNaN(startAt.getTime()) || startAt < new Date()) {
    return interaction.editReply('❌ Invalid or past date/time provided. Please use YYYY-MM-DD HH:MM format in the future.');
  }

  try {
    const booking = await bookingService.createBooking({
      guildId: interaction.guildId!,
      serviceId,
      discordId: interaction.user.id,
      clientName,
      clientEmail,
      purpose,
      startAt,
    });

    const embed = new EmbedBuilder()
      .setTitle('🎉 Appointment Booking Confirmed!')
      .setDescription(
        `Your session for **${booking.serviceName}** has been registered in MongoDB.\n\n` +
          `• **Status:** \`${booking.status}\`\n` +
          `• **Scheduled Start:** <t:${Math.floor(startAt.getTime() / 1000)}:F>\n` +
          `• **Client:** ${clientName} (${clientEmail})\n` +
          `• **Purpose:** ${purpose}\n\n` +
          'Automated reminders will be delivered prior to your session.'
      )
      .setColor(0x10b981)
      .setFooter({ text: 'Tatakae Nexus Appointments' });

    return interaction.editReply({ embeds: [embed] });
  } catch (err) {
    return interaction.editReply(`❌ Booking failed: ${(err as Error).message}`);
  }
}
