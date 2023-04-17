import { KATClient as Client } from "./Client.js";
import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

export class TwitchClient {
    private clientId: string = process.env.TWITCH_CLIENT_ID!;
    private clientSecret: string = process.env.TWITCH_CLIENT_SECRET!;

    private authProvider = new ClientCredentialsAuthProvider(this.clientId, this.clientSecret);
    private apiClient = new ApiClient({ authProvider: this.authProvider });

    constructor(public client: Client) {}

    async getStream(name: string) {
        const stream = await this.apiClient.streams.getStreamByUserName(name);
        return stream;
    }

    async getChannel(name: string) {
        const channel = await this.apiClient.users.getUserByName(name);
        return channel;
    }
}
