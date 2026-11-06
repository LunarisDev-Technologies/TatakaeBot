import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { TicketCategoryModel } from '@tatakae/database';
import { TicketStatus } from '@tatakae/shared';
import { ticketService, ticketRepository } from '@tatakae/core';

export const ticketCommand = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage Tatakae support tickets')
    .addSubcommand((sub: any) =>
      sub
        .setName('panel')
        .setDescription('Publish the interactive ticket panel')
        .addChannelOption((opt: any) =>
          opt.setName('channel').setDescription('Channel to send the panel in').setRequired(false)
        )
    )
    .addSubcommand((sub: any) => sub.setName('claim').setDescription('Claim the current ticket'))
    .addSubcommand((sub: any) =>
      sub
        .setName('close')
        .setDescription('Close the current ticket')
        .addStringOption((opt: any) => opt.setName('reason').setDescription('Reason for closing'))
    )
    .addSubcommand((sub: any) =>
      sub
        .setName('add')
        .setDescription('Add a user to this ticket')
        .addUserOption((opt: any) => opt.setName('user').setDescription('User to add').setRequired(true))
    )
    .addSubcommand((sub: any) => sub.setName('transcript').setDescription('Generate and view transcript')),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    if (subcommand === 'panel') {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({
          content: '❌ You require `Manage Server` permission to publish ticket panels.',
          ephemeral: true,
        });
      }

      const categories = await TicketCategoryModel.find({
        guildId,
        active: true,
      }).lean();

      if (categories.length === 0) {
        return interaction.reply({
          content: '❌ No active ticket categories found. Run `npm run seed` to create defaults.',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🛡️ Tatakae Labs — Support Center')
        .setDescription(
          'Welcome to Tatakae Labs Support. Please select a category below to open a private assistance channel with our staff team.\n\n' +
            categories
              .map(
                (c: any) =>
                  `**${c.emoji || '📌'} ${c.name}**\n${c.description || 'Support inquiry'}`
              )
              .join('\n\n')
        )
        .setColor(0x0ea5e9)
        .setFooter({ text: 'Tatakae Nexus Support System • 24/7 Response' });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket:select_category')
        .setPlaceholder('Select a ticket category...')
        .addOptions(
          categories.map((c: any) => ({
            label: c.name,
            value: c._id.toString(),
            description: (c.description || 'Open a ticket').slice(0, 50),
            emoji: c.emoji || undefined,
          }))
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

      const targetChannel = (interaction.options.getChannel('channel') || interaction.channel) as any;
      await targetChannel.send({ embeds: [embed], components: [row] });

      return interaction.reply({
        content: `✅ Support panel successfully published to ${targetChannel}!`,
        ephemeral: true,
      });
    }

    if (subcommand === 'claim') {
      await interaction.deferReply();
      const ticket = await ticketRepository.findByChannelId(interaction.channelId);
      if (!ticket) {
        return interaction.editReply('❌ This command can only be used within an active ticket channel.');
      }

      await ticketService.claimTicket((ticket as any)._id.toString(), interaction.user.id);
      return interaction.editReply(`🛡️ Ticket has been claimed by <@${interaction.user.id}>.`);
    }

    if (subcommand === 'close') {
      await interaction.deferReply();
      const ticket: any = await ticketRepository.findByChannelId(interaction.channelId);
      if (!ticket) {
        return interaction.editReply('❌ This command can only be used within an active ticket channel.');
      }

      const reason = interaction.options.getString('reason') || 'Closed by staff';
      await ticketService.updateStatus((ticket as any)._id.toString(), TicketStatus.CLOSED, interaction.user.id, reason);
      await ticketService.generateTranscript((ticket as any)._id.toString());

      await interaction.editReply(`🔒 Ticket #${ticket.ticketNumber} marked as closed. Generating transcript...`);
      setTimeout(async () => {
        try {
          await interaction.channel?.delete();
        } catch {}
      }, 5000);
      return;
    }

    if (subcommand === 'transcript') {
      await interaction.deferReply({ ephemeral: true });
      const ticket: any = await ticketRepository.findByChannelId(interaction.channelId);
      if (!ticket) {
        return interaction.editReply('❌ This command can only be used within an active ticket channel.');
      }

      const html = await ticketService.generateTranscript((ticket as any)._id.toString());
      const buffer = Buffer.from(html, 'utf-8');

      return interaction.editReply({
        content: `📄 Here is the transcript for Ticket #${ticket.ticketNumber}:`,
        files: [{ attachment: buffer, name: `ticket-${ticket.ticketNumber}-transcript.html` }],
      });
    }
  },
};
