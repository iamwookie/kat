const redis = require('redis');

module.exports = async () => {
    const client = redis.createClient({ 
        url: process.env.REDIS_URL,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > 3) return new Error('[Redis] Failed To Connect');
                return Math.min(retries * 100, 3000);
            }
        }
    });

    client.on('connect', () => console.log('[Redis] '.red + 'Client Connected'));
    client.on('end', () => console.log('[Redis] '.red + 'Client Disconnected'));
    client.on('error', (err) => { console.log('[Redis] Client Error'.red); console.error(err); });

    await client.connect();

    return client;
};