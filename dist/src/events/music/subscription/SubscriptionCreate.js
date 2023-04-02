import { Event } from "../../../structures/index.js";
import chalk from "chalk";
export class SubscriptionCreate extends Event {
    constructor(client, commander) {
        super(client, commander, "subscriptionCreate");
    }
    async execute(subscription) {
        this.client.logger.info(`Music >> Subscription Created for ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`);
        setTimeout(() => {
            {
                if (!subscription.active || !subscription.queue.length)
                    subscription.destroy();
                console.warn(chalk.yellowBright(`Music >> Subscription Destroyed (Inactivity) for ${subscription.guild.name} (${subscription.guild.id}).`));
            }
        }, 15_000);
    }
}
