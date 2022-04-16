const { ClientCredentialsAuthProvider } = require('@twurple/auth');
const { ApiClient } = require('@twurple/api');

class TwitchManager {
    constructor(client) {
        this.client = client;
        this.authProvider = new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
        this.apiClient = new ApiClient({ authProvider: this.authProvider })
    }

    static initialize(client) {
        if (!client.twitch) {
            client.twitch = new TwitchManager(client);
            console.log('>>> TwitchManager Created'.brightGreen.bold.underline);
        }

        return client.twitch;
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