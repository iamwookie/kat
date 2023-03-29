import { Event } from "../../structures/index.js";
import { Events } from "discord.js";
import { ErrorEmbed } from "../../utils/embeds/index.js";
import chalk from "chalk";
export class MessageCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.MessageCreate);
    }
    async execute(message) {
        const prefix = this.client.legacyPrefix;
        const commandName = message.content.slice(prefix.length).trim().split(/ +/).shift()?.toLowerCase();
        const command = this.commander.commands.get(commandName) || this.commander.commands.get(this.commander.aliases.get(commandName));
        if (!command || command.disabled)
            return;
        if (!this.commander.validate(message, command))
            return;
        try {
            await command.execute(this.client, message);
        }
        catch (err) {
            const eventId = this.client.logger.error(err);
            console.error(chalk.red("Commander (ERROR) >> Error Running Chat Command"));
            console.error(err);
            message.reply({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
