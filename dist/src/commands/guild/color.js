import { Command } from "../../structures/index.js";
import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { ActionEmbed, ErrorEmbed } from "../../utils/embeds/index.js";
export class ColorCommand extends Command {
    constructor(commander) {
        super(commander);
        this.name = "color";
        this.aliases = ["dc"];
        this.group = "Music";
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
        for (const [name, id] of Object.entries(colors)) {
            menu.addOptions({ label: name, value: id });
        }
        const row = new ActionRowBuilder().addComponents(menu);
        await int.editReply({ embeds: [new ActionEmbed("success").setUser(int.user).setDesc("Select a color from the menu below.")], components: [row] });
        const filter = (i) => i.customId === "color" && i.user.id === int.user.id;
        const collector = int.channel?.createMessageComponentCollector({ filter, time: 60000 });
        collector?.on("collect", async (i) => {
            await i.deferReply();
            const role = await int.guild?.roles.fetch(i.values[0]);
            if (!role)
                return await i.reply({ embeds: [new ErrorEmbed("The role was not found!")] });
            if (i.member?.roles.cache.has(role.id))
                return await i.reply({ embeds: [new ErrorEmbed("You already have this role!")] });
            try {
                await i.member?.roles.add(role);
                return await i.reply({ embeds: [new ActionEmbed("success").setUser(int.user).setDesc(`You have been given \`${role.name}\`!`)] });
            }
            catch (err) {
                return await i.reply({ embeds: [new ErrorEmbed("I was unable to add the role to you! Are you sure I have permissions?")] });
            }
            // if (!role) return await i.reply({ embeds: [new ErrorEmbed("The role was not found!")] });
            // const member = int.guild?.members.cache.get(int.user.id);
            // if (!member) return await i.reply({ embeds: [new ErrorEmbed("The member was not found!")] });
            // await member.roles.add(role);
            // await i.reply({ embeds: [new ActionEmbed("success").setUser(int.user).setDesc(`You have been given the role: ${role.name}`)] });
        });
        collector?.on("end", async (_, reason) => {
            if (reason === "time")
                return await int.editReply({ embeds: [new ActionEmbed("fail").setUser(int.user).setDesc("You took too long to respond!")] });
        });
    }
}
