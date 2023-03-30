import { Shoukaku, Connectors } from "shoukaku";
import Config from "../configs/lavalink.json" assert { type: "json" };
import chalk from "chalk";
import { Collection } from 'discord.js';
export class ShoukakuClient extends Shoukaku {
    client;
    retries = new Collection();
    constructor(client) {
        super(new Connectors.DiscordJS(client), Config.nodes, {
            moveOnDisconnect: false,
            restTimeout: 5000,
        });
        this.client = client;
        this.client = client;
        this.on("error", (name, error) => this.client.emit("nodeError", name, error));
        this.on("ready", (name) => this.client.emit("nodeReady", name));
        this.on("reconnecting", (name, info, tries) => this.client.emit("nodeReconnecting", name, info, tries));
        this.on("disconnect", (name) => this.client.emit("nodeDisconnect", name));
        this.on("close", (name, code) => this.client.emit("nodeClose", name, code));
        chalk.greenBright.bold.underline(">>> Shoukaku Initialized");
    }
}
