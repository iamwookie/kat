import { Event } from '../../../structures/index.js';
import { MusicEmbed } from '../../../utils/embeds/index.js';
export class TrackResume extends Event {
    constructor(client, commander) {
        super(client, commander, 'trackResume');
    }
    async execute(subscription) {
        if (subscription.message?.editable)
            await subscription.message.edit({ embeds: [new MusicEmbed(subscription).setColor('White').setPlaying(subscription.active)] });
    }
}
