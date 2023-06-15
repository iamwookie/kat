import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
export class ReviewEmbed extends EmbedBuilder {
    constructor() {
        super();
        super
            .setColor('#ff3366')
            .setTitle('Enjoying KAT?')
            .setDescription('Help us keep KAT free forever by leaving a quick review. It only takes a few seconds and helps us out a lot. Thank you! 🙌');
    }
    get row() {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setURL('https://top.gg/bot/916639727220846592#reviews').setLabel('Leave a review').setStyle(ButtonStyle.Link));
    }
}
