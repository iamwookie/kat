import Config from "../../config.js";
import { Client, Events, Collection, PermissionsBitField } from "discord.js";
import { Logger } from "./Logger.js";
import { Database } from "./Database.js";
import { Commander } from "./Commander.js";
import { ShoukakuClient } from "./ShoukakuClient.js";
import { ColorClient } from "./ColorClient.js";
import { TwitchClient } from "./TwitchClient.js";
import Server from "../api/server.js";
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
    logger = new Logger(this);
    database = new Database(this);
    commander = new Commander(this);
    shoukaku = new ShoukakuClient(this);
    colors = new ColorClient(this);
    twitch = new TwitchClient(this);
    server;
    subscriptions = new Collection();
    constructor(options) {
        super(options);
        this.on(Events.Error, (err) => { this.logger.error(err); });
        if (process.env.NODE_ENV != "production")
            this.on(Events.Debug, msg => { this.logger.debug(msg); });
    }
    async initialize() {
        this.server = await Server(this);
        await this.database?.initialize();
        console.log(chalk.greenBright.bold.underline(">>> Database Initialized"));
        await this.commander.initialize();
        console.log(chalk.greenBright.bold.underline(">>> Commander Initialized"));
    }
}
