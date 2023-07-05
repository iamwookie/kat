!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ecce6931-94ba-5f47-ab44-84a761f96704")}catch(e){}}();
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
//# debugId=ecce6931-94ba-5f47-ab44-84a761f96704
//# sourceMappingURL=PlayerException.js.map
