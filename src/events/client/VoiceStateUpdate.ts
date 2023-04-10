import { Event, KATClient as Client, Commander } from "@structures/index.js";
import { Events, VoiceState } from "discord.js";

export class VoiceStateUpdate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.VoiceStateUpdate);
    }

    async execute(oldState: VoiceState, newState: VoiceState) {
        const subcription = this.client.subscriptions.get(oldState.guild.id);
        if (!subcription) return;

        if (newState.id === this.client.user?.id) if (!newState.channel || newState.channel && newState.channel.members.size <= 1) return subcription.destroy();
        if (oldState.channelId !== subcription.voiceChannel.id) return;
        if (newState.channel && newState.channel.members.has(this.client.user!.id)) subcription.voiceChannel = newState.channel;
        if (oldState.channel && oldState.channel.members.size <= 1) subcription.destroy();
    }
}
