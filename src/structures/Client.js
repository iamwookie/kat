import * as Config from "../../config.js";
import { Client, Events, Collection, PermissionsBitField } from "discord.js";
import { Logger } from "./Logger.js";
import { PrismaClient } from "@prisma/client";
import { Commander } from "./Commander.js";
import { ShoukakuClient } from "./ShoukakuClient.js";
import { TwitchClient } from "./TwitchClient.js";
import { Server } from "../api/structures/Server.js";
import { Cache } from "./Cache.js";
import chalk from "chalk";
export class KATClient extends Client {
    startTime = Date.now();
    permissions = new PermissionsBitField([
        // GENERAL
        PermissionsBitField.Flags.ViewChannel,
        // TEXT
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.AttachFiles,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.UseExternalEmojis,
        PermissionsBitField.Flags.UseExternalStickers,
        PermissionsBitField.Flags.AddReactions,
        // VOICE
        PermissionsBitField.Flags.Connect,
        PermissionsBitField.Flags.Speak,
        PermissionsBitField.Flags.UseVAD,
    ]);
    config = Config;
    devId = Config.bot.devId;
    prefix = Config.bot.prefix;
    legacyPrefix = Config.bot.legacyPrefix;
    cliPrefix = Config.bot.cliPrefix;
    logger = new Logger(this);
    // Prisma causes an issue with circular references. Try fixing this later
    prisma = new PrismaClient({ log: ["warn", "error"] });
    commander = new Commander(this);
    shoukaku = new ShoukakuClient(this);
    twitch = new TwitchClient(this);
    server = new Server(this);
    cache = new Cache(this);
    subscriptions = new Collection();
    constructor(options) {
        super(options);
        this.on(Events.Error, (err) => { this.logger.error(err); });
        if (process.env.NODE_ENV != "production")
            this.on(Events.Debug, msg => { this.logger.debug(msg); });
    }
    async initialize() {
        try {
            await this.prisma.$connect();
            console.log(chalk.greenBright.bold.underline(">>> Prisma Initialized"));
        }
        catch (err) {
            this.logger.error(err);
            console.error(chalk.red("Prisma (ERROR) >> Error Connecting"));
            console.error(err);
        }
        await this.commander.initialize();
        console.log(chalk.greenBright.bold.underline(">>> Commander Initialized"));
    }
}
