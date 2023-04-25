import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { Events, VoiceState } from 'discord.js';

export class VoiceStateUpdate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.VoiceStateUpdate);
    }

    async execute(oldState: VoiceState, newState: VoiceState) {
        const subcription = this.client.subscriptions.get(oldState.guild.id);
        if (!subcription) return;

        if (
            oldState.id == this.client.user?.id &&
            newState.id == this.client.user?.id &&
            oldState.channel &&
            newState.channel &&
            newState.channelId != oldState.channelId
        )
            subcription.voiceChannel = newState.channel;
    }
}
