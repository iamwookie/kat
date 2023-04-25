import { KATClient as Client } from '../Client.js';
import { Shoukaku, Connectors } from 'shoukaku';

import chalk from 'chalk';

declare module 'shoukaku' {
    interface LavalinkResponse {
        exception?: {
            message: string;
            severity: string;
            cause: string;
        };
    }
}

export class ShoukakuClient extends Shoukaku {
    constructor(public client: Client) {
        super(new Connectors.DiscordJS(client), client.config.lavalink.nodes, {
            reconnectTries: 10,
            restTimeout: 5_000,
            moveOnDisconnect: false,
        });

        this.on('error', (name, error) => this.client.emit('nodeError', name, error));
        this.on('ready', (name) => this.client.emit('nodeReady', name));
        this.on('reconnecting', (name, info, tries) => this.client.emit('nodeReconnecting', name, info, tries));
        this.on('disconnect', (name) => this.client.emit('nodeDisconnect', name));
        this.on('close', (name, code) => this.client.emit('nodeClose', name, code));

        console.log(chalk.greenBright.bold.underline('>>> Shoukaku Initialized'));
    }
}
