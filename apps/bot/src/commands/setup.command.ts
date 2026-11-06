import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { GuildModel } from '@tatakae/database';
import { env } from '@tatakae/config';

export const setupCommand = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Initialize or reconfigure Tatakae Nexus on this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((opt: any) => opt.setName('log_channel').setDescription('General logging channel'))
    .addChannelOption((opt: any) => opt.setName('mod_channel').setDescription('Moderator logging channel')),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId!;
    const logChannel = interaction.options.getChannel('log_channel');
    const modChannel = interaction.options.getChannel('mod_channel');

    await GuildModel.findByIdAndUpdate(
      guildId,
      {
        _id: guildId,
        id: guildId,
        name: interaction.guild?.name || 'Discord Guild',
        icon: interaction.guild?.iconURL() || '',
        ownerId: interaction.guild?.ownerId || interaction.user.id,
        memberCount: interaction.guild?.memberCount || 1,
        logChannelId: logChannel?.id,
        modLogChannelId: modChannel?.id,
      },
      { upsert: true, new: true }
    );

    const embed = new EmbedBuilder()
      .setTitle('⚡ Tatakae Nexus — Setup Complete')
      .setDescription(
        'Tatakae Nexus has been initialized for this server in MongoDB.\n\n' +
          `• **Guild ID:** \`${guildId}\`\n` +
          `• **Log Channel:** ${logChannel ? `<#${logChannel.id}>` : '*None configured*'}\n` +
          `• **Mod Channel:** ${modChannel ? `<#${modChannel.id}>` : '*None configured*'}\n\n` +
          'Access your administration panel via the Tatakae Dashboard button below.'
      )
      .setColor(0x0284c7);

    const button = new ButtonBuilder()
      .setLabel('Open Nexus Dashboard')
      .setStyle(ButtonStyle.Link)
      .setURL(`${env.DASHBOARD_URL}/dashboard`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    return interaction.editReply({ embeds: [embed], components: [row] });
  },
};

export const dashboardCommand = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Get your private login link for Tatakae Nexus web dashboard'),

  async execute(interaction: ChatInputCommandInteraction) {
    const button = new ButtonBuilder()
      .setLabel('Go to Dashboard')
      .setStyle(ButtonStyle.Link)
      .setURL(`${env.DASHBOARD_URL}/dashboard`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    return interaction.reply({
      content: '🔗 Click below to access your Tatakae Nexus Web Control Center:',
      components: [row],
      ephemeral: true,
    });
  },
};
