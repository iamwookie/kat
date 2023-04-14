import { Shoukaku, Connectors } from "shoukaku";
import chalk from "chalk";
export class ShoukakuClient extends Shoukaku {
    client;
    constructor(client) {
        super(new Connectors.DiscordJS(client), client.config.lavalink.nodes, {
            reconnectTries: 10,
            restTimeout: 5_000,
            moveOnDisconnect: false,
        });
        this.client = client;
        this.on("error", (name, error) => this.client.emit("nodeError", name, error));
        this.on("ready", (name) => this.client.emit("nodeReady", name));
        this.on("reconnecting", (name, info, tries) => this.client.emit("nodeReconnecting", name, info, tries));
        this.on("disconnect", (name) => this.client.emit("nodeDisconnect", name));
        this.on("close", (name, code) => this.client.emit("nodeClose", name, code));
        chalk.greenBright.bold.underline(">>> Shoukaku Initialized");
    }
}
