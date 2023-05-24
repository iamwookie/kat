import { Event } from '../../../structures/index.js';
import { Events } from 'discord.js';
import { ActionEmbed } from '../../../utils/embeds/index.js';
import chalk from 'chalk';
export class NodeError extends Event {
    constructor(client, commander) {
        super(client, commander, 'nodeError');
        this.client.once(this.name, (_, err) => {
            this.client.logger.error(err);
        });
        this.client.emit(Events.Debug, 'Events (NodeError) >> Registered Sub Event');
    }
    async execute(name, error) {
        console.error(chalk.red(`Music >> Node: ${name} Has Had An Error!`));
        console.error(error);
        const subscriptions = this.client.subscriptions;
        for (const subscription of subscriptions.values()) {
            if (subscription.node.name == name)
                subscription.destroy();
            subscription.textChannel
                .send({ embeds: [new ActionEmbed('fail').setText('The voice node has disconnected. Try playing another track!')] })
                .catch(() => { });
        }
    }
}
