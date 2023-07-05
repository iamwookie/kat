!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1ddcac1a-5ecf-52fe-93aa-a72711e37011")}catch(e){}}();
import { YouTubePlaylist, SpotifyPlaylist } from './Playlist.js';
import { Events } from '../interfaces/Events.js';
export class Subscription {
    dispatcher;
    guild;
    voiceChannel;
    textChannel;
    player;
    node;
    queue;
    active;
    position;
    volume;
    looped;
    destroyed;
    message;
    // Use options interface here in the future
    constructor(dispatcher, guild, voiceChannel, textChannel, player, node) {
        this.dispatcher = dispatcher;
        this.guild = guild;
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.player = player;
        this.node = node;
        this.dispatcher = dispatcher;
        this.queue = [];
        this.active = null;
        this.position = 0;
        this.looped = false;
        this.volume = 100;
        this.destroyed = false;
        this.player.on('exception', (data) => this.dispatcher.client.emit(Events.PlayerException, this, data));
        this.player.on('start', (data) => this.dispatcher.client.emit(Events.PlayerStart, this, data));
        this.player.on('end', (data) => this.dispatcher.client.emit(Events.PlayerEnd, this, data));
        // -----> REQUIRES FIXING FROM SHOUKAKU
        //
        // this.player.on("closed", (reason) => {
        //     this.client.logger.warn(`Music >> Closed Connection in ${this.guild.name} (${this.guild.id}). Node: ${this.node.name}`);
        //     this.destroy();
        // });
    }
    process() {
        const track = this.looped ? this.active : this.queue.shift();
        if (!track)
            return;
        this.active = track;
        this.player.setVolume(this.volume / 100);
        this.player.playTrack({ track: track.data.track });
        if (!this.looped) {
            this.position += 1;
            this.dispatcher.client.emit(Events.TrackRemove, this, track);
        }
    }
    destroy() {
        if (this.destroyed)
            return;
        this.queue = [];
        this.active = null;
        this.player.connection.disconnect();
        this.dispatcher.subscriptions.delete(this.guild.id);
        this.destroyed = true;
        this.dispatcher.client.emit('subscriptionDestroy', this);
    }
    add(item) {
        if (item instanceof YouTubePlaylist) {
            this.queue.push(...item.tracks);
        }
        else if (item instanceof SpotifyPlaylist) {
            this.queue.push(...item.tracks);
        }
        else {
            this.queue.push(item);
        }
        this.dispatcher.client.emit(Events.TrackAdd, this, item);
        if (!this.active)
            this.process();
    }
    stop() {
        this.looped = false;
        this.active = null;
        this.player.stopTrack();
        return this;
    }
    pause() {
        if (!this.active)
            return true;
        this.player.setPaused(true);
        this.dispatcher.client.emit(Events.PlayerPause, this, this.active);
        return this.paused;
    }
    resume() {
        if (!this.active)
            return false;
        this.player.setPaused(false);
        this.dispatcher.client.emit(Events.PlayerResume, this, this.active);
        return this.paused;
    }
    loop() {
        this.looped = !this.looped;
        this.dispatcher.client.emit(Events.PlayerLoop, this, this.active);
        return this.looped;
    }
    // Getters
    get duration() {
        return this.player.position;
    }
    get paused() {
        return this.player.paused;
    }
}
//# debugId=1ddcac1a-5ecf-52fe-93aa-a72711e37011
//# sourceMappingURL=Subscription.js.map
