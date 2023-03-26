import { Shoukaku, Connectors } from "shoukaku";
import Config from "../configs/lavalink.json" assert { type: "json" };
import chalk from "chalk";
export class ShoukakuClient extends Shoukaku {
    client;
    constructor(client) {
        super(new Connectors.DiscordJS(client), Config.nodes, {
            moveOnDisconnect: false,
            reconnectTries: 2,
            restTimeout: 10000,
        });
        this.client = client;
        this.client = client;
        this.on("error", (name, error) => {
            const node = this.nodes.get(name);
            if (node?.reconnects == 0)
                this.client.logger.error(error);
            console.error(chalk.red(`Music >> Lavalink Node: ${name} has had an error!`));
        });
        this.on("ready", (name) => {
            this.client.logger.info(`Music >> Lavalink Node: ${name} is now connected!`);
        });
        this.on("disconnect", (name) => {
            console.error(chalk.red(`Music >> Lavalink Node: ${name} has disconnected!`));
        });
        this.on("close", (name, code) => {
            this.client.logger.warn(`Music >> Lavalink Node: ${name} has closed with code ${code}!`);
        });
        chalk.greenBright.bold.underline(">>> Shoukaku Initialized");
    }
}
