export const version = "7.5.10";

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

export const music = {
    inactiveDuration: 30_000, // The time in milliseconds before the bot leaves the voice channel
};

export const lavalink = {
    nodes: [
        {
            name: "uk:london-1",
            url: "lavalink.bil.al",
            auth: "yoruistrash",
            secure: true,
        },
    ],
};
