import { EmbedBuilder } from 'discord.js';

export class ErrorEmbed extends EmbedBuilder {
    constructor(eventId: string) {
        super();

        this.setColor('Red');
        this.setTitle('Uh Oh :/');
        this.setDescription('An error has occured. Don\'t worry, a developer has been notified!');
        this.addFields({ name: 'Error Code', value: `\`${eventId}\`` });
        this.setFooter({ text: 'If the error persists, contact support with the error code.' });
    }
}