import { Module } from '../structures/index.js';
import { ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
export class WelcomeModule extends Module {
    constructor(client, commander) {
        super(client, commander, {
            name: 'Welcome',
        });
        this.on('guildCreate', this.onGuildCreate.bind(this));
    }
    async onGuildCreate(guild) {
        const channel = guild.channels.cache.find((c) => c.type == ChannelType.GuildText && c.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages));
        if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setColor('White')
                .setTitle('Thanks for adding me!')
                .setThumbnail(this.client.user?.avatarURL() ?? null)
                .setDescription(`✨ KAT is a small multipurpose Discord bot that can play high quality music from **YouTube** and **Spotify**!
                \n🎵 Use \`/play\` or \`.play\` to play music!
                \n❓ Use \`/help\` or \`.help\` for the help menu!
                \nVisit the official website here: https://kat.bil.al`);
            try {
                await channel.send({ embeds: [embed] });
            }
            catch (err) {
                this.client.logger.error(err, 'Error Sending Guild Join Message', `Module ${this.name}`);
            }
        }
    }
}
