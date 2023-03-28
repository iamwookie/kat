import { Event, KATClient as Client, Commander } from "@structures/index.js";
import { Events, InteractionType, ChatInputCommandInteraction } from "discord.js";
import { ErrorEmbed } from "@src/utils/embeds/index.js";

import chalk from "chalk";

export class InteractionCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.InteractionCreate);
    }

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const command = this.commander.commands.get(interaction.commandName) || this.commander.commands.get(this.commander.aliases.get(interaction.commandName) as string);
        if (!command || command.disabled) return;

        if (!this.commander.validate(interaction, command)) return;

        try {
            await interaction.deferReply({ ephemeral: command.ephemeral });
            await command.execute(this.client, interaction as ChatInputCommandInteraction);
        } catch (err) {
            const eventId = this.client.logger.error(err);
            console.error(chalk.red("Commander (ERROR) >> Error Running Slash Command"));
            console.error(err);

            interaction.reply({ embeds: [new ErrorEmbed(eventId)] });
        }
    }
}
