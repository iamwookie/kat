import { Collection } from "discord.js";
export class ColorManager {
    client;
    guilds = new Collection();
    constructor(client) {
        this.client = client;
        this.client = client;
    }
    async initialize() {
        const guilds = await this.client.guilds.fetch();
        for (const [_, guild] of guilds) {
            const data = await this.client.database.get(guild.id, "colors");
            if (!data)
                continue;
            this.guilds.set(guild.id, data);
        }
    }
    get(guild) {
        return this.guilds.get(guild ?? "");
    }
    async create(guild, color, id) {
        if (this.guilds.has(color))
            return;
        const data = this.guilds.get(guild) || {};
        data[color] = id;
        this.guilds.set(guild, data);
        return await this.client.database.set(guild, "colors", data);
    }
    async delete(guild, color) {
        if (!this.guilds.has(color))
            return;
        const data = this.guilds.get(guild) || {};
        delete data[color];
        this.guilds.set(guild, data);
        return await this.client.database.set(guild, "colors", data);
    }
}
