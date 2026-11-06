import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';
import { moderationService } from '@tatakae/core';
import { ModerationAction } from '@tatakae/shared';

export const moderationCommand = {
  data: new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Tatakae moderation commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((sub) =>
      sub
        .setName('warn')
        .setDescription('Issue an official warning to a member')
        .addUserOption((opt) => opt.setName('user').setDescription('Target user').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for warning').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('timeout')
        .setDescription('Timeout a member')
        .addUserOption((opt) => opt.setName('user').setDescription('Target user').setRequired(true))
        .addIntegerOption((opt) => opt.setName('minutes').setDescription('Duration in minutes').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason'))
    )
    .addSubcommand((sub) =>
      sub
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption((opt) => opt.setName('user').setDescription('Target user').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason'))
    )
    .addSubcommand((sub) =>
      sub
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption((opt) => opt.setName('user').setDescription('Target user').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason'))
    )
    .addSubcommand((sub) =>
      sub
        .setName('history')
        .setDescription('View moderation history for a user')
        .addUserOption((opt) => opt.setName('user').setDescription('Target user').setRequired(true))
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const guildId = interaction.guildId!;

    await interaction.deferReply();

    if (subcommand === 'warn') {
      const modCase = await moderationService.recordCase({
        guildId,
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        action: ModerationAction.WARN,
        reason,
      });

      return interaction.editReply(
        `⚠️ **Warning Issued (Case #${modCase.caseNumber})**: <@${targetUser.id}> has been warned for: *${reason}*`
      );
    }

    if (subcommand === 'timeout') {
      const minutes = interaction.options.getInteger('minutes', true);
      const member = await interaction.guild?.members.fetch(targetUser.id);
      if (!member) return interaction.editReply('❌ User not found in this server.');

      await member.timeout(minutes * 60 * 1000, reason);

      const modCase = await moderationService.recordCase({
        guildId,
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        action: ModerationAction.TIMEOUT,
        reason,
        durationSeconds: minutes * 60,
      });

      return interaction.editReply(
        `⏳ **Timeout Applied (Case #${modCase.caseNumber})**: <@${targetUser.id}> timed out for ${minutes} minutes. Reason: *${reason}*`
      );
    }

    if (subcommand === 'kick') {
      const member = await interaction.guild?.members.fetch(targetUser.id);
      if (!member) return interaction.editReply('❌ User not found in this server.');

      await member.kick(reason);

      const modCase = await moderationService.recordCase({
        guildId,
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        action: ModerationAction.KICK,
        reason,
      });

      return interaction.editReply(
        `👢 **Member Kicked (Case #${modCase.caseNumber})**: <@${targetUser.id}> was kicked. Reason: *${reason}*`
      );
    }

    if (subcommand === 'ban') {
      await interaction.guild?.members.ban(targetUser.id, { reason });

      const modCase = await moderationService.recordCase({
        guildId,
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        action: ModerationAction.BAN,
        reason,
      });

      return interaction.editReply(
        `🔨 **Member Banned (Case #${modCase.caseNumber})**: <@${targetUser.id}> was banned. Reason: *${reason}*`
      );
    }

    if (subcommand === 'history') {
      const history = await moderationService.getHistory(guildId, targetUser.id);

      const embed = new EmbedBuilder()
        .setTitle(`🛡️ Moderation History: ${targetUser.tag}`)
        .setColor(0xf59e0b);

      if (history.length === 0) {
        embed.setDescription('✅ Clean record! No prior moderation cases.');
      } else {
        history.forEach((h: any) => {
          embed.addFields({
            name: `Case #${h.caseNumber} • ${h.action} (<t:${Math.floor(h.createdAt.getTime() / 1000)}:R>)`,
            value: `**Reason:** ${h.reason}\n**Moderator:** <@${h.moderatorId}>`,
          });
        });
      }

      return interaction.editReply({ embeds: [embed] });
    }
  },
};

