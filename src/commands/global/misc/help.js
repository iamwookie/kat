import { Command, Module } from "../../../structures/index.js";
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from "discord.js";
export class HelpCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: "help",
            group: "Misc",
            aliases: ["info"],
            legacy: true,
            description: {
                content: "Stop it, get some help.",
            },
            ephemeral: true,
        });
    }
    data() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description?.content);
    }
    async execute(int) {
        const author = this.getAuthor(int);
        const embed = new EmbedBuilder().setTitle("**Help Menu**").setDescription(`Select an option from the dropdown menu below.`);
        const menu = new StringSelectMenuBuilder().setCustomId("help_menu").setPlaceholder("Select a category");
        // In future, won't have to do this as groups will be replaced with modules
        for (const [group, commands] of this.client.commander.groups) {
            if (group == "CLI")
                continue;
            for (const command of commands.values()) {
                if (command.hidden ||
                    command.disabled ||
                    (command.module instanceof Module && command.module.guilds && !command.module.guilds.includes(int.guild?.id)) ||
                    (command.users && !command.users.includes(author.id)))
                    continue;
                if (!menu.options.find((o) => o.data.value == group))
                    menu.addOptions(new StringSelectMenuOptionBuilder().setLabel(group + " Commands").setValue(group));
            }
        }
        const reply = await this.reply(int, { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
        const filter = (i) => i.isStringSelectMenu() && i.customId == "help_menu" && i.message.id == reply.id && i.user.id == author.id;
        const collector = int.channel?.createMessageComponentCollector({ filter, time: 60_000, max: 1 });
        collector?.on("collect", async (i) => {
            const group = i.values[0];
            const commands = this.client.commander.groups.get(group);
            const res = await this.client.cache.guilds.get(i.guild?.id);
            const prefix = res?.prefix || this.client.legacyPrefix;
            embed.setFooter({ text: "Parameters with a '?' at the start are optional." });
            embed.setDescription(`As of right now, you may use some commands with the \`${prefix}\` prefix in chat. This may be removed in the future!`);
            embed.addFields({
                name: group + " Commands",
                value: Array.from(commands.values())
                    .map((c) => `\`${c.usage}\` → ${c.description?.content}`)
                    .join("\n"),
            });
            this.edit(int, reply, { embeds: [embed], components: [] });
        });
        collector?.on("end", (collected, reason) => {
            if (!collected.size && reason == "time") {
                menu.setDisabled(true);
                this.edit(int, reply, { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
            }
        });
    }
}
