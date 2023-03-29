import { Event } from "../../../structures/index.js";
import chalk from "chalk";
export class PlayerException extends Event {
    constructor(client, commander) {
        super(client, commander, "playerException");
    }
    async execute(subscription, reason) {
        this.client.logger.error(reason);
        console.error(chalk.red(`Music >> Exception in ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`));
        subscription.active?.onError(reason);
        subscription.active = null;
        subscription.process();
    }
}
