import { KATClient } from "./Client.js";
import { Collection, Snowflake } from "discord.js";
import { createClient } from "redis";

import chalk from "chalk";

export class Database {
    private prefix: string = "cat:";

    public redis: ReturnType<typeof createClient>;
    public guilds: Collection<Snowflake, { [key: string]: any }> = new Collection();
    public access: Collection<string, { [key: string]: any }> = new Collection();

    constructor(
        private readonly client: KATClient
    ) {
        this.client = client;
    }

    // Private

    async connect(): Promise<void> {
        try {
            this.redis = createClient({
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 3)
                            return new Error(
                                chalk.red("Redis >> Failed To Connect")
                            );
                        return Math.min(retries * 100, 3000);
                    },
                },
            });

            this.redis.on("connect", () =>
                this.client.logger.info("Redis >> KATClient Connected")
            );

            this.redis.on("end", () =>
                this.client.logger.info("Redis >> KATClient Disconnected")
            );

            this.redis.on("error", (err) => {
                this.client.logger.error(err);
                console.error(chalk.red("Redis >> KATClient Error"));
                console.error(err);
            });

            await this.redis.connect();
        } catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("CommanderDatabase (ERROR) >> Error Connecting (SHUTDOWN)"));
            console.error(err);
        }
    }

    async load() {
        try {
            let guilds = await this.redis.hGetAll(this.withPrefix("guilds"));

            this.guilds.clear();

            if (Object.keys(guilds).length) {
                for (const guild in guilds) {
                    this.guilds.set(guild, JSON.parse(guilds[guild]));
                }
            }

            let access = await this.redis.hGetAll(this.withPrefix("access"));

            this.access.clear();

            if (Object.keys(access).length) {
                for (const command in access) {
                    this.access.set(command, JSON.parse(access[command]));
                }
            }

            this.client.logger.info("CommanderDatabase >> Data Loaded");

            return true;
        } catch (err) {
            console.error(chalk.red("CommanderDatabase (ERROR) >> Error Loading (SHUTDOWN)"));
            console.error(err);

            this.client.logger.fatal(err);
        }
    }

    // Public

    async get(guild: Snowflake, key: string): Promise<any> {
        if (!this.guilds) await this.load();

        const data: { [key: string]: any } = this.guilds.get(guild) || {};
        return data[key];
    }

    async set(guild: Snowflake, key: string, value: any): Promise<boolean> {
        if (!this.guilds) await this.load();

        try {
            const data: { [key: string]: any } = this.guilds.get(guild) || {};
            data[key] = value;

            await this.redis.hSet(
                this.withPrefix("guilds"),
                guild,
                JSON.stringify(data)
            );

            await this.load();
            console.log(chalk.greenBright("CommanderDatabase >> Value Set"));

            return true;
        } catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("CommanderDatabase (ERROR) >> Error Setting Value"));
            console.error(err);

            return false;
        }
    }

    async delete(guild: Snowflake, key: string): Promise<boolean> {
        if (!this.guilds) await this.load();

        try {
            const data: { [key: string]: any } = this.guilds.get(guild) || {};
            delete data[key];

            if (Object.keys(data).length) {
                await this.redis.hSet(
                    this.withPrefix("guilds"),
                    guild,
                    JSON.stringify(data)
                );
            } else {
                await this.redis.hDel(this.withPrefix("guilds"), guild);
            }

            await this.load();
            console.log(chalk.greenBright("CommanderDatabase >> Value Deleted"));

            return true;
        } catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("CommanderDatabase (ERROR) >> Error Deleting Value"));
            console.error(err);

            return false;
        }
    }

    withPrefix(key: string): string {
        return this.prefix + key;
    }

    // Access

    async getAccess(command: string) {
        if (!this.access) await this.load();

        const data = this.access.get(command) || {};
        return data;
    }

    async setAccess(command: string, data: { [key: string]: any }) {
        try {
            if (!data.guilds?.length && !data.users?.length) {
                await this.redis.hDel(this.withPrefix("access"), command);
            } else {
                await this.redis.hSet(
                    this.withPrefix("access"),
                    command,
                    JSON.stringify(data)
                );
            }

            await this.load();
        } catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("CommanderDatabase (ERROR) >> Error Setting Value"));
            console.error(err);
        }
    }

    // Twitch

    async getTwitch() {
        if (!this.guilds) await this.load();

        let res = [];

        for (const [_, data] of this.guilds) {
            if (data.twitch) res.push(data.twitch);
        }

        return res;
    }
}
