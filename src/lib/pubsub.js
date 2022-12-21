const Discord = require('discord.js');
const Commander = require('@commander');

class PubSubClient {
    static cache = new Discord.Collection();

    constructor(client) {
        this.client = client;
        this.channels = new Discord.Collection();

        try {
            this.pubsub = this.client.database.redis.duplicate();

            this.pubsub.on('connect', () => console.log('[PubSubClient] '.red + 'PubSub Connected'));
            this.pubsub.on('end', () => console.log('[PubSubClient] '.red + 'PubSub Disconnected'));
            this.pubsub.on('error', (err) => console.log('PubSubClient Error', err));

            this.pubsub.connect();
        } catch (err) {
            console.error('PubSubClient (ERROR) >> Error Creating Client'.red);
            console.error(err);

            this.client.logger?.error(err);
        }
    }

    async subscribe(channel, cb) {
        try {
            await this.pubsub.subscribe(channel, cb);
            this.channels.set(channel, cb);
            console.log('[PubSubClient] '.red + 'Subscribed Channel: ' + channel);
        } catch (err) {
            console.error(`PubSubClient (ERROR) >> Error Subscribing: ${channel}`.red);
            console.error(err);

            this.client.logger?.error(err);
        }
    }

    async unsubscribe(channel) {
        try {
            await this.pubsub.unsubscribe(channel);
            this.channels.delete(channel);
            console.log('[PubSubClient] '.red + 'Unsubscribed Channel: ' + channel);
        } catch (err) {
            console.error(`PubSubClient (ERROR) >> Error Unsubscribing: ${channel}`.red);
            console.error(err);

            this.client.logger?.error(err);
        }
    }

    close() {
        if (this.pubsub.isOpen) this.pubsub.quit();
    }
}

module.exports = PubSubClient;