export const bot = {
    devId: "244662779745665026",
    prefix: "/",
    cliPrefix: ":",
    legacyPrefix: process.env.NODE_ENV != "production" ? "!" : ".",
};

export const emotes = {
    music: {
        youtube: "<:youtube:1067881972774477844>",
        spotify: "<:spotify:1067881968697614476>",
        slider: "⚪",
    },
};

export const server = {
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
};

export const lavalink = {
    nodes: [
        {
            name: "uk:london-1",
            url: "145.239.205.161:2333",
            auth: "yoruistrash",
        },
    ],
};
