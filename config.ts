export const version = '7.9.2';

export const devs = ['244662779745665026'];

export const bot = {
    prefix: process.env.NODE_ENV != 'production' ? '!' : '.',
    devPrefix: process.env.NODE_ENV != 'production' ? '!' : '.',
};

export const server = {
    port: 3030,
    limiter: {
        duration: 5,
        max: 50,
    },
};

export const music = {
    inactiveDuration: 30_000, // The time in milliseconds before the bot leaves the voice channel
};

export const lavalink = {
    nodes: [
        {
            name: 'uk:london-1',
            url: 'lavalink.bil.al',
            auth: 'yoruistrash',
            secure: true,
        },
    ],
};
