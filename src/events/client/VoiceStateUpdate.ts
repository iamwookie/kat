import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { Events, VoiceState } from 'discord.js';

export class VoiceStateUpdate extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.VoiceStateUpdate);
    }

    async execute(oldState: VoiceState, newState: VoiceState) {
        const subcription = this.client.dispatcher.getSubscription(oldState.guild);
        if (!subcription) return;

        if (oldState.id == this.client.user?.id && !newState.channel) subcription.destroy();
        if (oldState.id == this.client.user?.id && newState.id == this.client.user?.id) {
            if (newState.channel && newState.channelId != subcription.voiceChannel.id) {
                subcription.voiceChannel = newState.channel;

                await this.client.prisma.queue.upsert({
                    where: {
                        guildId: subcription.guild.id,
                    },
                    update: {
                        voiceId: subcription.voiceChannel.id,
                    },
                    create: {
                        guildId: subcription.guild.id,
                        voiceId: subcription.voiceChannel.id,
                        textId: subcription.textChannel?.id,
                        active: true,
                    },
                });

                this.client.emit(Events.Debug, `DATABASE >> Updated Voice Channel For: ${subcription.guild.name} (${subcription.guild.id})`);
            }
        }
    }
}
