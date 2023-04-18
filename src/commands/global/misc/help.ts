import { KATClient as Client, Commander, Command, Module } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";

export class HelpCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander);

        this.name = "help";
        this.group = "Misc";
        this.aliases = ["info"];

        this.legacy = true;

        this.description = {
            content: "Stop it, get some help.",
        };

        this.ephemeral = true;
    }

    data() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description?.content!);
    }

    async execute(int: ChatInputCommandInteraction | Message) {
        const author = this.getAuthor(int)!;

        const res = await this.client.cache.getConfig(int.guild?.id!);
        const prefix = res?.prefix || this.client.prefix;

        const replyEmbed = new EmbedBuilder()
            .setTitle("**Help Menu**")
            .setFooter({ text: "Parameters with a '?' at the start are optional." })
            .setDescription(`As of right now, you may use some commands with the \`${prefix}\` prefix in chat. This may be removed in the future!`);

        for (const [name, group] of this.client.commander.groups) {
            if (name == "CLI") continue;

            let reply = "";
            for (const command of group.values()) {
                if (
                    command.hidden ||
                    command.disabled ||
                    (command.module instanceof Module && command.module.guilds && !command.module.guilds.includes(int.guild?.id!)) ||
                    (command.users && !command.users.includes(author.id))
                )
                    continue;

                let aliases = "";
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        aliases += `, ${this.client.prefix}${alias}`;
                    }
                }

                reply += `\`\`${this.client.prefix}${command.name}${aliases}${
                    command.description?.format ? ` ${command.description?.format.replace("[prefix]", this.client.prefix).replace("[aliases]", aliases)}` : ""
                }\`\` → ${command.description?.content}\n`;
            }

            if (reply) replyEmbed.addFields([{ name: `${name} Commands`, value: reply }]);
        }

        this.reply(int, { embeds: [replyEmbed] });
    }
}
