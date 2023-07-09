!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="72c1fa75-7828-5237-8e93-02b038f0e709")}catch(e){}}();
import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
import { ErrorEmbed } from '../../utils/embeds/index.js';
export class InteractionCreate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.InteractionCreate);
    }
    async execute(interaction) {
        if (!interaction.isChatInputCommand() || interaction.user.bot)
            return;
        const command = this.commander.commands.get(interaction.commandName);
        if (!command || command.disabled)
            return;
        await interaction.deferReply({ ephemeral: command.ephemeral });
        if (!this.commander.validate(interaction, command))
            return;
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
//# debugId=72c1fa75-7828-5237-8e93-02b038f0e709
//# sourceMappingURL=InteractionCreate.js.map
