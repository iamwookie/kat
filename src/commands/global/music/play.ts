import { KATClient as Client, Commander, Command } from "@structures/index.js";
import { SlashCommandBuilder, ChatInputCommandInteraction, Message, GuildMember, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { Subscription as MusicSubscription, YouTubeTrack, SpotifyTrack, YouTubePlaylist, SpotifyPlaylist } from "@structures/index.js";
import { LavalinkResponse } from "shoukaku";
import { NodeError, PlayerError } from "@utils/errors.js";
import { ActionEmbed, ErrorEmbed, MusicEmbed } from "@utils/embeds/index.js";

export class PlayCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander);

        this.name = "play";
        this.group = "Music";
        this.legacyAliases = ["p"];
        this.description = {
            content: "Search for a track and add it to the queue or resume the current track.",
            format: "<?title/url>",
        };

        this.cooldown = 5;
    }

    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content!)
            .setDMPermission(false)
            .addStringOption(option =>
                option
                    .setName("query")
                    .setDescription("The name or URL of the track.")
            );
    }

    async execute(int: ChatInputCommandInteraction | Message) {
        const author = this.getAuthor(int)!;
        const query = this.getArgs(int).join(" ");

        const voiceChannel: VoiceBasedChannel | null = (int.member as GuildMember).voice.channel;
        if (!voiceChannel) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You are not in a voice channel!")] });
        if (!voiceChannel.members.has(this.client.user?.id!)) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You are not in my voice channel!")] });
        if (!voiceChannel.joinable || !(voiceChannel as VoiceChannel).speakable) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("I can't play in that voice channel!")] });

        let subscription: MusicSubscription = this.client.subscriptions.get(int.guildId);

        if (!query && subscription && subscription.paused) {
            subscription.resume();
            return this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setPlaying(subscription.active)] });
        }

        if (!query) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("What should I play?")] });

        this.applyCooldown(author);

        if (!subscription) {
            try {
                subscription = await MusicSubscription.create(this.client, int.guild!, voiceChannel, int.channel);
            } catch (err) {
                if (err instanceof NodeError) {
                    return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("No available music nodes. Please try again!")] });
                } else if (err instanceof PlayerError) {
                    return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Error establishing a voice channel connection. Try again in a few minutes!")] });
                } else {
                    const eventId = this.client.logger.error(err);
                    return this.reply(int, { embeds: [new ErrorEmbed(eventId)] });
                }
            }
        }

        let res: LavalinkResponse | null = null;
        let url: URL | null = null;

        try {
            url = new URL(query);
            res = await subscription.node.rest.resolve(url.href);
        } catch (err) {
            res = await subscription.node.rest.resolve("ytsearch:" + query);
        }

        switch (res?.loadType) {
            case "LOAD_FAILED": {
                this.reply(int, { embeds: [new ActionEmbed("fail").setDesc(`Failed to load track! \n\`${res.exception?.message}\``)] });
                break;
            }
            case "NO_MATCHES": {
                this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Could not find your search result!")] });
                break;
            }
            case "SEARCH_RESULT": {
                const data = res.tracks[0];
                const track = new YouTubeTrack(this.client, data, author, int.channel);
                subscription.add(track);

                this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(track)] });
                break;
            }
            case "PLAYLIST_LOADED": {
                if (!url) return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Could not find your search result!")] });

                const info = res.playlistInfo;
                const tracks = res.tracks;

                switch (tracks[0].info.sourceName) {
                    case "youtube": {
                        const playlist = new YouTubePlaylist(url, info, tracks, author, int.channel);
                        subscription.add(playlist);

                        this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(playlist)] });
                        break;
                    }
                    case "spotify": {
                        const playlist = new SpotifyPlaylist(url, info, tracks, author, int.channel);
                        subscription.add(playlist);

                        this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(playlist)] });
                        break;
                    }
                    default: {
                        this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Could not find your search result!")] });
                        break;
                    }
                }

                break;
            }
            case "TRACK_LOADED": {
                const data = res.tracks[0];

                switch (data.info.sourceName) {
                    case "youtube": {
                        const track = new YouTubeTrack(this.client, data, author, int.channel);
                        subscription.add(track);

                        this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(track)] });
                        break;
                    }
                    case "spotify": {
                        const track = new SpotifyTrack(this.client, data, author, int.channel);
                        subscription.add(track);

                        this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(track)] });
                        break;
                    }
                    default: {
                        this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Could not find your search result!")] });
                        break;
                    }
                }

                break;
            }
            default: {
                this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Could not find your search result!")] });
                break;
            }
        }
    }
}
