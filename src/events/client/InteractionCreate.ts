import { Event, KATClient as Client, Commander } from "@structures/index.js";
import { Events, BaseInteraction, ChatInputCommandInteraction } from "discord.js";
import { ErrorEmbed } from "@src/utils/embeds/index.js";

import chalk from "chalk";

export class InteractionCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.InteractionCreate);
    }

    async execute(interaction: BaseInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const command = this.commander.commands.get(interaction.commandName) || this.commander.commands.get(this.commander.aliases.get(interaction.commandName) as string);
        if (!command || command.disabled) return;

        if (!this.commander.validate(interaction, command)) return;

        await interaction.deferReply({ ephemeral: command.ephemeral });

        try {
            await command.execute(this.client, interaction);
        } catch (err) {
            const eventId = this.client.logger.error(err);
            console.error(chalk.red("Commander (ERROR) >> Error Running Slash Command"));
            console.error(err);

            interaction.editReply({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
