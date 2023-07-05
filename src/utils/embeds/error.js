!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3d58c9ab-a94e-5a6f-a85f-fc3112bebd34")}catch(e){}}();
import { EmbedBuilder } from 'discord.js';
export class ErrorEmbed extends EmbedBuilder {
    constructor(eventId) {
        super();
        super
            .setColor('Red')
            .setTitle('Uh Oh :/')
            .setDescription("An error has occured. Don't worry, a developer has been notified!")
            .addFields({ name: 'Error Code', value: `\`${eventId}\`` })
            .setFooter({ text: 'If the error persists, contact support with the error code.' });
    }
}
//# debugId=3d58c9ab-a94e-5a6f-a85f-fc3112bebd34
//# sourceMappingURL=error.js.map
