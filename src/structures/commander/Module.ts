import { KATClient as Client } from "../Client.js";
import { Command } from "./Command.js";
import { Commander } from "./Commander.js";
import { Collection, Client as DiscordClient, Guild, GuildMember, Invite, Snowflake } from "discord.js";

interface ModuleOptions {
    name: string;
    guilds?: Snowflake[];
}

export class Module {
    public name: string;
    public guilds?: Snowflake[];

    public commands = new Collection<string, Command<"Loaded">>();
    
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