import { KATClient as Client } from "../Client.js";
import { SpotifyPlaylist, SpotifyTrack, YouTubePlaylist, YouTubeTrack } from "./Track.js";
import { Guild, VoiceBasedChannel, TextBasedChannel } from "discord.js";
import { Shoukaku, Player, Node } from "shoukaku";
import { NodeError, PlayerError } from "@utils/errors.js";

export class Subscription {
    public shoukaku: Shoukaku;
    public queue: (YouTubeTrack | SpotifyTrack)[] = [];
    public active: YouTubeTrack | SpotifyTrack | null = null;
    public looped: boolean = false;
    public volume: number = 100;
    public destroyed: boolean = false;

    constructor(public client: Client, public guild: Guild, public voiceChannel: VoiceBasedChannel, public textChannel: TextBasedChannel | null, public player: Player, public node: Node) {
        this.shoukaku = client.shoukaku;

        this.player.on("exception", (reason) => this.client.emit("playerException", this, reason));
        this.player.on("start", (data) => this.client.emit("playerStart", this, data));
        this.player.on("end", (reason) => this.client.emit("playerEnd", this, reason));

        // -----> REQUIRES FIXING FROM SHOUKAKU
        //
        // this.player.on("closed", (reason) => {
        //     this.client.logger.warn(`Music >> Closed Connection in ${this.guild.name} (${this.guild.id}). Node: ${this.node.name}`);
        //     this.destroy();
        // });
    }

    static async create(client: Client, guild: Guild, voiceChannel: VoiceBasedChannel, textChannel: TextBasedChannel | null) {
        try {
            const node = client.shoukaku.getNode();
            if (!node) throw new NodeError("Node doesn't exist.");

            try {
                const player: Player = await node.joinChannel({
                    guildId: guild.id,
                    channelId: voiceChannel.id,
                    shardId: 0,
                    deaf: true,
                });

                const subscription = new Subscription(client, guild, voiceChannel, textChannel, player, node);
                client.subscriptions.set(guild.id, subscription);
                client.emit("subscriptionCreate", subscription);

                const res = await client.cache.music.get(guild.id);
                if (res?.volume) subscription.volume = res.volume;

                return subscription;
            } catch (err) {
                client.logger.error(err);
                throw new PlayerError((err as Error).message);
            }
        } catch (err) {
            client.logger.error(err);
            throw new NodeError((err as Error).message);
        }
    }

    destroy() {
        if (this.destroyed) return;
        this.queue = [];
        this.active = null;
        this.player.connection.disconnect();
        this.client.subscriptions.delete(this.guild.id);
        this.destroyed = true;
        this.client.emit("subscriptionDestroy", this);
    }

    process() {
        const track = this.looped ? this.active : this.queue.shift();
        if (!track) return;

        this.active = track;
        this.player.setVolume(this.volume / 100);
        this.player.playTrack({ track: track.data.track });
    }

    add(item: YouTubeTrack | SpotifyTrack | YouTubePlaylist | SpotifyPlaylist) {
        if (item instanceof YouTubePlaylist) {
            for (const data of item.tracks) {
                const track = new YouTubeTrack(this.client, data, item.requester, item.textChannel);
                this.queue.push(track);
            }
        } else if (item instanceof SpotifyPlaylist) {
            for (const data of item.tracks) {
                const track = new SpotifyTrack(this.client, data, item.requester, item.textChannel);
                this.queue.push(track);
            }
        } else {
            this.queue.push(item);
        }

        if (!this.active) this.process();
    }

    stop() {
        this.looped = false;
        this.active = null;
        return this.player.stopTrack();
    }

    pause() {
        if (!this.active) return;
        return this.player.setPaused(true);
    }

    resume() {
        if (!this.active) return;
        return this.player.setPaused(false);
    }

    loop() {
        return (this.looped = !this.looped);
    }

    // Getters

    get duration() {
        return this.player.position;
    }

    get paused() {
        return this.player.paused;
    }
}
