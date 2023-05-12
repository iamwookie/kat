import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
import { ErrorEmbed } from '../../utils/embeds/index.js';
export class InteractionCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.InteractionCreate);
    }
    async execute(interaction) {
        if (interaction.user.bot || !interaction.isChatInputCommand())
            return;
        const command = this.commander.commands.get(interaction.commandName) ||
            this.commander.commands.get(this.commander.aliases.get(interaction.commandName));
        if (!command || command.disabled)
            return;
        await interaction.deferReply({ ephemeral: command.ephemeral });
        if (!this.commander.authorize(interaction, command))
            return;
        try {
            await command.execute(interaction);
        }
        catch (err) {
            const eventId = this.client.logger.error(err, 'Error Running Slash Command', 'Commander');
            interaction.editReply({ embeds: [new ErrorEmbed(eventId)] }).catch(() => { });
        }
    }
}
