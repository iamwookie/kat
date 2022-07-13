const Discord = require('discord.js');
const Commander = require('@commander');
const { ClientCredentialsAuthProvider } = require('@twurple/auth');
const { ApiClient } = require('@twurple/api');
const { TwitchEmbed } = require('@utils/other/embeds');

class TwitchManager {
  constructor(client) {
    this.client = client;
    this.authProvider = new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
    this.apiClient = new ApiClient({ authProvider: this.authProvider });
  }

  static async initialize(client) {
    try {
      let twitch = new TwitchManager(client);
      console.log('>>> TwitchManager Initialized'.brightGreen.bold.underline);

      return twitch;
    } catch (err) {
      console.error('TwitchManager (ERROR) >> Error Initializing'.red);
      console.error(err);
      Commander.handleError(this.client, err, false);
    }
  }

  async registerListeners(listener) {
    this.listeners = new Discord.Collection();

    let data = await this.client.database.getTwitch();

    for (const info of data) {
      if (!info.autoSend) continue;

      try {
        let user = await this.apiClient.users.getUserByName(info.user);

        if (!user) throw new Error(`User ${info.user} not found.`);

        let subscription = await listener.subscribeToStreamOnlineEvents(user, async (event) => {
          try {
            let stream = await event.getStream();
            let image = await stream.getThumbnailUrl(1280, 720);

            let embed = new TwitchEmbed(user, stream, image);

            for (const channelId of info.channels) {
              let channel = await this.client.channels.fetch(channelId);
              if (channel) channel.send({ content: "@everyone", embeds: [embed] });
            }
          } catch (err) {
            console.error(`TwitchManager (ERROR) >> Error Sending Notification`.red);
            console.error(err);
            Commander.handleError(this.client, err, false);
          }
        });

        this.listeners.set(user.id, subscription);

        console.log('TwitchManager >> Created Event Listeners'.brightGreen.bold);
      } catch (err) {
        console.error('TwitchManager (ERROR) >> Failed To Create Listener'.red);
        console.error(err);
        Commander.handleError(this.client, err, false);
      }
    }
  }

  async getStreamByUserName(name) {
    if (!name) throw new Error('User not defined.');
    let stream = await this.apiClient.streams.getStreamByUserName(name);
    return stream;
  }

  async getUserByUserName(name) {
    if (!name) throw new Error('User not defined.');
    let user = await this.apiClient.users.getUserByName(name);
    return user;
  }
}

module.exports = TwitchManager;


