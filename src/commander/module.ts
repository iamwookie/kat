import { Commander } from "./index.js";
import { Client, Collection, Snowflake } from "discord.js";

import chalk from "chalk";

export class CommanderModule {
    public name: string;
    public guilds?: Snowflake[];

    public run: (client: Client) => Promise<void>;

    constructor(
        private readonly commander: Commander,
        options: {}
    ) {
        this.commander = commander;

        Object.assign(this, options);

        if (this.guilds) {
            for (const guildId of this.guilds) {
                if (!this.commander.client.guilds.cache.has(guildId)) this.commander.client.logger.warn(`Commander >> Guild (${guildId}) Not Found For Module: ${this.name}`);

                const guild = this.commander.guilds.get(guildId) || {};
                guild.modules = guild.modules || new Collection();
                guild.modules.set(this.name, this);

                this.commander.guilds.set(guildId, guild);
            }
        }
    }

    async initialize(client: Client) {
        try {
            await this.run(client);
            client.logger.info(`Commander >> Loaded ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`);
        } catch (err) {
            client.logger.error(err);
            console.error(chalk.red(`Commander >> Failed to Load ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`));
            console.error(err);
        }
    }
}