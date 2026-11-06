import {
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { TicketCategoryModel } from '@tatakae/database';
import { TicketStatus } from '@tatakae/shared';
import { ticketService, ticketRepository } from '@tatakae/core';

export async function handleCategorySelect(interaction: StringSelectMenuInteraction) {
  const categoryId = interaction.values[0];
  const category: any = await TicketCategoryModel.findById(categoryId).lean();
  if (!category) return interaction.reply({ content: '❌ Category not found.', ephemeral: true });

  const modal = new ModalBuilder()
    .setCustomId(`ticket:create_modal:${categoryId}`)
    .setTitle(`Open: ${category.name}`.slice(0, 45));

  const subjectInput = new TextInputBuilder()
    .setCustomId('subject')
    .setLabel('Brief Subject')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Describe your question or issue...')
    .setRequired(true)
    .setMaxLength(100);

  const descInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Detailed Explanation')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Provide all relevant context, IDs, or error codes...')
    .setRequired(true)
    .setMaxLength(1000);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(subjectInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(descInput)
  );

  await interaction.showModal(modal);
}

export async function handleTicketModalSubmit(interaction: ModalSubmitInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const categoryId = interaction.customId.replace('ticket:create_modal:', '');
  const subject = interaction.fields.getTextInputValue('subject');
  const description = interaction.fields.getTextInputValue('description');

  const ticket = await ticketService.createTicket({
    guildId: interaction.guildId!,
    creatorDiscordId: interaction.user.id,
    creatorUsername: interaction.user.tag,
    creatorAvatar: interaction.user.avatarURL(),
    categoryId,
    subject,
    initialAnswers: { description },
  });

  const guild = interaction.guild!;
  const channelName = `ticket-${ticket.ticketNumber}`;

  try {
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
          ],
        },
        {
          id: guild.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages,
          ],
        },
      ],
    });

    await ticketService.linkDiscordChannel(ticket._id.toString(), channel.id);

    const embed = new EmbedBuilder()
      .setTitle(`🎫 Ticket #${ticket.ticketNumber} — ${ticket.categoryName}`)
      .setDescription(
        `**Creator:** <@${interaction.user.id}>\n` +
          `**Subject:** ${subject}\n\n` +
          `**Details:**\n${description}\n\n` +
          'A staff member will be with you shortly. Use the controls below to manage this ticket.'
      )
      .setColor(0x0ea5e9)
      .setFooter({ text: 'Tatakae Nexus Ticket Manager' });

    const claimBtn = new ButtonBuilder()
      .setCustomId(`ticket:claim:${ticket._id.toString()}`)
      .setLabel('Claim Ticket')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🛡️');

    const closeBtn = new ButtonBuilder()
      .setCustomId(`ticket:close:${ticket._id.toString()}`)
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒');

    const transcriptBtn = new ButtonBuilder()
      .setCustomId(`ticket:transcript:${ticket._id.toString()}`)
      .setLabel('Transcript')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📄');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(claimBtn, closeBtn, transcriptBtn);

    await channel.send({
      content: `<@${interaction.user.id}> Your ticket has been created!`,
      embeds: [embed],
      components: [row],
    });

    return interaction.editReply(`✅ Ticket created! Head over to <#${channel.id}>.`);
  } catch (err) {
    return interaction.editReply(`❌ Failed to create ticket channel: ${(err as Error).message}`);
  }
}

export async function handleTicketButtons(interaction: ButtonInteraction) {
  const [prefix, action, ticketId] = interaction.customId.split(':');
  if (prefix !== 'ticket') return;

  if (action === 'claim') {
    await interaction.deferReply();
    await ticketService.claimTicket(ticketId, interaction.user.id);
    return interaction.editReply(`🛡️ Ticket claimed by <@${interaction.user.id}>!`);
  }

  if (action === 'close') {
    await interaction.deferReply();
    await ticketService.updateStatus(ticketId, TicketStatus.CLOSED, interaction.user.id, 'Closed by user/staff button');
    await ticketService.generateTranscript(ticketId);

    await interaction.editReply('🔒 Ticket marked as closed. Generating transcript and archiving...');
    setTimeout(async () => {
      try {
        await interaction.channel?.delete();
      } catch {}
    }, 4000);
    return;
  }

  if (action === 'transcript') {
    await interaction.deferReply({ ephemeral: true });
    const html = await ticketService.generateTranscript(ticketId);
    const buffer = Buffer.from(html, 'utf-8');
    return interaction.editReply({
      content: '📄 Generated conversation transcript:',
      files: [{ attachment: buffer, name: `ticket-${ticketId}-transcript.html` }],
    });
  }
}
