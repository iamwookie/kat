import { KATClient as Client } from '../Client.js';
import { Command } from './Command.js';
import { Commander } from './Commander.js';
import { Collection, Snowflake } from 'discord.js';
import { EventEmitter } from 'events';

interface ModuleOptions {
    name: string;
    guilds?: Snowflake[];
}

export class Module extends EventEmitter {
    public name: string;
    public guilds?: Snowflake[];
    public commands: Collection<string, Command>;

    constructor(public client: Client, public commander: Commander, options: ModuleOptions) {
        super({ captureRejections: true });

        this.name = options.name;
        this.guilds = options.guilds;
        this.commands = new Collection<string, Command>();

        this.on('error', (err) => {
            this.client.logger.error(err, 'An Error Has Occured', `Module ${this.name}`);
        });
    }
}
