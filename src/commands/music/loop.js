!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1bae32fc-8487-5104-b095-d7da380538f5")}catch(e){}}();
import { Command, MusicPrompts } from '../../structures/index.js';
import { ActionEmbed } from '../../utils/embeds/index.js';
import { PromptBuilder } from '../../utils/prompt.js';
export class LoopCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'loop',
            module: 'Music',
            // Remove when shifting to slash commands.
            aliases: ['repeat'],
            description: {
                content: 'Loop / unloop the currently playing track.',
            },
            ephemeral: true,
        });
    }
    async execute(int) {
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || !subscription.active)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(int.user.id))
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
        const looped = subscription.loop();
        int.editReply({ content: new PromptBuilder(subscription).setLooped(looped) });
    }
}
//# debugId=1bae32fc-8487-5104-b095-d7da380538f5
//# sourceMappingURL=loop.js.map
