import { Event } from '../../../structures/index.js';
import { PlayerError } from '../../../utils/errors.js';
import { ActionEmbed } from '../../../utils/embeds/action.js';
import { MusicPrompts } from '../../../../enums.js';
export class PlayerException extends Event {
    constructor(client, commander) {
        super(client, commander, 'playerException');
    }
    async execute(subscription, data) {
        this.client.logger.error(new PlayerError(data.exception?.message), `Player Exception In: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Music');
        subscription.looped = false;
        subscription.active = null;
        subscription.process();
        subscription.textChannel.send({ embeds: [new ActionEmbed().setText(MusicPrompts.TrackError)] }).catch(() => { });
    }
}
