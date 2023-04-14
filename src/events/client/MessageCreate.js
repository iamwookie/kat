import { Event, Module } from "../../structures/index.js";
import { Events } from "discord.js";
import { ErrorEmbed } from "../../utils/embeds/index.js";
import chalk from "chalk";
export class MessageCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.MessageCreate);
    }
    async execute(message) {
        if (message.author.bot)
            return;
        const prefix = this.client.legacyPrefix;
        if (!message.content.startsWith(prefix))
            return;
        const commandName = message.content.slice(prefix.length).trim().split(/ +/).shift()?.toLowerCase();
        const command = this.commander.commands.get(commandName) || this.commander.commands.get(this.commander.aliases.get(commandName));
        if (!command || command.disabled)
            return;
        // In future modules will always be required
        if (command.module && command.module instanceof Module && !command.module.guilds?.includes(message.guild?.id))
            return;
        if (!this.commander.validate(message, command))
            return;
        try {
            await command.execute(message);
        }
        catch (err) {
            const eventId = this.client.logger.error(err);
            console.error(chalk.red("Commander (ERROR) >> Error Running Chat Command"));
            console.error(err);
            message.channel.send({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
