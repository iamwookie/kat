const { EmbedBuilder } = require('discord.js');

class ErrorEmbed extends EmbedBuilder {
    constructor(eventId) {
        super();

        this.setColor('Red');
        this.setTitle('Uh Oh :/');
        this.setDescription('An error has occured within the internal server. Don\'t worry, a developer has been notified!');
        this.addFields({ name: 'Error Code', value: `\`${eventId}\`` });
        this.setFooter({ text: 'If the error persists, contact support with the error code.' });
    }
}

module.exports = ErrorEmbed;