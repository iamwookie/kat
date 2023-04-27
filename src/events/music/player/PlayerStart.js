import { Event } from '../../../structures/index.js';
export class PlayerStart extends Event {
    constructor(client, commander) {
        super(client, commander, 'playerStart');
    }
    async execute(subscription) {
        subscription.active?.onStart();
        this.client.logger.info(`Started Playing in ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`, 'Music');
    }
}