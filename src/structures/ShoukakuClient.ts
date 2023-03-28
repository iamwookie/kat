import { KATClient as Client } from './Client.js';
import { Shoukaku, Connectors } from "shoukaku";

import Config from "@configs/lavalink.json" assert { type: "json" };

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
    constructor(
        public client: Client
    ) {
        super(
            new Connectors.DiscordJS(client),
            Config.nodes,
            {
                moveOnDisconnect: false,
                reconnectTries: 2,
                restTimeout: 10000,
            }
        );

        this.client = client;

        this.on("error", (name, error) => this.client.emit("nodeError", name, error));
        this.on("ready", (name) => this.client.emit("nodeReady", name));
        this.on("disconnect", (name) => this.client.emit("nodeDisconnect", name));
        this.on("close", (name, code) => this.client.emit("nodeClose", name, code));
        
        chalk.greenBright.bold.underline(">>> Shoukaku Initialized")
    }
}