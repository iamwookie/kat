import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder } from "discord.js";
import { Subscription as MusicSubscription, YouTubeTrack, SpotifyTrack, YouTubePlaylist, SpotifyPlaylist } from "../../../structures/index.js";
import { NodeError, PlayerError } from "../../../utils/errors.js";
import { ActionEmbed, ErrorEmbed, MusicEmbed } from "../../../utils/embeds/index.js";
export class PlayCommand extends Command {
    constructor(commander) {
        super(commander);
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
            .setDescription(this.description?.content)
            .setDMPermission(false)
            .addStringOption((option) => {
            option.setName("query").setDescription("The name or URL of the track.");
            return option;
        });
    }
    async execute(client, int) {
        const author = this.getAuthor(int);
        const query = this.getArgs(int).join(" ");
        const voiceChannel = int.member.voice.channel;
        if (!voiceChannel)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("You are not in a voice channel!")] });
        if (!voiceChannel.joinable || !voiceChannel.speakable)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("I can't play in that voice channel!")] });
        let subscription = client.subscriptions.get(int.guildId);
        if (!query && subscription && subscription.paused) {
            subscription.resume();
            return this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setPlaying(subscription.active)] });
        }
        if (!query)
            return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("What should I play?")] });
        //this.applyCooldown(author);
        if (!subscription) {
            try {
                subscription = await MusicSubscription.create(client, int.guild, voiceChannel, int.channel);
            }
            catch (err) {
                if (err instanceof NodeError) {
                    return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("No available music nodes. Please try again!")] });
                }
                else if (err instanceof PlayerError) {
                    return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Error establishing a voice channel connection. Try again in a few minutes!")] });
                }
                else {
                    const eventId = client.logger.error(err);
                    return this.reply(int, { embeds: [new ErrorEmbed(eventId)] });
                }
            }
        }
        let res = null;
        let url = null;
        try {
            url = new URL(query);
            res = await subscription.node.rest.resolve(url.href);
        }
        catch (err) {
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
                const track = new YouTubeTrack(client, data, author, int.channel);
                subscription.add(track);
                this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(track)] });
                break;
            }
            case "PLAYLIST_LOADED": {
                if (!url)
                    return this.reply(int, { embeds: [new ActionEmbed("fail").setDesc("Could not find your search result!")] });
                const tracks = res.tracks;
                const info = res.playlistInfo;
                switch (tracks[0].info.sourceName) {
                    case "youtube": {
                        const playlist = new YouTubePlaylist(url, tracks, info);
                        for (const data of tracks) {
                            const track = new YouTubeTrack(client, data, author, int.channel);
                            subscription.add(track);
                        }
                        this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(playlist)] });
                        break;
                    }
                    case "spotify": {
                        const playlist = new SpotifyPlaylist(url, tracks, info);
                        for (const data of tracks) {
                            const track = new SpotifyTrack(client, data, author, int.channel);
                            subscription.add(track);
                        }
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
                        const track = new YouTubeTrack(client, data, author, int.channel);
                        subscription.add(track);
                        this.reply(int, { embeds: [new MusicEmbed(subscription).setUser(author).setEnqueued(track)] });
                        break;
                    }
                    case "spotify": {
                        const track = new SpotifyTrack(client, data, author, int.channel);
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
