import { EmbedBuilder } from 'discord.js';

export class ReviewEmbed extends EmbedBuilder {
    constructor() {
        super();

        super
            .setColor('#ff3366')
            .setTitle('Enjoying KAT?')
            .setDescription(
                'Help us keep KAT free forever by leaving a quick review. It only takes a few seconds and helps us out a lot. Thank you! 🙌'
            );
    }
}
