import { SpotifyPlaylist, SpotifyTrack, YouTubePlaylist, YouTubeTrack } from './Track.js';
import { NodeError, PlayerError } from '../../utils/errors.js';
export class Subscription {
    client;
    guild;
    voiceChannel;
    textChannel;
    player;
    node;
    shoukaku;
    queue = [];
    active = null;
    position = 0;
    looped = false;
    volume = 100;
    destroyed = false;
    constructor(client, guild, voiceChannel, textChannel, player, node) {
        this.client = client;
        this.guild = guild;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.player = player;
        this.node = node;
        this.shoukaku = client.shoukaku;
        this.player.on('exception', (reason) => this.client.emit('playerException', this, reason));
        this.player.on('start', (data) => this.client.emit('playerStart', this, data));
        this.player.on('end', (reason) => this.client.emit('playerEnd', this, reason));
        // -----> REQUIRES FIXING FROM SHOUKAKU
        //
        // this.player.on("closed", (reason) => {
        //     this.client.logger.warn(`Music >> Closed Connection in ${this.guild.name} (${this.guild.id}). Node: ${this.node.name}`);
        //     this.destroy();
        // });
    }
    static async create(client, guild, voiceChannel, textChannel) {
        try {
            const node = client.shoukaku.getNode();
            if (!node)
                throw new NodeError("Node doesn't exist.");
            try {
                const player = await node.joinChannel({
                    guildId: guild.id,
                    channelId: voiceChannel.id,
                    shardId: 0,
                    deaf: true,
                });
                const subscription = new Subscription(client, guild, voiceChannel, textChannel, player, node);
                client.subscriptions.set(guild.id, subscription);
                client.emit('subscriptionCreate', subscription);
                const res = await client.cache.music.get(guild.id);
                if (res?.volume)
                    subscription.volume = res.volume;
                return subscription;
            }
            catch (err) {
                client.logger.error(err, 'PlayerError', 'Music');
                throw new PlayerError(err.message);
            }
        }
        catch (err) {
            client.logger.error(err, 'NodeError', 'Music');
            throw new NodeError(err.message);
        }
    }
    destroy() {
        if (this.destroyed)
            return;
        this.queue = [];
        this.active = null;
        this.player.connection.disconnect();
        this.client.subscriptions.delete(this.guild.id);
        this.destroyed = true;
        this.client.emit('subscriptionDestroy', this);
    }
    process() {
        const track = this.looped ? this.active : this.queue.shift();
        if (!track)
            return;
        this.active = track;
        this.position += 1;
        this.player.setVolume(this.volume / 100);
        this.player.playTrack({ track: track.data.track });
        this.client.emit('trackRemove', this, track);
    }
    add(item) {
        if (item instanceof YouTubePlaylist) {
            for (const data of item.tracks) {
                const track = new YouTubeTrack(this.client, data, item.requester, item.textChannel);
                this.queue.push(track);
            }
        }
        else if (item instanceof SpotifyPlaylist) {
            for (const data of item.tracks) {
                const track = new SpotifyTrack(this.client, data, item.requester, item.textChannel);
                this.queue.push(track);
            }
        }
        else {
            this.queue.push(item);
        }
        this.client.emit('trackAdd', this, item);
        if (!this.active)
            this.process();
    }
    stop() {
        this.looped = false;
        this.active = null;
        return this.player.stopTrack();
    }
    pause() {
        if (!this.active)
            return;
        return this.player.setPaused(true);
    }
    resume() {
        if (!this.active)
            return;
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
