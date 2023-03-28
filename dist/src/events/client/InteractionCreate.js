import { Event } from "../../structures/index.js";
import { Events } from "discord.js";
import { ErrorEmbed } from "../../utils/embeds/index.js";
import chalk from "chalk";
export class InteractionCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.InteractionCreate);
    }
    async execute(interaction) {
        if (!interaction.isChatInputCommand())
            return;
        const command = this.commander.commands.get(interaction.commandName) || this.commander.commands.get(this.commander.aliases.get(interaction.commandName));
        if (!command || command.disabled)
            return;
        if (!this.commander.validate(interaction, command))
            return;
        try {
            await interaction.deferReply({ ephemeral: command.ephemeral });
            await command.execute(this.client, interaction);
        }
        catch (err) {
            const eventId = this.client.logger.error(err);
            console.error(chalk.red("Commander (ERROR) >> Error Running Slash Command"));
            console.error(err);
            interaction.reply({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
