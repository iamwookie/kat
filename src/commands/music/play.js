!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="64e3d396-5366-52f3-9651-760d9dcc68a8")}catch(e){}}();
import { Command, MusicPrompts, NodeError, PlayerError, SearchError } from '../../structures/index.js';
import { SlashCommandBuilder, VoiceChannel } from 'discord.js';
import { ActionEmbed, ErrorEmbed } from '../../utils/embeds/index.js';
import { PromptBuilder } from '../../utils/prompt.js';
export class PlayCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'play',
            module: 'Music',
            // Remove when shifting to slash commands.
            aliases: ['p'],
            description: {
                content: 'Add a track to the queue, or resume the current one.',
                format: '<?title/url>',
            },
            cooldown: 5,
            ephemeral: true,
        });
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content)
            .setDMPermission(false)
            .addStringOption((option) => option.setName('query').setDescription('The name or URL of the track to search for.'));
    }
    async execute(int) {
        const query = int.options.getString('query');
        const voiceChannel = int.member.voice.channel;
        if (!voiceChannel)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInVoice)] });
        if (!(voiceChannel instanceof VoiceChannel))
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.IncorrectVoice)] });
        if (!voiceChannel.joinable || !voiceChannel.speakable)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.CannotPlayInVoice)] });
        if (!query) {
            const subscription = this.client.dispatcher.getSubscription(int.guild);
            if (!subscription?.paused)
                return int.editReply({ content: 'What should I play?' });
            this.applyCooldown(int.user);
            subscription.resume();
            return int.editReply({ content: '▶️ Track Resumed.' });
        }
        this.applyCooldown(int.user);
        try {
            const res = await this.client.dispatcher.search(query, int.user);
            if (!res)
                return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoResults)] });
            const subscription = await this.client.dispatcher.createSubscription(int.guild, voiceChannel, int.channel);
            subscription.add(res);
            int.editReply({ content: new PromptBuilder(subscription).setEnqueued(res) });
        }
        catch (err) {
            if (err instanceof NodeError) {
                return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoNodes)] });
            }
            else if (err instanceof SearchError && err.code == 1) {
                return int.editReply({ embeds: [new ActionEmbed('fail').setText(`Failed to load track! \n\`${err.message}\``)] });
            }
            else if (err instanceof PlayerError) {
                return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.VoiceError)] });
            }
            else {
                const eventId = this.client.logger.error(err);
                return int.editReply({ embeds: [new ErrorEmbed(eventId)] });
            }
        }
    }
}
//# debugId=64e3d396-5366-52f3-9651-760d9dcc68a8
//# sourceMappingURL=play.js.map
