import { Event, KATClient as Client, Commander, Events, Subscription, MusicPrompts, PlayerError } from '@structures/index.js';
import { TrackExceptionEvent } from 'shoukaku';
import { ActionEmbed } from '@utils/embeds/action.js';

export class PlayerException extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.PlayerException);
    }

    async execute(subscription: Subscription, data: TrackExceptionEvent) {
        this.client.logger.error(
            new PlayerError(data.exception?.message),
            `Player Exception In: ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`,
            'Dispatcher'
        );

        subscription.looped = false;
        subscription.active = null;
        subscription.process();

        subscription.textChannel.send({ embeds: [new ActionEmbed().setText(MusicPrompts.TrackError)] }).catch(() => {});
    }
}
