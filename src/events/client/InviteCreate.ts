import { Event, KATClient as Client, Commander } from "@structures/index.js";
import { Events, Invite } from "discord.js";

export class InviteCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.InviteCreate);
    }

    async execute(invite: Invite) {
        this.commander.modules.forEach((module) => {
            if (module.guilds?.includes(invite.guild?.id!)) module.onInviteCreate(invite);
        });
    }
}
