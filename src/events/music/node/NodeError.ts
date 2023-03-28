import { Event, KATClient as Client, Commander } from "@structures/index.js";
import { ActionEmbed } from "@utils/embeds/index.js";

import chalk from "chalk";

export class NodeError extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "nodeDisconnect");
    }

    async execute(name: string, error: Error) {
        const eventId = this.client.logger.error(error);
        console.error(chalk.red(`Music >> Lavalink Node: ${name} has had an error! Event ID: ${eventId}`));

        const subscriptions = this.client.subscriptions;
        for (const subscription of subscriptions.values()) {
            if (subscription.node.name == name) subscription.destroy();
            subscription.textChannel?.send({ embeds: [new ActionEmbed("fail").setDesc("The voice node has disconnected. Try playing another track!")] }).catch(() => {});
        }
    }
}
