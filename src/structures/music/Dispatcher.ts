import { KATClient as Client } from '../Client.js';
import { Shoukaku, Connectors, Node, Player, NodeOption } from 'shoukaku';
import { Subscription } from './Subscription.js';
import { Collection, Guild, TextBasedChannel, User, VoiceBasedChannel } from 'discord.js';
import { YouTubeTrack, SpotifyTrack } from './Track.js';
import { YouTubePlaylist, SpotifyPlaylist } from './Playlist.js';
import { NodeError, PlayerError, SearchError } from '../interfaces/Errors.js';
import { Events } from '../interfaces/Events.js';

declare module 'shoukaku' {
    interface LavalinkResponse {
        exception: {
            message: string;
            severity: string;
            cause: string;
        };
    }
}

export class Dispatcher {
    private nodes: NodeOption[];

    public shoukaku: Shoukaku;
    public subscriptions: Collection<string, Subscription>;

    constructor(public client: Client) {
        this.nodes = this.client.config.lavalink.nodes;

        this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this.client), this.nodes, {
            reconnectTries: 10,
            restTimeout: 5_000,
            moveOnDisconnect: false,
        });

        this.subscriptions = new Collection<string, Subscription>();

        this.shoukaku.on('error', (name, error) => this.client.emit(Events.NodeError, name, error));
        this.shoukaku.on('ready', (name) => this.client.emit(Events.NodeReady, name));
        this.shoukaku.on('reconnecting', (name, info, tries) => this.client.emit(Events.NodeReconnecting, name, info, tries));
        this.shoukaku.on('disconnect', (name) => this.client.emit(Events.NodeDisconnect, name));
        this.shoukaku.on('close', (name, code) => this.client.emit(Events.NodeClose, name, code));

        this.client.logger.status('>>>> Dispatcher Initialized');
    }

    public async createSubscription(guild: Guild, voiceChannel: VoiceBasedChannel, textChannel: TextBasedChannel): Promise<Subscription> {
        const exists = this.subscriptions.get(guild.id);
        if (exists) return exists;

        let node: Node | undefined;

        try {
            node = this.shoukaku.getNode();
            if (!node) throw new NodeError('No nodes available.');
        } catch (err) {
            throw new NodeError((err as Error).message);
        }

        let player: Player;

        try {
            player = await node.joinChannel({
                guildId: guild.id,
                channelId: voiceChannel.id,
                shardId: 0,
                deaf: true,
            });
        } catch (err) {
            throw new PlayerError((err as Error).message);
        }

        const subscription = new Subscription(this, guild, voiceChannel, textChannel, player, node);
        subscription.position = await this.client.cache.queue.count(guild.id);

        const res = await this.client.cache.music.get(guild.id);
        if (res?.volume) subscription.volume = res.volume;

        this.subscriptions.set(guild.id, subscription);
        this.client.emit(Events.SubscriptionCreate, subscription);

        return subscription;
    }

    public async search(query: string, requester: User): Promise<YouTubeTrack | SpotifyTrack | YouTubePlaylist | SpotifyPlaylist | null> {
        let node: Node | undefined;

        try {
            node = this.shoukaku.getNode();
            if (!node) throw new NodeError('No nodes available.');
        } catch (err) {
            throw new NodeError((err as Error).message);
        }

        let search: string | URL;

        try {
            search = new URL(query);
        } catch {
            search = query;
        }

        const res = await node.rest.resolve(search instanceof URL ? search.href : `ytsearch:${search}`);
        if (!res) return null;

        switch (res.loadType) {
            case 'LOAD_FAILED':
                throw new SearchError(1, res.exception.message);
            case 'SEARCH_RESULT':
                return new YouTubeTrack(res.tracks[0], requester);
            case 'TRACK_LOADED': {
                const data = res.tracks[0];
                const source = data.info.sourceName;

                switch (source) {
                    case 'youtube':
                        return new YouTubeTrack(data, requester);
                    case 'spotify':
                        return new SpotifyTrack(data, requester);
                    default:
                        return null;
                }
            }
            case 'PLAYLIST_LOADED': {
                if (!(search instanceof URL)) return null;

                const info = res.playlistInfo;
                const tracks = res.tracks;
                const source = tracks[0].info.sourceName;

                switch (source) {
                    case 'youtube':
                        return new YouTubePlaylist(search, info, requester, tracks);
                    case 'spotify':
                        return new SpotifyPlaylist(search, info, requester, tracks);
                    default:
                        return null;
                }
            }
            default:
                return null;
        }
    }

    public getSubscription(guild: Guild | null): Subscription | undefined {
        if (guild) return this.subscriptions.get(guild.id);
    }
}
