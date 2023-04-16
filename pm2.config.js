module.exports = {
    apps: [
        {
            name: "kat",
            script: "kat/index.js",
            instances: 1,
            autorestart: true,
            watch: ["kat/src", "kat/index.js", "kat/config.js", "kat/package.json"],
            env: {
                NODE_ENV: "production",
            }
        },
    ],
};