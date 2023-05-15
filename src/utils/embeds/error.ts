import { EmbedBuilder } from 'discord.js';

export class ErrorEmbed extends EmbedBuilder {
    constructor(eventId: string) {
        super();

        super
            .setColor('Red')
            .setTitle('Uh Oh :/')
            .setDescription("An error has occured. Don't worry, a developer has been notified!")
            .addFields({ name: 'Error Code', value: `\`${eventId}\`` })
            .setFooter({ text: 'If the error persists, contact support with the error code.' });
    }
}
