module.exports = {
    apps: [
        {
            name: "kat",
            script: "kat/dist/index.js",
            instances: 1,
            autorestart: true,
            watch: "kat/dist",
            env: {
                NODE_ENV: "production",

                SENTRY_DSN: "https://2d9d272b4aaa4fcdb5b032a796cea564@o4504363480383488.ingest.sentry.io/4504363481956352",

                BOT_TOKEN: process.env.BOT_TOKEN,
                BOT_APP_ID: process.env.BOT_APP_ID,
                KAT_API_KEY: process.env.CAT_API_KEY,

                REDIS_URL: process.env.REDIS_URL,

                TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
                TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,

                GENIUS_API_KEY: process.env.GENIUS_API_KEY,
            },
        },
    ],
};