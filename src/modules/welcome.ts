import { Module, KATClient as Client, Commander } from '@structures/index.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, DiscordAPIError, EmbedBuilder, Guild, PermissionFlagsBits } from 'discord.js';

export class WelcomeModule extends Module {
    constructor(client: Client, commander: Commander) {
        super(client, commander, { name: 'Welcome' });

        this.on('guildCreate', this.onGuildCreate.bind(this));
    }

    async onGuildCreate(guild: Guild) {
        const channel = guild.channels.cache.find(
            (c) => c.type == ChannelType.GuildText && c.permissionsFor(guild.members.me!).has(this.client.permissions.text)
        );

        if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setColor('White')
                .setTitle('Thanks for adding me!')
                .setThumbnail(this.client.user?.avatarURL() ?? null)
                .setDescription(`✨ KAT is a small multipurpose Discord bot that can play high quality music from **YouTube** and **Spotify**!
                \n🎵 Use \`/play\` or \`.play\` to play music!
                \n❓ Use \`/help\` or \`.help\` for the help menu!`);

            const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setURL('https://kat.bil.al').setLabel('Website').setStyle(ButtonStyle.Link),
                new ButtonBuilder().setURL('https://kat.bil.al/support').setLabel('Support').setStyle(ButtonStyle.Link),
                new ButtonBuilder().setURL('https://top.gg/bot/916639727220846592#reviews').setLabel('Leave a review').setStyle(ButtonStyle.Link)
            );

            try {
                await channel.send({ embeds: [embed], components: [buttons] });
            } catch (err) {
                if (err instanceof DiscordAPIError && err.code == 50001) {
                    this.client.logger.warn(`Error Sending Guild Join Message: ${err.message}`, `Module (${this.name})`);
                } else {
                    this.client.logger.error(err, 'Error Sending Guild Join Message', `Module (${this.name})`);
                }
            }
        }
    }
}
