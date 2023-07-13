import { Command, KATClient as Client, Commander, MusicPrompts, NodeError, PlayerError, SearchError } from '@structures/index.js';
import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { ActionEmbed, ErrorEmbed, MusicEmbed } from '@utils/embeds/index.js';
import { PromptBuilder } from '@utils/prompt.js';

export class PlayCommand extends Command {
    constructor(client: Client, commander: Commander) {
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
            .setDescription(this.description?.content!)
            .setDMPermission(false)
            .addStringOption((option) => option.setName('query').setDescription('The name or URL of the track to search for.'));
    }

    async execute(int: ChatInputCommandInteraction<'cached'>) {
        const query = int.options.getString('query');

        const voiceChannel = (int.member as GuildMember).voice.channel;
        if (!voiceChannel) return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInVoice)] });
        if (!(voiceChannel instanceof VoiceChannel)) return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.IncorrectVoice)] });
        if (!voiceChannel.joinable || !voiceChannel.speakable)
            return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.CannotPlayInVoice)] });

        if (!query) {
            const subscription = this.client.dispatcher.getSubscription(int.guild);
            if (!subscription?.paused) return int.editReply({ content: 'What should I play?' });

            this.applyCooldown(int.user);

            subscription.resume();

            return int.editReply({ content: '▶️ Track Resumed.' });
        }

        this.applyCooldown(int.user);

        try {
            const res = await this.client.dispatcher.search(query, int.user);
            if (!res) return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoResults)] });

            const subscription = await this.client.dispatcher.createSubscription(int.guild, voiceChannel, int.channel!);
            subscription.add(res);

            int.editReply({ content: new PromptBuilder(subscription).setEnqueued(res) });
        } catch (err) {
            if (err instanceof NodeError) {
                return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoNodes)] });
            } else if (err instanceof SearchError && err.code == 1) {
                return int.editReply({ embeds: [new ActionEmbed('fail').setText(`Failed to load track! \n\`${err.message}\``)] });
            } else if (err instanceof PlayerError) {
                return int.editReply({ embeds: [new ActionEmbed('fail').setText(MusicPrompts.VoiceError)] });
            } else {
                const eventId = this.client.logger.error(err);
                return int.editReply({ embeds: [new ErrorEmbed(eventId)] });
            }
        }
    }
}
