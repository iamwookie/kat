import { KATClient as Client } from './Client.js';
import { Shoukaku, Connectors } from "shoukaku";
import { Collection } from 'discord.js';

import chalk from "chalk";

declare module "shoukaku" {
    interface LavalinkResponse {
        exception?: {
            message: string;
            severity: string;
            cause: string;
        }
    }
}

export class ShoukakuClient extends Shoukaku {
    public retries: Collection<string, number> = new Collection();

    constructor(
        public client: Client
    ) {
        super(
            new Connectors.DiscordJS(client),
            client.config.lavalink.nodes,
            {
                moveOnDisconnect: false,
                restTimeout: 5_000,
            }
        );

        this.client = client;
        
        this.on("error", (name, error) => this.client.emit("nodeError", name, error));
        this.on("ready", (name) => this.client.emit("nodeReady", name));
        this.on("reconnecting", (name, info, tries) => this.client.emit("nodeReconnecting", name, info, tries));
        this.on("disconnect", (name) => this.client.emit("nodeDisconnect", name));
        this.on("close", (name, code) => this.client.emit("nodeClose", name, code));

        chalk.greenBright.bold.underline(">>> Shoukaku Initialized")
    }
}