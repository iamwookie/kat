import { Command } from '../../../structures/index.js';
import { SlashCommandBuilder, VoiceChannel } from 'discord.js';
import { Subscription as MusicSubscription, YouTubeTrack, SpotifyTrack, YouTubePlaylist, SpotifyPlaylist } from '../../../structures/index.js';
import { NodeError, PlayerError } from '../../../utils/errors.js';
import { ActionEmbed, ErrorEmbed, MusicEmbed } from '../../../utils/embeds/index.js';
import { MusicPrompts } from '../../../../enums.js';
export class PlayCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'play',
            module: 'Music',
            legacy: true,
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
        const author = this.commander.getAuthor(int);
        const query = this.commander.getArgs(int).join(' ');
        const voiceChannel = int.member.voice.channel;
        if (!voiceChannel)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInVoice)] });
        if (!(voiceChannel instanceof VoiceChannel))
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.IncorrectVoice)] });
        if (!voiceChannel.joinable || !voiceChannel.speakable)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.CannotPlayInVoice)] });
        let subscription = this.client.subscriptions.get(int.guildId);
        if (subscription) {
            if (!subscription.voiceChannel.members.has(author.id))
                return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NotInMyVoice)] });
            if (!query && subscription.paused) {
                subscription.resume();
                return this.commander.reply(int, { embeds: [new ActionEmbed('success').setText(MusicPrompts.TrackResumed)] });
            }
        }
        if (!query)
            return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText('What should I play?')] });
        this.applyCooldown(author);
        if (!subscription) {
            try {
                subscription = await MusicSubscription.create(this.client, int.guild, voiceChannel, int.channel);
            }
            catch (err) {
                if (err instanceof NodeError) {
                    return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoNodes)] });
                }
                else if (err instanceof PlayerError) {
                    return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.VoiceError)] });
                }
                else {
                    const eventId = this.client.logger.error(err);
                    return this.commander.reply(int, { embeds: [new ErrorEmbed(eventId)] });
                }
            }
        }
        let search;
        try {
            search = new URL(query);
        }
        catch (err) {
            search = query;
        }
        const res = await subscription.node.rest.resolve(search instanceof URL ? search.href : `ytsearch:${search}`);
        const embed = new MusicEmbed(subscription).setUser(author);
        switch (res?.loadType) {
            case 'LOAD_FAILED': {
                this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(`Failed to load track! \n\`${res.exception?.message}\``)] });
                break;
            }
            case 'NO_MATCHES': {
                this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoResults)] });
                break;
            }
            case 'SEARCH_RESULT': {
                const data = res.tracks[0];
                const track = new YouTubeTrack(this.client, data, author, int.channel);
                subscription.add(track);
                if (subscription.queue.length)
                    this.commander.reply(int, { embeds: [embed.setEnqueued(track)] });
                break;
            }
            case 'PLAYLIST_LOADED': {
                if (!(search instanceof URL))
                    return this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoResults)] });
                const info = res.playlistInfo;
                const tracks = res.tracks;
                switch (tracks[0].info.sourceName) {
                    case 'youtube': {
                        const playlist = new YouTubePlaylist(search, info, tracks, author, int.channel);
                        subscription.add(playlist);
                        this.commander.reply(int, { embeds: [embed.setEnqueued(playlist)] });
                        break;
                    }
                    case 'spotify': {
                        const playlist = new SpotifyPlaylist(search, info, tracks, author, int.channel);
                        subscription.add(playlist);
                        this.commander.reply(int, { embeds: [embed.setEnqueued(playlist)] });
                        break;
                    }
                    default: {
                        this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoResults)] });
                        break;
                    }
                }
                break;
            }
            case 'TRACK_LOADED': {
                const data = res.tracks[0];
                switch (data.info.sourceName) {
                    case 'youtube': {
                        const track = new YouTubeTrack(this.client, data, author, int.channel);
                        subscription.add(track);
                        if (subscription.queue.length)
                            this.commander.reply(int, { embeds: [embed.setEnqueued(track)] });
                        break;
                    }
                    case 'spotify': {
                        const track = new SpotifyTrack(this.client, data, author, int.channel);
                        subscription.add(track);
                        if (subscription.queue.length)
                            this.commander.reply(int, { embeds: [embed.setEnqueued(track)] });
                        break;
                    }
                    default: {
                        this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoResults)] });
                        break;
                    }
                }
                break;
            }
            default: {
                this.commander.reply(int, { embeds: [new ActionEmbed('fail').setText(MusicPrompts.NoResults)] });
                break;
            }
        }
    }
}
