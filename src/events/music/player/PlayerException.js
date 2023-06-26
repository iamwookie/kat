import { Event, Events, MusicPrompts, PlayerError } from '../../../structures/index.js';
import { ActionEmbed } from '../../../utils/embeds/action.js';
export class PlayerException extends Event {
    constructor(client, commander) {
        super(client, commander, Events.PlayerException);
    }
    async execute(subscription, data) {
        this.client.logger.error(new PlayerError(data.exception?.message), `Player Exception In: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Dispatcher');
        subscription.looped = false;
        subscription.active = null;
        subscription.process();
        subscription.textChannel.send({ embeds: [new ActionEmbed().setText(MusicPrompts.TrackError)] }).catch(() => { });
    }
}
