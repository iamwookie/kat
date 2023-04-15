import { Event } from "../../structures/index.js";
import { Events } from "discord.js";
import chalk from "chalk";
export class ClientReady extends Event {
    constructor(client, commander) {
        super(client, commander, Events.ClientReady);
    }
    async execute(client) {
        this.commander.modules.forEach(module => module.onReady(client));
        await this.client.server.initialize();
        console.log(chalk.greenBright.bold.underline(`>>> Server Initialized (Port: ${this.client.server.port})`));
        console.log(chalk.magenta.bold.underline(`\n!! >>> App Online, Client: ${client.user?.tag} (${client.user?.id}) [Guilds: ${client.guilds.cache.size}]`));
        console.log(chalk.magenta.bold.underline(`!! >>> App Loaded In: ${Date.now() - this.client.startTime}ms`));
    }
}
