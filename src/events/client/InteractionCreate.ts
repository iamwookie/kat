import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { Events, BaseInteraction } from 'discord.js';
import { ErrorEmbed } from '@utils/embeds/index.js';

export class InteractionCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.InteractionCreate);
    }

    async execute(interaction: BaseInteraction) {
        if (!interaction.isChatInputCommand() || interaction.user.bot) return;

        const command = this.commander.commands.get(interaction.commandName);
        if (!command || command.disabled) return;

        await interaction.deferReply({ ephemeral: command.ephemeral });

        if (!this.commander.authorize(interaction, command)) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            const eventId = this.client.logger.error(err, 'Error Running Slash Command', 'Commander');
            interaction.editReply({ embeds: [new ErrorEmbed(eventId)] }).catch(() => {});
        }
    }
}
