const { createClient } = require('redis');

module.exports = async (client) => {
    const redis = createClient({
        url: process.env.REDIS_URL,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > 3) return new Error('Redis >> Failed To Connect'.red);
                return Math.min(retries * 100, 3000);
            }
        }
    });

    redis.on('connect', () => client.logger?.info('Redis >> Client Connected'));
    redis.on('end', () => client.logger?.info('Redis >> Client Disconnected'));
    redis.on('error', (err) => {
        console.error('Redis >> Client Error'.red);
        console.error(err);

        client.logger?.error(err);
    });

    await redis.connect();

    return redis;
};