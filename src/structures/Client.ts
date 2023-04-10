import Config from "@config";

import { Client, ClientOptions, Events, Collection, PermissionsBitField } from "discord.js";
import { Logger } from "./Logger.js";
import { Database } from "./Database.js";
import { Commander } from "./Commander.js";
import { ShoukakuClient } from "./ShoukakuClient.js";
import { ColorClient } from "./ColorClient.js";
import { TwitchClient } from "./TwitchClient.js";
import { Server } from "@api/structures/Server.js";

import chalk from "chalk";

export class KATClient extends Client {
    public startTime: number = Date.now();

    public permissions: PermissionsBitField = new PermissionsBitField([
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

    public config = Config;

    public devId = Config.bot.devId;
    public prefix = Config.bot.prefix;
    public legacyPrefix = Config.bot.legacyPrefix;

    public logger: Logger = new Logger(this);
    public database?: Database = new Database(this);
    public commander: Commander = new Commander(this);
    public shoukaku: ShoukakuClient = new ShoukakuClient(this);
    public colors: ColorClient = new ColorClient(this);
    public twitch: TwitchClient = new TwitchClient(this);
    public server: Server = new Server(this);

    public subscriptions: Collection<any, any> = new Collection();

    constructor(options: ClientOptions) {
        super(options);

        this.on(Events.Error, (err) => { this.logger.error(err) });

        if (process.env.NODE_ENV != "production") this.on(Events.Debug, msg => { this.logger.debug(msg) });
    }

    async initialize(): Promise<void> {
        await this.database?.initialize();
        console.log(chalk.greenBright.bold.underline(">>> Database Initialized"));

        await this.commander.initialize();
        console.log(chalk.greenBright.bold.underline(">>> Commander Initialized"));
    }
}
