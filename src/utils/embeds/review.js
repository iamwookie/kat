!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="bedeb5be-d3db-5553-b0b8-6db63e805587")}catch(e){}}();
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
//# debugId=bedeb5be-d3db-5553-b0b8-6db63e805587
//# sourceMappingURL=review.js.map
