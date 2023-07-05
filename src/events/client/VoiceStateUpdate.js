!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="595d9476-96dc-5ea7-80bb-0f854f938956")}catch(e){}}();
import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
export class VoiceStateUpdate extends Event {
    constructor(client, commander) {
        super(client, commander, Events.VoiceStateUpdate);
    }
    async execute(oldState, newState) {
        const subcription = this.client.dispatcher.getSubscription(oldState.guild);
        if (!subcription)
            return;
        if (oldState.id == this.client.user?.id && !newState.channel)
            subcription.destroy();
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
//# debugId=595d9476-96dc-5ea7-80bb-0f854f938956
//# sourceMappingURL=VoiceStateUpdate.js.map
