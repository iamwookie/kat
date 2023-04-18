import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { ActionEmbed } from "../../../utils/embeds/action.js";
export class PrefixCommand extends Command {
    constructor(client, commander) {
        super(client, commander);
        this.name = "prefix";
        this.group = "Misc";
        this.legacy = true;
        this.description = {
            content: "Set the chat prefix for your guild.",
            format: "<prefix>",
        };
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content)
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption((option) => option.setName("prefix").setRequired(true).setDescription("The prefix to set."));
    }
    async execute(int) {
        if (!int.member?.permissions.has(PermissionFlagsBits.Administrator))
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You do not have permission to use this command!")] });
        const args = this.getArgs(int)[0];
        if (!args)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You did not provide a valid prefix!")] });
        const res = await this.client.prisma.guild.upsert({
            where: {
                guildId: int.guild.id,
            },
            update: {
                prefix: args,
            },
            create: {
                guildId: int.guild.id,
                prefix: args,
            },
        });
        this.client.cache.update(res.guildId, res);
        if (res) {
            return this.reply(int, { embeds: [new ActionEmbed("success").setDesc(`Successfully set the prefix to \`${res.prefix}\`!`)] });
        }
        else {
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("An error occured while setting the prefix!")] });
        }
    }
}
