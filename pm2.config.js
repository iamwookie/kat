module.exports = {
    apps: [
        {
            name: "kat",
            script: "kat/index.js",
            instances: 1,
            autorestart: true,
            watch: "kat",
            env: {
                NODE_ENV: "production",
            }
        },
    ],
};