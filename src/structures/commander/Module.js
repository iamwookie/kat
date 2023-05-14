import { Collection } from 'discord.js';
import { EventEmitter } from 'events';
export class Module extends EventEmitter {
    client;
    commander;
    name;
    guilds;
    commands = new Collection();
    constructor(client, commander, options) {
        super({ captureRejections: true });
        this.client = client;
        this.commander = commander;
        this.name = options.name;
        this.guilds = options.guilds;
        this.on('error', (err) => {
            this.client.logger.error(err, 'An Error Has Occured', `Module ${this.name}`);
        });
    }
}
