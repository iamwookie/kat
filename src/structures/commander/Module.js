!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="47b94fc6-389b-55ce-b153-483565e7bcd4")}catch(e){}}();
import { Collection } from 'discord.js';
import { EventEmitter } from 'events';
export class Module extends EventEmitter {
    client;
    commander;
    name;
    guilds;
    commands;
    constructor(client, commander, options) {
        super({ captureRejections: true });
        this.client = client;
        this.commander = commander;
        this.name = options.name;
        this.guilds = options.guilds;
        this.commands = new Collection();
        this.on('error', (err) => {
            this.client.logger.error(err, 'An Error Has Occured', `Module ${this.name}`);
        });
    }
}
//# debugId=47b94fc6-389b-55ce-b153-483565e7bcd4
//# sourceMappingURL=Module.js.map
