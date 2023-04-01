import { Event } from "../../structures/index.js";
import { Events } from "discord.js";
import chalk from "chalk";
export class ClientReady extends Event {
    constructor(client, commander) {
        super(client, commander, Events.ClientReady);
    }
    async execute(client) {
        await this.client.colors.initialize();
        console.log(chalk.greenBright.bold.underline(`>>> Colors Initialized`));
        console.log(chalk.magenta.bold.underline(`\n>>> App Online, Client: ${client.user?.tag} (${client.user?.id}) [Guilds: ${client.guilds.cache.size}]`));
        console.log(chalk.magenta.bold.underline(`>>> App Loaded In: ${Date.now() - this.client.startTime}ms`));
    }
}
