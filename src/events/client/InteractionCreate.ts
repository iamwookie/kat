import { Event, KATClient as Client, Commander, Module } from '@structures/index.js';
import { Events, BaseInteraction } from 'discord.js';
import { ErrorEmbed } from '@utils/embeds/index.js';

export class InteractionCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.InteractionCreate);
    }

    async execute(interaction: BaseInteraction) {
        if (!interaction.isChatInputCommand() || !interaction.inGuild()) return;

        const command =
            this.commander.commands.get(interaction.commandName) ||
            this.commander.commands.get(this.commander.aliases.get(interaction.commandName) as string);
        if (!command || command.disabled) return;
        if (command.module.guilds && !command.module.guilds.includes(interaction.guild!.id)) return;

        if (!this.commander.validate(interaction, command)) return;

        await interaction.deferReply({ ephemeral: command.ephemeral });

        try {
            await command.execute(interaction);
        } catch (err) {
            const eventId = this.client.logger.error(err, 'Error Running Slash Command', 'Commander');
            interaction.editReply({ embeds: [new ErrorEmbed(eventId)] }).catch(() => {});
        }
    }
}
