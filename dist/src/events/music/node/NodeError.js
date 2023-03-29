import { Event } from "../../../structures/index.js";
import { ActionEmbed } from "../../../utils/embeds/index.js";
import chalk from "chalk";
export class NodeError extends Event {
    constructor(client, commander) {
        super(client, commander, "nodeError");
    }
    async execute(name, error) {
        if (!this.client.shoukaku.retries.get(name))
            this.client.logger.error(error);
        console.error(chalk.red(`Music >> Lavalink Node: ${name} has had an error!`));
        const subscriptions = this.client.subscriptions;
        for (const subscription of subscriptions.values()) {
            if (subscription.node.name == name)
                subscription.destroy();
            subscription.textChannel?.send({ embeds: [new ActionEmbed("fail").setDesc("The voice node has disconnected. Try playing another track!")] }).catch(() => { });
        }
    }
}