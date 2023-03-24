import { KATClient as Client, Commander, Command } from "@structures/index.js";

import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, EmbedBuilder, GuildTextBasedChannel } from "discord.js";
import { ActionEmbed, TwitchEmbed } from "@src/utils/embeds/index.js";

export class TwitchCommand extends Command {
    constructor(commander: Commander) {
        super(commander);

        this.name = "twitch";
        this.group = "Misc";
        this.description = {
            content: "Sends a twitch stream notification to a chosen channel.",
            format: "<streamer> <channel> <role>",
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
                .setRequired(true)
                return option;
            })
    }

    async execute(client: Client, int: ChatInputCommandInteraction) {
        const streamer = int.options.getString("streamer", true);
        const channel: GuildTextBasedChannel = int.options.getChannel("channel", true);
        const role = int.options.getRole("role", true);

        const stream = await client.twitch.getStream(streamer);
        if (!stream) return await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("Streamer is invalid or not currently streaming!")] });

        const user = await stream.getUser();
        const image = stream.getThumbnailUrl(1280, 720);

        try {
            await channel.send({ embeds: [new TwitchEmbed(user, stream, image)], content: role.toString() });
            return await int.editReply({ embeds: [new ActionEmbed("success").setUser(int.user).setDesc(`Sent a notification to ${channel}!`)] });
        } catch (err) {
            client.logger.error(err);
            return await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("There was an error. Are you sure I have permissions to send messages in that channel?")] });
        }
    }
}
