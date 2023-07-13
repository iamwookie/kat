import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { Events } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';

import chalk from 'chalk';

export class NodeError extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, 'nodeError');

        this.client.once(this.name, (_, err) => {
            this.client.logger.error(err);
        });
        
        this.client.emit(Events.Debug, 'Events (NodeError) >> Registered Sub Event');
    }

    async execute(name: string, error: Error) {
        console.error(chalk.red(`Music >> Node: ${name} Has Had An Error!`));
        console.error(error);

        const subscriptions = this.client.dispatcher.subscriptions.values();
        for (const subscription of subscriptions) {
            if (name == subscription.node.name) subscription.destroy();
            subscription.textChannel
                .send({ embeds: [new ActionEmbed('fail').setText('The voice node has disconnected. Try playing another track!')] })
                .catch(() => {});
        }
    }
}
