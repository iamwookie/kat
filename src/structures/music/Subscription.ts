import { KATClient as Client } from "../Client.js";
import { YouTubeTrack } from "./Track.js";
import { Guild, VoiceBasedChannel, TextBasedChannel } from "discord.js";
import { Shoukaku, Player, Node } from "shoukaku";

export class Subscription {
    public shoukaku: Shoukaku
    public queue: YouTubeTrack[] = [];
    public active: YouTubeTrack | null = null;
    public destroyed: boolean = false;

    constructor(
        public client: Client,
        public guild: Guild,
        public voiceChannel: VoiceBasedChannel,
        public textChannel: TextBasedChannel | null,
        public player: Player,
        public node: Node,
    ) {
        this.client = client;
        this.shoukaku = client.shoukaku;
        this.guild = guild;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.player = player;
        this.node = node;

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
        const node = client.shoukaku.getNode();
        if (!node) throw new Error("No available nodes!");

        const player = await node.joinChannel({
            guildId: guild.id,
            channelId: voiceChannel.id,
            shardId: 0,
            deaf: true,
        });

        const subscription = new Subscription(client, guild, voiceChannel, textChannel, player, node);
        client.subscriptions.set(guild.id, subscription);
        client.emit("subscriptionCreate", subscription);

        return subscription;
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
        const track = this.queue.shift();
        if (!track) return;

        this.active = track;
        this.player.playTrack({ track: track.data.track });
    }

    add(track: YouTubeTrack) {
        this.queue.push(track);
        if (!this.active) this.process();
    }

    stop() {
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

    // Getters
    
    get duration() {
        return this.player.position;
    }

    get paused() {
        return this.player.paused;
    }
}
