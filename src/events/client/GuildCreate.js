import { Event } from "../../structures/index.js";
import { Events, PermissionFlagsBits, EmbedBuilder, ChannelType } from "discord.js";
export class GuildCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.GuildCreate);
    }
    async execute(guild) {
        this.client.logger.info(`DISCORD >> Joined guild ${guild.name} (${guild.id}) with ${guild.memberCount} members!`);
        const channel = guild.channels.cache.find((c) => c.type == ChannelType.GuildText && c.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages));
        if (!channel || !channel.isTextBased())
            return;
        const embed = new EmbedBuilder()
            .setTitle("Thanks for adding me!")
            .setColor("White")
            .setThumbnail(this.client.user?.avatarURL() ?? null)
            .setDescription(`✨ KAT is a small multipurpose Discord bot that can play high quality music from YouTube and Spotify!
                \n🎵 Use \`/play\` or \`.play\` to play music!
                \n❓ Use \`/help\` or \`.help\` for the help menu!
                \nVisit the official website here: https://kat.bil.al`);
        channel.send({ embeds: [embed] }).catch(() => { });
    }
}
