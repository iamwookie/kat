import { KATClient as Client, Commander, Command } from "@structures/index.js";

import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export class HelpCommand extends Command {
    constructor(commander: Commander) {
        super(commander);

        this.name = "help";
        this.group = "Misc";
        this.aliases = ["info"];
        this.description = {
            content: "Stop it. Get some help.",
        };

        this.data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description.content!);
    }

    async execute(client: Client, int: ChatInputCommandInteraction) {
        const replyEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('**Help Menu**')
            .setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL() ?? undefined })
            .setFooter({ text: 'Parameters with a \'?\' at the start are optional.' });

        for (const [g, group] of client.commander.groups) {
            if (g == 'CLI') continue;

            let reply = '';
            for (const [_, command] of group) {
                if (command.hidden || command.disabled || (command.guilds && (!int.guild || !command.guilds.includes(int.guild.id)) || (command.users && !command.users.includes(int.user.id)))) continue;

                let aliases = "";
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        aliases += `, ${client.prefix}${alias}`;
                    }
                }
                
                reply += `\`\`${client.prefix}${command.name}${aliases}${command.description?.format ? ` ${command.description?.format.replace('[prefix]', client.prefix).replace('[aliases]', aliases)}` : ''}\`\` → ${command.description?.content}\n`;
            }

            if (reply) replyEmbed.addFields([{ name: `${g} Commands`, value: reply }]);
        }

        return await int.editReply({ embeds: [replyEmbed] });
    }
}
