import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { ActionEmbed } from "../../../utils/embeds/index.js";
export class ColorCommand extends Command {
    constructor(commander) {
        super(commander);
        this.name = "color";
        this.group = "Colors";
        this.description = {
            content: "Set a color for yourself.",
        };
        this.cooldown = 5;
        this.guilds = ["858675408140369920"];
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content)
            .setDMPermission(false);
    }
    async execute(client, int) {
        const colors = client.colors.get(int.guildId);
        if (!colors)
            return await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("There are no colors set for this guild!")] });
        const menu = new StringSelectMenuBuilder()
            .setCustomId("color")
            .setPlaceholder("Select a color");
        for (const id of colors) {
            const role = await int.guild?.roles.fetch(id);
            if (!role) {
                await client.colors.delete(int.guildId, id);
                continue;
            }
            ;
            menu.addOptions({ label: role.name, value: role.id });
        }
        const row = new ActionRowBuilder().addComponents(menu);
        await int.editReply({ embeds: [new ActionEmbed("success").setUser(int.user).setDesc("Select a color from the menu below.")], components: [row] });
        const filter = (i) => i.customId === "color" && i.user.id === int.user.id;
        const collector = int.channel?.createMessageComponentCollector({ filter, time: 30000 });
        collector?.on("collect", async (i) => {
            await i.deferReply({ ephemeral: true });
            const role = await int.guild?.roles.fetch(i.values[0]);
            if (!role)
                return await i.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("The role was not found!")] });
            if (i.member?.roles.cache.has(role.id))
                return await i.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("You already have this role!")] });
            try {
                for (const id of colors) {
                    if (i.member?.roles.cache.has(id))
                        await i.member?.roles.remove(id);
                }
                await i.member?.roles.add(role);
                return await i.editReply({ embeds: [new ActionEmbed("success").setUser(int.user).setDesc(`You have been given \`${role.name}\`!`)] });
            }
            catch (err) {
                client.logger.error(err);
                return await i.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("I was unable to add the role to you! Are you sure I have permissions?")] });
            }
        });
        collector?.on("end", async (_, reason) => {
            if (reason === "time")
                return await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("This menu has expired!")], components: [] }).catch((err) => { client.logger.error(err); });
        });
        return Promise.resolve();
    }
}
