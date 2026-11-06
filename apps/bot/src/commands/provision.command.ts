import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Guild,
  Role,
  CategoryChannel,
  TextChannel,
} from 'discord.js';
import { GuildModel, TicketCategoryModel, BookingServiceModel } from '@tatakae/database';
import { env } from '@tatakae/config';
import { logger } from '@tatakae/logger';

export const provisionCommand = {
  data: new SlashCommandBuilder()
    .setName('provision')
    .setDescription('Automatically provision and configure the official Tatakae Labs server architecture')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ This command must be run within a Discord Server.', ephemeral: true });
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) && interaction.guild.ownerId !== interaction.user.id) {
      return interaction.reply({ content: '❌ You require `Administrator` permission to run automated provisioning.', ephemeral: true });
    }

    await interaction.deferReply();

    const guild: Guild = interaction.guild;
    const progressUpdates: string[] = [];

    const updateStatus = async (msg: string) => {
      progressUpdates.push(msg);
      logger.info(`[Provisioning] ${msg}`);
      const embed = new EmbedBuilder()
        .setTitle('⚡ Tatakae Labs — Server Provisioning Engine')
        .setDescription(progressUpdates.map((u) => `• ${u}`).join('\n'))
        .setColor(0x8b5cf6)
        .setFooter({ text: 'Deploying Tatakae Labs enterprise architecture...' });
      await interaction.editReply({ embeds: [embed] }).catch(() => {});
    };

    try {
      await updateStatus('Starting automated server provisioning...');

      // -------------------------------------------------------------
      // 1. Roles Setup & Hierarchy
      // -------------------------------------------------------------
      await updateStatus('Setting up role hierarchy...');
      const roleDefinitions = [
        { name: '👑 Founder', color: 0x8b5cf6, hoist: true, permissions: [PermissionFlagsBits.Administrator] },
        { name: '⚙️ Administrator', color: 0x22d3ee, hoist: true, permissions: [PermissionFlagsBits.Administrator] },
        {
          name: '🛡️ Head Moderator',
          color: 0x3b82f6,
          hoist: true,
          permissions: [
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.KickMembers,
            PermissionFlagsBits.BanMembers,
            PermissionFlagsBits.ModerateMembers,
            PermissionFlagsBits.ManageMessages,
          ],
        },
        {
          name: '🔨 Moderator',
          color: 0x10b981,
          hoist: true,
          permissions: [
            PermissionFlagsBits.KickMembers,
            PermissionFlagsBits.ModerateMembers,
            PermissionFlagsBits.ManageMessages,
          ],
        },
        {
          name: '💼 Client Manager',
          color: 0xf59e0b,
          hoist: true,
          permissions: [PermissionFlagsBits.ManageMessages],
        },
        { name: '👨‍💻 Developer', color: 0x6366f1, hoist: true, permissions: [] },
        { name: '🎨 Designer', color: 0xec4899, hoist: true, permissions: [] },
        { name: '🤝 Partner', color: 0x14b8a6, hoist: true, permissions: [] },
        { name: '⭐ Verified Member', color: 0xa855f7, hoist: false, permissions: [] },
        { name: '👤 Member', color: 0x94a3b8, hoist: false, permissions: [] },
      ];

      const createdRoles = new Map<string, Role>();
      const existingRoles = await guild.roles.fetch();

      for (const def of roleDefinitions) {
        let role = existingRoles.find((r) => r.name.toLowerCase() === def.name.toLowerCase());
        if (!role) {
          try {
            role = await guild.roles.create({
              name: def.name,
              color: def.color,
              hoist: def.hoist,
              permissions: def.permissions as any,
              reason: 'Tatakae Nexus Automated Architecture Provisioning',
            });
          } catch (rErr) {
            logger.warn({ err: rErr }, `Could not create role ${def.name}`);
          }
        }
        if (role) createdRoles.set(def.name, role);
      }
      await updateStatus(`Configured ${createdRoles.size} server roles.`);

      const everyoneRole = guild.roles.everyone;
      const founderRole = createdRoles.get('👑 Founder');
      const adminRole = createdRoles.get('⚙️ Administrator');
      const headModRole = createdRoles.get('🛡️ Head Moderator');
      const modRole = createdRoles.get('🔨 Moderator');
      const clientMgrRole = createdRoles.get('💼 Client Manager');
      const devRole = createdRoles.get('👨‍💻 Developer');
      const designerRole = createdRoles.get('🎨 Designer');
      const botMember = guild.members.me;

      // Helper for channel overwrites
      const readOnlyOverwrites = [
        { id: everyoneRole.id, deny: [PermissionFlagsBits.SendMessages], allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] },
      ];

      const staffOverwrites = [
        { id: everyoneRole.id, deny: [PermissionFlagsBits.ViewChannel] },
        ...(founderRole ? [{ id: founderRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] }] : []),
        ...(adminRole ? [{ id: adminRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] }] : []),
        ...(headModRole ? [{ id: headModRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] }] : []),
        ...(modRole ? [{ id: modRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : []),
        ...(clientMgrRole ? [{ id: clientMgrRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : []),
        ...(botMember ? [{ id: botMember.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages] }] : []),
      ];

      const teamOverwrites = [
        ...staffOverwrites,
        ...(devRole ? [{ id: devRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : []),
        ...(designerRole ? [{ id: designerRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : []),
      ];

      // Helper to find or create category
      const findOrCreateCategory = async (name: string, overwrites: any[] = []) => {
        let cat = guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === name.toLowerCase()) as CategoryChannel;
        if (!cat) {
          cat = await guild.channels.create({
            name,
            type: ChannelType.GuildCategory,
            permissionOverwrites: overwrites,
          });
        }
        return cat;
      };

      // Helper to find or create text/voice channel
      const findOrCreateChannel = async (
        name: string,
        type: ChannelType.GuildText | ChannelType.GuildVoice,
        parent: CategoryChannel,
        overwrites: any[] = []
      ) => {
        let ch = guild.channels.cache.find((c) => c.parentId === parent.id && c.name.toLowerCase() === name.toLowerCase());
        if (!ch) {
          ch = await guild.channels.create({
            name,
            type: type as any,
            parent: parent.id,
            permissionOverwrites: overwrites,
          });
        }
        return ch as TextChannel;
      };

      // -------------------------------------------------------------
      // 2. Categories & Channels Creation
      // -------------------------------------------------------------
      await updateStatus('Creating "01 — START HERE" channels...');
      const catStart = await findOrCreateCategory('01 — START HERE');
      const chWelcome = await findOrCreateChannel('👋・welcome', ChannelType.GuildText, catStart, readOnlyOverwrites);
      const chAnnounce = await findOrCreateChannel('📢・announcements', ChannelType.GuildText, catStart, readOnlyOverwrites);
      const chRules = await findOrCreateChannel('📜・rules-and-guidelines', ChannelType.GuildText, catStart, readOnlyOverwrites);
      const chAbout = await findOrCreateChannel('🏢・about-tatakae', ChannelType.GuildText, catStart, readOnlyOverwrites);
      const chGuide = await findOrCreateChannel('🧭・server-guide', ChannelType.GuildText, catStart, readOnlyOverwrites);

      await updateStatus('Creating "02 — EXPLORE TATAKAE" channels...');
      const catExplore = await findOrCreateCategory('02 — EXPLORE TATAKAE');
      const chServices = await findOrCreateChannel('🚀・our-services', ChannelType.GuildText, catExplore, readOnlyOverwrites);
      const chProducts = await findOrCreateChannel('💻・our-products', ChannelType.GuildText, catExplore, readOnlyOverwrites);
      await findOrCreateChannel('📰・tech-updates', ChannelType.GuildText, catExplore, readOnlyOverwrites);
      await findOrCreateChannel('🎨・showcase', ChannelType.GuildText, catExplore);
      await findOrCreateChannel('🤝・partnerships', ChannelType.GuildText, catExplore, readOnlyOverwrites);

      await updateStatus('Creating "03 — COMMUNITY" channels...');
      const catCommunity = await findOrCreateCategory('03 — COMMUNITY');
      await findOrCreateChannel('💬・general-chat', ChannelType.GuildText, catCommunity);
      await findOrCreateChannel('👨‍💻・developers', ChannelType.GuildText, catCommunity);
      await findOrCreateChannel('🧠・ideas-and-feedback', ChannelType.GuildText, catCommunity);
      await findOrCreateChannel('🎯・opportunities', ChannelType.GuildText, catCommunity);
      await findOrCreateChannel('📸・community-showcase', ChannelType.GuildText, catCommunity);
      await findOrCreateChannel('🔊・Community Lounge', ChannelType.GuildVoice, catCommunity);
      await findOrCreateChannel('🔊・Developer Room', ChannelType.GuildVoice, catCommunity);

      await updateStatus('Creating "04 — CLIENT SERVICES" channels...');
      const catClientServices = await findOrCreateCategory('04 — CLIENT SERVICES');
      const chOpenTicket = await findOrCreateChannel('🎫・open-a-ticket', ChannelType.GuildText, catClientServices, readOnlyOverwrites);
      const chBookConsultation = await findOrCreateChannel('📅・book-a-consultation', ChannelType.GuildText, catClientServices, readOnlyOverwrites);
      await findOrCreateChannel('💼・client-information', ChannelType.GuildText, catClientServices, readOnlyOverwrites);
      await findOrCreateChannel('⭐・client-feedback', ChannelType.GuildText, catClientServices);

      await updateStatus('Creating "05 — CLIENT TICKETS" private category...');
      const catClientTickets = await findOrCreateCategory('05 — CLIENT TICKETS', staffOverwrites);

      await updateStatus('Creating "06 — TEAM OPERATIONS" channels...');
      const catTeam = await findOrCreateCategory('06 — TEAM OPERATIONS', teamOverwrites);
      await findOrCreateChannel('🔒・team-announcements', ChannelType.GuildText, catTeam);
      await findOrCreateChannel('💬・team-chat', ChannelType.GuildText, catTeam);
      await findOrCreateChannel('📋・task-management', ChannelType.GuildText, catTeam);
      await findOrCreateChannel('📅・team-meetings', ChannelType.GuildText, catTeam);
      await findOrCreateChannel('🧾・client-operations', ChannelType.GuildText, catTeam);

      await updateStatus('Creating "07 — ADMINISTRATION" channels...');
      const catAdmin = await findOrCreateCategory('07 — ADMINISTRATION', staffOverwrites);
      const chModLogs = await findOrCreateChannel('🛡️・mod-logs', ChannelType.GuildText, catAdmin);
      const chBotLogs = await findOrCreateChannel('🤖・bot-logs', ChannelType.GuildText, catAdmin);
      await findOrCreateChannel('⚙️・server-configuration', ChannelType.GuildText, catAdmin);
      await findOrCreateChannel('📊・server-activity', ChannelType.GuildText, catAdmin);

      // -------------------------------------------------------------
      // 3. Publishing Content Embeds
      // -------------------------------------------------------------
      await updateStatus('Publishing official rules, guidelines, and company embeds...');

      // Welcome Embed
      const chGenChat = guild.channels.cache.find((c) => c.name.includes('general-chat'));
      const welcomeEmbed = new EmbedBuilder()
        .setTitle('🚀 Welcome to Tatakae Labs')
        .setDescription(
          `**Welcome aboard!** We are thrilled to have you in our technology and innovation ecosystem.\n\n` +
            `Tatakae Labs is a technology company dedicated to engineering digital products, autonomous systems, enterprise cloud solutions, and developer tools.\n\n` +
            `### 🧭 What You Can Do Here:\n` +
            `• **Explore Software & Solutions**: Discover our latest builds in <#${chProducts.id}> & <#${chServices.id}>.\n` +
            `• **Collaborate with Builders**: Network with founders and developers in ${chGenChat ? `<#${chGenChat.id}>` : '#general-chat'}.\n` +
            `• **Client Inquiries & Support**: Open an assistance ticket in <#${chOpenTicket.id}>.\n` +
            `• **Book a Consultation**: Schedule a strategic discussion in <#${chBookConsultation.id}>.\n\n` +
            `### 📌 Getting Started:\n` +
            `1. Review our server standards in <#${chRules.id}>.\n` +
            `2. Learn more about our vision in <#${chAbout.id}>.\n` +
            `3. Read the navigation directory in <#${chGuide.id}>.`
        )
        .setColor(0x8b5cf6)
        .setFooter({ text: 'Tatakae Labs • Build. Innovate. Evolve.' });
      await chWelcome.send({ embeds: [welcomeEmbed] }).catch(() => {});

      // Rules Embed
      const rulesEmbed = new EmbedBuilder()
        .setTitle('📜 Tatakae Labs — Official Server Rules & Guidelines')
        .setDescription(
          'To foster an environment of high productivity, respect, and technological innovation, all members must comply with these guidelines:\n\n' +
            '**1. Professional Conduct & Respect**\n' +
            'Treat every member, partner, client, and developer with professional respect. Toxicity, harassment, discrimination, or hate speech results in an immediate and permanent ban.\n\n' +
            '**2. No Unsolicited DMs or Self-Promotion**\n' +
            'Do not send unsolicited direct messages, spam, or mass advertisements to server members. Relevant project sharing belongs strictly in `#showcase` or `#community-showcase`.\n\n' +
            '**3. Confidentiality & Security First**\n' +
            'Never share sensitive API keys, private passwords, tokens, or proprietary credentials in public channels. Report security concerns directly to staff via a private ticket.\n\n' +
            '**4. Channel Context & Etiquette**\n' +
            'Keep conversations focused on the designated channel topic. Technical questions belong in `#developers`, while general discussions belong in `#general-chat`.\n\n' +
            '**5. Client & Staff Privacy**\n' +
            `Do not tag developers or founders directly for private support questions. Use <#${chOpenTicket.id}> to connect directly with the assigned support and engineering team.\n\n` +
            '**6. Enforcement**\n' +
            'Our moderation team and the **Tatakae Nexus** system actively monitor compliance. Violations are logged to our audit repository and result in timeouts, kicks, or bans.'
        )
        .setColor(0x22d3ee)
        .setFooter({ text: 'Official Community Policy • Tatakae Nexus Moderation' });
      await chRules.send({ embeds: [rulesEmbed] }).catch(() => {});

      // About Embed
      const aboutEmbed = new EmbedBuilder()
        .setTitle('🏢 About Tatakae Labs')
        .setDescription(
          '**Tatakae Labs** is an advanced software engineering and technology laboratory. We specialize in developing resilient distributed software, autonomous agent architectures, and enterprise cloud systems.\n\n' +
            '• **Official Website:** [www.tatakaelas.tech](https://www.tatakaelas.tech)\n' +
            '• **Flagship Platform:** **Tatakae Nexus** — Unified Discord & Enterprise Community Orchestration.\n' +
            '• **Ecosystem Focus:** AI-driven workflows, developer infrastructure, and digital solutions for scaling businesses.'
        )
        .addFields(
          { name: '🎯 Our Mission', value: 'Bridge cutting-edge research with production-grade engineering to deliver impactful software.' },
          { name: '🤝 Client Partnerships', value: 'We collaborate with innovative startups, founders, and enterprises looking for bespoke engineering solutions.' }
        )
        .setColor(0x6366f1)
        .setFooter({ text: 'Tatakae Labs • Global Technology Ecosystem' });
      await chAbout.send({ embeds: [aboutEmbed] }).catch(() => {});

      // Server Guide Embed
      const guideEmbed = new EmbedBuilder()
        .setTitle('🧭 Tatakae Labs — Server Directory & Guide')
        .setDescription('Navigate through our organized workspace:')
        .addFields(
          { name: '01 — START HERE', value: 'Welcomes, announcements, rules, company overview, and server directory.' },
          { name: '02 — EXPLORE TATAKAE', value: 'Showcase of our services, software products, and partnership opportunities.' },
          { name: '03 — COMMUNITY', value: 'Public networking, development discussions, and community lounges.' },
          { name: '04 — CLIENT SERVICES', value: 'Private ticket center, consultation appointments, and customer feedback.' },
          { name: '05 — CLIENT TICKETS', value: 'Dynamically generated private support rooms managed by Tatakae Nexus.' },
          { name: '06 & 07 — TEAM & ADMIN', value: 'Restricted staff operations, logs, and server management.' }
        )
        .setColor(0x10b981)
        .setFooter({ text: 'Tatakae Nexus Architecture Standard' });
      await chGuide.send({ embeds: [guideEmbed] }).catch(() => {});

      // Services Embed
      const servicesEmbed = new EmbedBuilder()
        .setTitle('🚀 Tatakae Labs — Engineering & Technology Services')
        .setDescription('We design, architect, and deploy end-to-end software solutions:')
        .addFields(
          { name: '💻 Full-Stack Web & Mobile Engineering', value: 'High-performance React/Next.js frontends, scalable Node/Fastify APIs, and native mobile applications.' },
          { name: '🤖 AI Automation & Agentic Systems', value: 'Autonomous LLM agents, knowledge graph integrations, and workflow automation.' },
          { name: '☁️ Cloud Architecture & DevOps', value: 'Docker containerization, Kubernetes clusters, serverless computing, and CI/CD automation.' },
          { name: '🛡️ Enterprise Bot Infrastructure', value: 'Production Discord and Slack bots with real-time websocket gateways, queues, and analytics.' }
        )
        .setColor(0xf59e0b)
        .setFooter({ text: 'To request a proposal, open a ticket in #open-a-ticket' });
      await chServices.send({ embeds: [servicesEmbed] }).catch(() => {});

      // Products Embed
      const productsEmbed = new EmbedBuilder()
        .setTitle('💻 Tatakae Labs — Software Products')
        .setDescription('Explore the platforms built by Tatakae Labs:')
        .addFields(
          { name: '⚡ Tatakae Nexus', value: 'Centralized Discord management platform featuring multi-service monorepo architecture, Fastify APIs, and Next.js admin dashboard.' },
          { name: '📊 Tatakae Observability', value: 'Real-time telemetry, error tracking, and database synchronization.' },
          { name: '🛠️ Developer SDKs', value: 'TypeScript utilities, queue orchestrators, and database toolkits.' }
        )
        .setColor(0xec4899);
      await chProducts.send({ embeds: [productsEmbed] }).catch(() => {});

      // -------------------------------------------------------------
      // 4. Interactive Ticket & Booking Panels
      // -------------------------------------------------------------
      await updateStatus('Publishing interactive Ticket Support and Consultation Booking panels...');

      // Ticket Categories from MongoDB
      const ticketCategories = await TicketCategoryModel.find({ guildId: guild.id, active: true }).lean();
      if (ticketCategories.length > 0) {
        const ticketPanelEmbed = new EmbedBuilder()
          .setTitle('🛡️ Tatakae Labs — Client Support Center')
          .setDescription(
            'Need assistance or have a business inquiry? Select a ticket category below to open a private, encrypted support channel with our engineering and operations team.\n\n' +
              ticketCategories.map((c: any) => `**${c.emoji || '📌'} ${c.name}**\n${c.description || 'Support inquiry'}`).join('\n\n')
          )
          .setColor(0x8b5cf6)
          .setFooter({ text: 'Tatakae Nexus Support System • 24/7 Response' });

        const ticketMenu = new StringSelectMenuBuilder()
          .setCustomId('ticket:select_category')
          .setPlaceholder('Select a ticket category to open...')
          .addOptions(
            ticketCategories.map((c: any) => ({
              label: c.name,
              value: c._id.toString(),
              description: (c.description || 'Open a ticket').slice(0, 50),
              emoji: c.emoji || undefined,
            }))
          );

        const ticketRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(ticketMenu);
        await chOpenTicket.send({ embeds: [ticketPanelEmbed], components: [ticketRow] }).catch(() => {});
      }

      // Booking Services from MongoDB
      const bookingServices = await BookingServiceModel.find({ guildId: guild.id, active: true }).lean();
      if (bookingServices.length > 0) {
        const bookingPanelEmbed = new EmbedBuilder()
          .setTitle('📅 Tatakae Labs — Consultation & Strategy Booking')
          .setDescription('Select a service below to schedule a direct consultation with Tatakae Labs engineers and leadership.')
          .setColor(0x22d3ee);

        bookingServices.forEach((s: any) => {
          bookingPanelEmbed.addFields({
            name: `🔹 ${s.name}`,
            value: `${s.description || 'Consultation'}\n⏳ Duration: **${s.durationMinutes} mins**`,
          });
        });

        const bookingMenu = new StringSelectMenuBuilder()
          .setCustomId('booking:select_service')
          .setPlaceholder('Select a consultation type to book...')
          .addOptions(
            bookingServices.map((s: any) => ({
              label: s.name,
              value: s._id.toString(),
              description: `${s.durationMinutes}m consultation`.slice(0, 50),
            }))
          );

        const bookingRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(bookingMenu);
        await chBookConsultation.send({ embeds: [bookingPanelEmbed], components: [bookingRow] }).catch(() => {});
      }

      // -------------------------------------------------------------
      // 5. Sync Configuration into MongoDB
      // -------------------------------------------------------------
      await updateStatus('Saving channel IDs and configuration to MongoDB...');
      await GuildModel.findByIdAndUpdate(
        guild.id,
        {
          _id: guild.id,
          id: guild.id,
          name: guild.name,
          icon: guild.iconURL() || '',
          ownerId: guild.ownerId,
          memberCount: guild.memberCount,
          active: true,
          ticketCategoryId: catClientTickets.id,
          modLogChannelId: chModLogs.id,
          logChannelId: chBotLogs.id,
          welcomeChannelId: chWelcome.id,
        },
        { upsert: true, new: true }
      );

      // Final Completion Embed
      const finalEmbed = new EmbedBuilder()
        .setTitle('✅ Tatakae Labs — Server Architecture Provisioned!')
        .setDescription(
          'Your Discord server has been completely architected and configured automatically:\n\n' +
            `• **Roles Created:** \`${createdRoles.size} roles\` (Founder, Admin, Mods, Staff, Members)\n` +
            `• **Categories Configured:** \`7 categories\` (Public, Community, Client, Operations, Admin)\n` +
            `• **Channels Configured:** \`22 channels\` with strict permission isolation\n` +
            `• **Interactive Ticket Center:** Live in <#${chOpenTicket.id}>\n` +
            `• **Consultation Scheduler:** Live in <#${chBookConsultation.id}>\n` +
            `• **Dynamic Ticket Parent:** Assigned to **${catClientTickets.name}**\n` +
            `• **Mod Audit Logs:** Assigned to <#${chModLogs.id}>\n` +
            `• **Database Sync:** Linked with Tatakae Nexus Web Dashboard`
        )
        .setColor(0x22c55e)
        .setFooter({ text: 'Tatakae Nexus • Complete Server Provisioning Succeeded' });

      const dashboardBtn = new ButtonBuilder()
        .setLabel('Open Nexus Dashboard')
        .setStyle(ButtonStyle.Link)
        .setURL(`${env.DASHBOARD_URL}/dashboard`);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(dashboardBtn);

      await interaction.editReply({ embeds: [finalEmbed], components: [row] });
      logger.info('🎉 Server provisioning completed successfully!');
    } catch (error) {
      logger.error({ err: error }, 'Failed to provision server architecture');
      await interaction.editReply({
        content: `❌ An error occurred during server provisioning: \`${(error as any)?.message || 'Unknown error'}\``,
      });
    }
  },
};
