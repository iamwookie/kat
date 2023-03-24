import Config from "../configs/bot.json" assert { type: "json" };

import { Client, ClientOptions, Events, Collection, PermissionsBitField } from "discord.js";
import { Express } from "express";
import { Logger } from "./Logger.js";
import { Database } from "./Database.js";
import { Commander } from "./Commander.js";
import { ColorClient } from "./ColorClient.js";
import { TwitchClient } from "./TwitchClient.js";
import Server from "@api/server.js";

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

    public devId: string = Config.devId;
    public prefix: string = Config.prefix;

    public logger: Logger = new Logger(this);
    public database: Database = new Database(this);
    public commander: Commander = new Commander(this);
    public colors: ColorClient = new ColorClient(this);
    public twitch: TwitchClient = new TwitchClient(this);
    public server: Express;

    public subscriptions: Collection<any, any> = new Collection();

    constructor(options: ClientOptions) {
        super(options);

        this.on(Events.Error, (err) => { this.logger.error(err) });

        if (process.env.NODE_ENV != "production") this.on(Events.Debug, msg => { this.logger.debug(msg) });

        this.on(Events.ClientReady, async (client) => {
            await this.colors.initialize();
            console.log(chalk.greenBright.bold.underline(`>>> Colors Initialized`));

            console.log(chalk.magenta.bold.underline(`\n>>> App Online, Client: ${client.user.tag} (${client.user.id}) [Guilds: ${client.guilds.cache.size}]`));
            console.log(chalk.magenta.bold.underline(`>>> App Loaded In: ${Date.now() - this.startTime}ms`));
        });
    }

    async initialize(): Promise<void> {
        this.server = await Server(this);

        await this.database.connect();
        await this.database.load();
        console.log(chalk.greenBright.bold.underline(">>> Database Initialized"));

        await this.commander.initializeCLICommands();
        await this.commander.initializeGlobalCommands();
        await this.commander.initializeGuildCommands();
        await this.commander.registerGlobalCommands();
        await this.commander.registerGuildCommands();
        console.log(chalk.greenBright.bold.underline(">>> Commander Initialized"));
    }
}
