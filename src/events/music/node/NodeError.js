!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4b37c2f0-3860-5f3c-907d-24dbbbd959d2")}catch(e){}}();
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
        const subscriptions = this.client.dispatcher.subscriptions.values();
        for (const subscription of subscriptions) {
            if (name == subscription.node.name)
                subscription.destroy();
            subscription.textChannel
                .send({ embeds: [new ActionEmbed('fail').setText('The voice node has disconnected. Try playing another track!')] })
                .catch(() => { });
        }
    }
}
//# debugId=4b37c2f0-3860-5f3c-907d-24dbbbd959d2
//# sourceMappingURL=NodeError.js.map
