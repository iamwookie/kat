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
    constructor(client, guild, voiceChannel, textChannel, player, node) {
        this.client = client;
        this.guild = guild;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.player = player;
        this.node = node;
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
    static async create(client, guild, voiceChannel, textChannel) {
        const node = client.shoukaku.getNode();
        if (!node)
            throw new Error("No available nodes!");
        const player = await node.joinChannel({
            guildId: guild.id,
            channelId: voiceChannel.id,
            shardId: 0,
            deaf: true,
        });
        const subscription = new Subscription(client, guild, voiceChannel, textChannel, player, node);
        client.subscriptions.set(guild.id, subscription);
        client.logger.info(`Music >> Subscription Created for ${guild.name} (${guild.id}). Node: ${node.name}`);
        return subscription;
    }
    destroy() {
        this.queue = [];
        this.active = null;
        this.player.connection.disconnect();
        this.client.subscriptions.delete(this.guild.id);
        this.client.logger.warn(`Music >> Subscription Destroyed for ${this.guild.name} (${this.guild.id}). Node: ${this.node.name}`);
    }
    process() {
        const track = this.queue.shift();
        if (!track)
            return this.destroy();
        this.active = track;
        this.player.playTrack({ track: track.data.track });
    }
    add(track) {
        this.queue.push(track);
        if (!this.active)
            return this.process();
    }
    stop() {
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
    // Getters
    get duration() {
        return this.player.position;
    }
    get paused() {
        return this.player.paused;
    }
}
