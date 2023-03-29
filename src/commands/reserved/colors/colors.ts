import { KATClient as Client, Commander, Command } from "@structures/index.js";

import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, GuildMember, Guild, Snowflake } from "discord.js";
import { ActionEmbed } from "@src/utils/embeds/index.js";

export class ColorCommand extends Command {
    constructor(commander: Commander) {
        super(commander);

        this.name = "colors";
        this.group = "Color";
        this.description = {
            content: "Set a color for yourself.",
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
            .setDMPermission(false);
    }

    async execute(client: Client, int: ChatInputCommandInteraction) {
        const author = this.getAuthor(int)!;
        
        if (!client.database) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("The database is not online!")] });

        const colors = client.colors.get(int.guildId);
        if (!colors || !colors.length) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("There are no colors set for this guild!")] });

        const menu = new StringSelectMenuBuilder().setCustomId("color").setPlaceholder("Select a color");

        for (const id of colors) {
            const role = await int.guild?.roles.fetch(id);

            if (!role) {
                await client.colors.delete(int.guildId!, id);
                continue;
            }

            menu.addOptions({ label: role.name, value: role.id });
        }

        if (!menu.options.length) return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("There are no colors set for this guild!")] });

        menu.addOptions({ label: "None", value: "none" });

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

        this.reply(int, { embeds: [new ActionEmbed().setTitle("Color Menu").setUser(author).setDesc("Select a color from the menu below.")], components: [row] });

        const filter = (i: any) => i.customId === "color" && i.user.id === author.id;
        const collector = int.channel?.createMessageComponentCollector({ filter, time: 60_000 });

        collector?.on("collect", async (i: StringSelectMenuInteraction): Promise<any> => {
            await i.deferReply({ ephemeral: true });

            i.member = i.member as GuildMember;

            if (i.values[0] === "none") {
                try {
                    await client.colors.clear(i.guildId!, i.member);
                    return await i.editReply({ embeds: [new ActionEmbed("success").setUser(author).setDesc("Removed your color roles!")] });
                } catch (err) {
                    client.logger.error(err);
                    return await i.editReply({ embeds: [new ActionEmbed("fail").setUser(author).setDesc("I was unable to remove your color roles!")] });
                }
            }

            const role = int.guild?.roles.cache.get(i.values[0]);
            if (!role) return await i.editReply({ embeds: [new ActionEmbed("fail").setUser(author).setDesc("The role was not found!")] });

            if (i.member.roles.cache.has(role.id)) return await i.editReply({ embeds: [new ActionEmbed("fail").setUser(author).setDesc("You already have this role!")] });

            try {
                await client.colors.clear(i.guildId!, i.member);
                await i.member.roles.add(role);
                return await i.editReply({ embeds: [new ActionEmbed().setColor(role.color).setUser(author).setDesc(`✅ \u200b You have been given \`${role.name}\`!`)] });
            } catch (err) {
                client.logger.error(err);
                return await i.editReply({ embeds: [new ActionEmbed("fail").setUser(author).setDesc("I was unable to add the role to you! Are you sure I have permissions?")] });
            }
        });

        collector?.on("end", async (_, reason): Promise<any> => {
            if (reason === "time") return this.reply(int, { embeds: [new ActionEmbed("fail").setUser(author).setDesc("This menu has expired!")], components: [] })?.catch(() => { });
        });
    }
}
