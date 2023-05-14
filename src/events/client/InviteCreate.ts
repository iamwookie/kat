import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { Events, Invite } from 'discord.js';

export class InviteCreate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.InviteCreate);
    }

    async execute(invite: Invite) {
        for (const module of this.commander.modules.values()) module.emit(this.name, invite);
    }
}
