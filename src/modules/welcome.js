!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="bcac655d-7966-5ecc-93b4-60ebe2108fdb")}catch(e){}}();
import { Module } from '../structures/index.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, DiscordAPIError, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
export class WelcomeModule extends Module {
    constructor(client, commander) {
        super(client, commander, { name: 'Welcome' });
        this.on('guildCreate', this.onGuildCreate.bind(this));
    }
    async onGuildCreate(guild) {
        const channel = guild.channels.cache.find((c) => c.type == ChannelType.GuildText && c.permissionsFor(guild.members.me).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]));
        if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setColor('White')
                .setTitle('Thanks for adding me!')
                .setThumbnail(this.client.user?.avatarURL() ?? null)
                .setDescription(`✨ KAT is a small multipurpose Discord bot that can play high quality music from **YouTube** and **Spotify**!
                \n🎵 Use \`/play\` or \`.play\` to play music!
                \n❓ Use \`/help\` or \`.help\` for the help menu!`);
            const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setURL('https://kat.bil.al').setLabel('Website').setStyle(ButtonStyle.Link), new ButtonBuilder().setURL('https://kat.bil.al/support').setLabel('Support').setStyle(ButtonStyle.Link), new ButtonBuilder().setURL('https://top.gg/bot/916639727220846592#reviews').setLabel('Leave a review').setStyle(ButtonStyle.Link));
            try {
                await channel.send({ embeds: [embed], components: [buttons] });
            }
            catch (err) {
                if (err instanceof DiscordAPIError && err.code == 50001) {
                    this.client.logger.warn(`Error Sending Guild Join Message: ${err.message}`, `Module (${this.name})`);
                }
                else {
                    this.client.logger.error(err, 'Error Sending Guild Join Message', `Module (${this.name})`);
                }
            }
        }
    }
}
//# debugId=bcac655d-7966-5ecc-93b4-60ebe2108fdb
//# sourceMappingURL=welcome.js.map
