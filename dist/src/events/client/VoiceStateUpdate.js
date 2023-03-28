import { Event } from "../../structures/index.js";
import { Events } from "discord.js";
export class VoiceStateUpdate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.VoiceStateUpdate);
    }
    async execute(oldState, newState) {
        const subcription = this.client.subscriptions.get(oldState.guild.id);
        if (!subcription)
            return;
        if (newState.id === this.client.user?.id && !newState.channel)
            return subcription.destroy();
        if (oldState.channelId !== subcription.voiceChannel.id)
            return;
        if (newState.channel && newState.channel.members.has(this.client.user.id))
            subcription.voiceChannel = newState.channel;
        if (oldState.channel && oldState.channel.members.size <= 1 && newState.channel && newState.channel?.members.size <= 1)
            subcription.destroy();
    }
}
