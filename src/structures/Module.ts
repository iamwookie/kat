import { KATClient as Client } from "./Client.js";
import { Commander } from "./Commander.js";
import { Client as DiscordClient, Guild, GuildMember, Invite, Snowflake } from "discord.js";

export abstract class Module {
    public name: string;
    public guilds?: Snowflake[];
    
    constructor(
        public client: Client,
        public commander: Commander,
    ) {}

    onReady(client: DiscordClient) {}
    onInviteCreate(invite: Invite) {}
    onGuildCreate(guild: Guild) {}
    onGuildMemberAdd(member: GuildMember) {}
}