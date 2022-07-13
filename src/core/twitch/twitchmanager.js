const Commander = require('@commander');
const { ClientCredentialsAuthProvider } = require('@twurple/auth');
const { ApiClient } = require('@twurple/api');

class TwitchManager {
  constructor(client) {
    this.client = client;
    this.authProvider = new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
    this.apiClient = new ApiClient({ authProvider: this.authProvider });
  }

  static initialize(client) {
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