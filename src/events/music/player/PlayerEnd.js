import { Event } from '../../../structures/index.js';
import { ActionEmbed } from '../../../utils/embeds/index.js';
import { MusicPrompts } from '../../../../enums.js';
export class PlayerEnd extends Event {
    constructor(client, commander) {
        super(client, commander, 'playerEnd');
    }
    async execute(subscription) {
        if (!subscription.looped)
            subscription.active = null;
        subscription.process();
        setTimeout(async () => {
            if (!subscription.active && !subscription.queue.length) {
                subscription.destroy();
                subscription.textChannel.send({ embeds: [new ActionEmbed('warn').setText(MusicPrompts.Inactive)] }).catch(() => { });
            }
        }, this.client.config.music.inactiveDuration);
    }
}
