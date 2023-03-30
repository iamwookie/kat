import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { ActionEmbed } from "../../../utils/embeds/index.js";
export class ColorCommand extends Command {
    constructor(commander) {
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
            .setDescription(this.description?.content)
            .setDMPermission(false);
    }
    async execute(client, int) {
        const author = this.getAuthor(int);
        if (!client.database)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("The database is not online!")] });
        this.applyCooldown(author);
        const colors = client.colors.get(int.guildId);
        if (!colors || !colors.length)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("There are no colors set for this guild!")] });
        const menu = new StringSelectMenuBuilder().setCustomId("color").setPlaceholder("Select a color");
        for (const id of colors) {
            const role = await int.guild?.roles.fetch(id);
            if (!role) {
                await client.colors.delete(int.guildId, id);
                continue;
            }
            menu.addOptions({ label: role.name, value: role.id });
        }
        if (!menu.options.length)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("There are no colors set for this guild!")] });
        menu.addOptions({ label: "None", value: "none" });
        const row = new ActionRowBuilder().addComponents(menu);
        this.reply(int, { embeds: [new ActionEmbed().setTitle("Color Menu").setDesc("Select a color from the menu below.")], components: [row] });
        const filter = (i) => i.customId === "color" && i.user.id === author.id;
        const collector = int.channel?.createMessageComponentCollector({ filter, time: 60000 });
        collector?.on("collect", async (i) => {
            await i.deferReply({ ephemeral: true });
            i.member = i.member;
            if (i.values[0] === "none") {
                try {
                    await client.colors.clear(i.guildId, i.member);
                    return this.reply(int, { embeds: [new ActionEmbed("success").setDesc("Removed your color roles!")] });
                }
                catch (err) {
                    client.logger.error(err);
                    return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("I was unable to remove your color roles!")] });
                }
            }
            const role = int.guild?.roles.cache.get(i.values[0]);
            if (!role)
                return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("The role was not found!")] });
            if (i.member.roles.cache.has(role.id))
                return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You already have this role!")] });
            try {
                await client.colors.clear(i.guildId, i.member);
                await i.member.roles.add(role);
                return this.reply(int, { embeds: [new ActionEmbed().setColor(role.color).setDesc(`✅ \u200b You have been given \`${role.name}\`!`)] });
            }
            catch (err) {
                client.logger.error(err);
                return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("I was unable to add the role to you! Are you sure I have permissions?")] });
            }
        });
        collector?.on("end", async (_, reason) => {
            if (reason === "time")
                return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("This menu has expired!")], components: [] })?.catch(() => { });
        });
    }
}
