const DiscordVoice = require('@discordjs/voice');
const Commander = require('@commander');

class MusicSubscription {
  constructor(client, voiceConnection, channel) {
    this.client = client;
    this.voice = voiceConnection;
    this.player = DiscordVoice.createAudioPlayer();
    this.channel = channel;
    this.guild = channel.guild;
    this.queue = [];

    this.initializeListeners(this.voice, this.player);

    this.voice.subscribe(this.player);
  }

  static async create(client, channel) {
    try {
      let sub = new MusicSubscription(
        client,
        DiscordVoice.joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        }),
        channel
      );

      // if (cached && (cached.playing || cached.queue.length)) sub.merge(cached)
      sub.voice.on('error', (err) => {
        console.error('Music (VOICE) >> Voice Error'.red);
        console.error(err);
      });

      client.subscriptions.set(channel.guild.id, sub);
      console.log(`\nMusic >> Subscription Created: ${sub.guild.name} (${sub.guild.id})`.brightGreen);

      return sub;
    } catch (err) {
      console.error('Music (ERROR) >> Error Creating Subscription');
      console.error(err);
      Commander.handleError(client, err, false, channel.guild);
    }
  }

  initializeListeners(voice, player) {
    // Configure voice connection

    voice.on('stateChange', async (_, newState) => {
      if (newState.status == DiscordVoice.VoiceConnectionStatus.Disconnected) {
        console.log('Music (VOICE) >> Connection Disconnected'.yellow);
        if (newState.reason == DiscordVoice.VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode == 4014) {
          console.log('Music (VOICE) >> Connection Disconnected (Code 4014)'.yellow);
          await this.connect(5000);
        } else if (voice.rejoinAttempts < 5) {
          voice.rejoinAttempts + 1;
          voice.rejoin();
        } else {
          voice.destroy();
        }
      } else if (newState.status == DiscordVoice.VoiceConnectionStatus.Destroyed) {
        console.log('Music >> (VOICE) Connection Destroyed'.yellow);
        this.destroy();
      } else if (!this.readyLock && (newState.status == DiscordVoice.VoiceConnectionStatus.Connecting || newState.status == DiscordVoice.VoiceConnectionStatus.Signalling)) {
        // console.log('Music >> (VOICE) Connection Connecting / Signalling'.yellow);
        await this.connect(20000);
      }
    });

    // Configure audio player
    player.on('stateChange', (oldState, newState) => {
      // console.log(`Music (PLAYER) >> Previous State: ${oldState.status}`.magenta);
      // console.log(`Music (PLAYER) >> New State: ${newState.status}`.magenta);

      if (newState.status == DiscordVoice.AudioPlayerStatus.Idle && oldState.status !== DiscordVoice.AudioPlayerStatus.Idle) {
        this.active = null;
        oldState.resource.metadata.onFinish();
        this.process();
      } else if (newState.status == DiscordVoice.AudioPlayerStatus.Playing && oldState.status !== DiscordVoice.AudioPlayerStatus.AutoPaused) {
        console.log('Music (PLAYER) >> Playing Track: '.brightGreen);
        console.log({
          Title: this.active.title,
          Duration: this.active.duration,
          URL: this.active.url,
          Guild: `${this.guild.name} (${this.guild.id})`
        });
        if (oldState.status !== DiscordVoice.AudioPlayerStatus.Paused) newState.resource.metadata.onStart();
      }
    });
  }

  async connect(timeout) {
    if (!this.readyLock) {
      try {
        await DiscordVoice.entersState(this.voice, DiscordVoice.VoiceConnectionStatus.Ready, timeout);
        // console.log('Music (VOICE) >> Connection Ready'.brightGreen);
      } catch (err) {
        if (this.voice.state.status !== DiscordVoice.VoiceConnectionStatus.Destroyed) this.voice.destroy();
      } finally {
        this.readyLock = false;
      }
    }
  }

  destroy() {
    if (!this.isVoiceDestroyed()) this.voice.destroy();
    this.client.subscriptions.delete(this.guild.id);
    console.log(`Music >> Subscription Destroyed: ${this.guild.name} (${this.guild.id})`.yellow);
  }

  async process() {
    if (this.queueLocked || this.player.state.status !== DiscordVoice.AudioPlayerStatus.Idle) return;

    this.queueLocked = true;
    if (!this.isVoiceReady()) await this.connect(20000);
    const track = this.queue.shift();
    if (!track) return this.destroy();

    try {
      const resource = await track.createResource();
      this.player.play(resource);
      this.queueLocked = false;
      this.active = track;
    } catch (err) {
      console.error('Music (ERROR) >> Error Playing Track'.red);
      console.error(err);
      Commander.handleError(this.client, err, false, this.guild);

      track.onError(err);
      this.queueLocked = false;
      this.process();
    }
  }

  add(track) {
    this.queue.push(track);
    this.process();
  }

  clear() {
    this.queue = [];
    return this.player.stop(true);
  }

  pause() {
    return this.player.pause();
  }

  unpause() {
    return this.player.unpause();
  }

  // BOOLEANS

  isVoiceReady() {
    return (this.voice.state.status == DiscordVoice.VoiceConnectionStatus.Ready);
  }

  isVoiceDestroyed() {
    return (this.voice.state.status == DiscordVoice.VoiceConnectionStatus.Destroyed);
  }

  isPlayerPlaying() {
    return (this.player.state.status == DiscordVoice.AudioPlayerStatus.Playing);
  }

  isPlayerPaused() {
    return (this.player.state.status == DiscordVoice.AudioPlayerStatus.Paused);
  }
}

module.exports = MusicSubscription;