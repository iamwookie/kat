import { KATClient as Client, Commander, Command } from "@structures/index.js";

import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, GuildTextBasedChannel } from "discord.js";
import { ActionEmbed, TwitchEmbed } from "@src/utils/embeds/index.js";

export class TwitchCommand extends Command {
    constructor(commander: Commander) {
        super(commander);

        this.name = "twitch";
        this.group = "Twitch";
        this.description = {
            content: "Sends a twitch stream notification to a chosen channel.",
            format: "<streamer> <channel> <?role>",
        };

        this.cooldown = 5;
        this.ephemeral = true;

        this.guilds = [
            // KAT Support
            "858675408140369920",

            // Shadow Duo's Lair
            "851503184484106240",
        ];
    }

    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content!)
            .setDMPermission(false)
            .addStringOption((option) => {
                option.setName("streamer")
                .setDescription("The twitch channel name of the streamer to send a notification for.")
                .setRequired(true)
                return option;
            })
            .addChannelOption((option) => {
                option.setName("channel")
                .setDescription("The channel to send the notification to.")
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true)
                return option;
            })
            .addRoleOption((option) => {
                option.setName("role")
                .setDescription("The role to mention in the notification.")
                return option;
            })
    }

    async execute(client: Client, int: ChatInputCommandInteraction) {
        const author = this.getAuthor(int)!;

        const streamer = this.getArgs(int)[0];
        if (!streamer) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You did not provide a streamer's username!")] });

        const channelId = this.getArgs(int)[1];
        if (!channelId) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You did not provide a channel ID to send the notification to!")] });

        const channel = await int.guild?.channels.fetch(channelId as string);
        if (channel && !channel.isTextBased()) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("The channel you provided is not a text channel!")] });

        const roleId = this.getArgs(int)[2];
        const role = roleId ? await int.guild?.roles.fetch(roleId as string) : null;

        const stream = await client.twitch.getStream(streamer as string).catch(() => null);
        if (!stream) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Streamer is invalid or not currently streaming!")] });

        // Watch this for errors in future
        const user = await stream.getUser();
        const image = stream.getThumbnailUrl(1280, 720);

        try {
            await channel?.send({ embeds: [new TwitchEmbed(user, stream, image)], content: role?.toString() ?? undefined });
            return this.reply(int, { embeds: [new ActionEmbed("success").setDesc(`Sent a notification to ${channel}!`)] });
        } catch (err) {
            client.logger.error(err);
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("There was an error. Are you sure I have permissions to send messages in that channel?")] });
        }
    }
}
