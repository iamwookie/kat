import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from "@structures/index.js";
import chalk from "chalk";

export class SubscriptionCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "subscriptionCreate");
    }

    async execute(subscription: MusicSubscription) {
        setTimeout(() => {
            {
                if (!subscription.active || !subscription.queue.length) subscription.destroy()
                console.warn(chalk.yellowBright(`Music >> Subscription Destroyed (Inactivity) for ${subscription.guild.name} (${subscription.guild.id}).`))
            }
        }, 15_000);
    }
}
