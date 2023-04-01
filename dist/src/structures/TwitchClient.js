import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
export class TwitchClient {
    client;
    clientId = process.env.TWITCH_CLIENT_ID;
    clientSecret = process.env.TWITCH_CLIENT_SECRET;
    authProvider = new ClientCredentialsAuthProvider(this.clientId, this.clientSecret);
    apiClient = new ApiClient({ authProvider: this.authProvider });
    constructor(client) {
        this.client = client;
        this.client = client;
    }
    async getStream(name) {
        const stream = await this.apiClient.streams.getStreamByUserName(name);
        return stream;
    }
    async getChannel(name) {
        const channel = await this.apiClient.users.getUserByName(name);
        return channel;
    }
}
