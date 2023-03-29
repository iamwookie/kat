import { KATClient as Client, Commander, Command } from "@structures/index.js";

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, GuildMember } from "discord.js";
import { ActionEmbed } from "@src/utils/embeds/index.js";

export class AddColorCommand extends Command {
    constructor(commander: Commander) {
        super(commander);

        this.name = "add-color";
        this.group = "Color";
        this.description = {
            content: "Add a color role.",
            format: "<role>",
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
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .addRoleOption((option) => {
                option.setName("role")
                .setDescription("The color role to add.")
                .setRequired(true);
                return option;
            });
    }

    async execute(client: Client, int: ChatInputCommandInteraction) {
        const author = this.getAuthor(int)!;

        if (!client.database) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("The database is not online!")] });
        
        const roleId = this.getArgs(int)[0];
        if (!roleId) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("Please provide a role ID!")] });

        const role = await int.guild?.roles.fetch(roleId as string);
        if (!role) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("Invalid role ID!")] });

        const colors = client.colors.get(int.guildId);
        if (colors && Object.values(colors).includes(role.id)) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("This role is already a color!")] });

        await client.colors.create(int.guildId!, role.id);

        return this.reply(int, { embeds: [new ActionEmbed().setColor(role.color).setUser(author).setDesc(`✅ \u200b Added \`${role.name}\` as a color!`)] });
    }
}
