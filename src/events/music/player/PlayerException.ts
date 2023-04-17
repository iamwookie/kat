import { Event, KATClient as Client, Commander, Subscription as MusicSubscription } from "@structures/index.js";
import { TrackExceptionEvent } from "shoukaku";

import chalk from "chalk";

export class PlayerException extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "playerException");
    }

    async execute(subscription: MusicSubscription, reason: TrackExceptionEvent) {
        this.client.logger.error(reason);
        console.error(chalk.red(`Music >> Exception in ${subscription.guild.name} (${subscription.guild.id}). Node: ${subscription.node.name}`));

        subscription.active?.onError(reason);
        subscription.looped = false;
        subscription.active = null;
        subscription.process();
    }
}
