import { Event } from "../../../structures/index.js";
export class PlayerStart extends Event {
    constructor(client, commander) {
        super(client, commander, "nodeDisconnect");
    }
    async execute(subscription) {
        subscription.active?.onStart();
        this.client.logger.info(`Music >> Started Playing in ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`);
    }
}
