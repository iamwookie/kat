import Config from "../configs/bot.json" assert { type: "json" };
import { Client, Events, Collection, PermissionsBitField } from "discord.js";
import { Logger } from "./Logger.js";
import { Database } from "./Database.js";
import { Commander } from "./Commander.js";
import Server from "../api/server.js";
import chalk from "chalk";
export class KATClient extends Client {
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
    devId = Config.devId;
    prefix = Config.prefix;
    logger = new Logger(this);
    database = new Database(this);
    commander = new Commander(this);
    server;
    subscriptions = new Collection();
    colors = new Collection();
    constructor(options) {
        super(options);
        this.on(Events.Error, (err) => { this.logger.error(err); });
        this.on(Events.ClientReady, (client) => {
            console.log(chalk.magenta.bold.underline(`\n>>> App Online, Client: ${client.user.tag} (${client.user.id}) [Guilds: ${client.guilds.cache.size}]`));
        });
        if (process.env.NODE_ENV != "production")
            this.on(Events.Debug, msg => { this.logger.debug(msg); });
    }
    async initialize() {
        this.server = await Server(this);
        await this.database.connect();
        await this.database.load();
        console.log(chalk.greenBright.bold.underline(">>> Database Initialized"));
        await this.commander.initializeCLICommands();
        await this.commander.initializeGlobalCommands();
        await this.commander.initializeGuildCommands();
        console.log(chalk.greenBright.bold.underline(">>> Commander Initialized"));
    }
}
