import { Event, KATClient as Client, Commander } from "@structures/index.js";
import { Events, Guild, PermissionFlagsBits, EmbedBuilder, ChannelType } from "discord.js";

export class GuildCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.GuildCreate);
    }

    async execute(guild: Guild) {
        this.commander.modules.forEach((module) => {
            if (module.guilds?.includes(guild.id)) module.onGuildCreate(guild);
        });

        const channel = guild.channels.cache.find((c) => c.type == ChannelType.GuildText && c.permissionsFor(guild.members.me!)?.has(PermissionFlagsBits.SendMessages));
        if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder()
                .setColor("White")
                .setTitle("Thanks for adding me!")
                .setThumbnail(this.client.user?.avatarURL() ?? null)
                .setDescription(
                    `✨ KAT is a small multipurpose Discord bot that can play high quality music from YouTube and Spotify!
                \n🎵 Use \`/play\` or \`.play\` to play music!
                \n❓ Use \`/help\` or \`.help\` for the help menu!
                \nVisit the official website here: https://kat.bil.al`
                );

            channel.send({ embeds: [embed] }).catch(() => {});
        }

        this.client.logger.info(`DISCORD >> Joined guild ${guild.name} (${guild.id}) with ${guild.memberCount} members!`);
    }
}
