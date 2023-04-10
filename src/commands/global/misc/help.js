import { Command } from "../../../structures/index.js";
import { EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
export class HelpCommand extends Command {
    constructor(commander) {
        super(commander);
        this.name = "help";
        this.group = "Misc";
        this.aliases = ["info"];
        this.description = {
            content: "Stop it. Get some help.",
        };
        this.ephemeral = true;
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content);
    }
    async execute(client, int) {
        const author = this.getAuthor(int);
        const replyEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('**Help Menu**')
            .setFooter({ text: 'Parameters with a \'?\' at the start are optional.' })
            .setDescription(`As of right now, you may use commands with the \`${client.legacyPrefix}\` prefix in chat. This may be removed in the future!`);
        for (const [g, group] of client.commander.groups) {
            if (g == 'CLI')
                continue;
            let reply = '';
            for (const [_, command] of group) {
                if (command.hidden || command.disabled || (command.guilds && (!int.guild || !command.guilds.includes(int.guild.id)) || (command.users && !command.users.includes(author.id))))
                    continue;
                let aliases = "";
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        aliases += `, ${client.prefix}${alias}`;
                    }
                }
                reply += `\`\`${client.prefix}${command.name}${aliases}${command.description?.format ? ` ${command.description?.format.replace('[prefix]', client.prefix).replace('[aliases]', aliases)}` : ''}\`\` → ${command.description?.content}\n`;
            }
            if (reply)
                replyEmbed.addFields([{ name: `${g} Commands`, value: reply }]);
        }
        this.reply(int, { embeds: [replyEmbed] });
    }
}
