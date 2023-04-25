import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
export class VoiceStateUpdate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.VoiceStateUpdate);
    }
    async execute(oldState, newState) {
        const subcription = this.client.subscriptions.get(oldState.guild.id);
        if (!subcription)
            return;
        if (oldState.id == this.client.user?.id &&
            newState.id == this.client.user?.id &&
            oldState.channel &&
            newState.channel &&
            newState.channelId != oldState.channelId)
            subcription.voiceChannel = newState.channel;
    }
}
