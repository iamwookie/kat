import { KATClient as Client } from "./Client.js";
import { Commander } from "./Commander.js";
import { Client as DiscordClient, Guild, GuildMember, Invite, Snowflake } from "discord.js";

interface ModuleOptions {
    name: string;
    guilds?: Snowflake[];
}

export abstract class Module {
    public name: string;
    public guilds?: Snowflake[];
    
    constructor(
        public client: Client,
        public commander: Commander,
        options: ModuleOptions
    ) {
        this.name = options.name;
        this.guilds = options.guilds;
    }

    onReady(client: DiscordClient) {}
    onInviteCreate(invite: Invite) {}
    onGuildCreate(guild: Guild) {}
    onGuildMemberAdd(member: GuildMember) {}
}