import { Command, KATClient as Client, Commander, MusicPrompts } from '@structures/index.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';
import { PromptBuilder } from '@utils/prompt.js';

export class LoopCommand extends Command {
    constructor(client: Client, commander: Commander) {
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

    async execute(int: ChatInputCommandInteraction<'cached'>) {
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (!subscription || !subscription.active) return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotPlaying)] });
        if (!subscription.voiceChannel.members.has(int.user.id)) return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });

        const looped = subscription.loop();

        int.editReply({ content: new PromptBuilder(subscription).setLooped(looped) });
    }
}
