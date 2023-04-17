import { Event, KATClient as Client, Commander } from "@structures/index.js";
import { ActionEmbed } from "@utils/embeds/index.js";

import chalk from "chalk";

export class NodeError extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, "nodeError");

        this.client.once(this.name, (_, err) => { this.client.logger.error(err) });
        this.client.logger.info("Events (NodeError) >> Registered Sub Event");
    }

    async execute(name: string, error: Error) {
        console.error(chalk.red(`Music >> Node: ${name} has had an error!`));
        console.error(error);

        const subscriptions = this.client.subscriptions;
        for (const subscription of subscriptions.values()) {
            if (subscription.node.name == name) subscription.destroy();
            subscription.textChannel?.send({ embeds: [new ActionEmbed("fail").setDesc("The voice node has disconnected. Try playing another track!")] }).catch(() => {});
        }
    }
}
