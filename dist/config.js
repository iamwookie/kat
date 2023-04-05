export default {
    bot: {
        devId: "244662779745665026",
        prefix: "/",
        legacyPrefix: process.env.NODE_ENV != "production" ? "!" : ".",
        emotes: {
            music: {
                youtube: "<:youtube:1067881972774477844>",
                spotify: "<:spotify:1067881968697614476>",
                slider: "⚪",
            },
        },
    },
    server: {
        port: 3030,
        limiter: {
            duration: 5,
            max: 50,
        },
        hooks: {
            asap: {
                unbox: ["1055019802361598023"],
                suits: ["1054873048160927774"],
                staff: ["520652380799369218", "634141378229567498"],
            },
        },
    },
    lavalink: {
        nodes: [
            {
                name: "uk:london-1",
                url: "localhost:2333",
                auth: "yoruistrash",
            },
        ],
    },
};
