import { KATClient as Client } from "../Client.js";
import { YouTubeTrack } from "./Track.js";
import { Guild, VoiceBasedChannel, Events, TextBasedChannel } from "discord.js";
import { Shoukaku, Player, Node } from "shoukaku";

import chalk from "chalk";
import { ActionEmbed } from "@src/utils/embeds/action.js";

export class Subscription {
    public shoukaku: Shoukaku
    public queue: YouTubeTrack[] = [];
    public active: YouTubeTrack | null = null;

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

        this.client.on(Events.VoiceStateUpdate, (oldState) => {
            if (oldState.channelId !== this.voiceChannel.id) return;
            if (oldState.channel?.members.size === 1) this.destroy();
        });

        this.shoukaku.on("disconnect", (name) => {
            if (name === this.node.name) {
                this.textChannel?.send({ embeds: [new ActionEmbed("fail").setDesc("The voice node has disconnected. Try playing another track!")] }).catch((err) => { this.client.logger.error(err) });
                this.destroy();
            }
        })

        this.player.on("exception", (reason) => {
            this.client.logger.error(reason);
            console.error(chalk.red(`Music >> Exception in ${this.guild.name} (${this.guild.id}). Node: ${this.node.name}`));

            this.active?.onError(reason);
            this.active = null;
            this.process();
        });

        this.player.on("start", () => {
            this.active?.onStart();
            this.client.logger.info(`Music >> Started Playing in ${this.guild.name} (${this.guild.id}). Node: ${this.node.name}`);
        });

        this.player.on("end", () => {
            this.active?.onFinish();
            this.active = null;
            this.process();
        });

        this.player.on("closed", () => {
            this.client.logger.info(`Music >> Closed Connection in ${this.guild.name} (${this.guild.id}). Node: ${this.node.name}`);
            this.destroy();
        });
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

        client.logger.info(`Music >> Subscription Created for ${guild.name} (${guild.id}). Node: ${node.name}`);

        return subscription;
    }

    destroy() {
        this.queue = [];
        this.active = null;
        this.player.connection.disconnect();
        this.client.subscriptions.delete(this.guild.id);
    }

    process() {
        const track = this.queue.shift();
        if (!track) return this.destroy();

        this.active = track;
        this.player.playTrack({ track: track.data.track });
    }

    add(track: YouTubeTrack) {
        this.queue.push(track);
        if (!this.active) return this.process();
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
