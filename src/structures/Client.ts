import * as Config from "@config";
import { Client, ClientOptions, Events, Collection, PermissionsBitField, Snowflake } from "discord.js";
import { Logger } from "./Logger.js";
import { PrismaClient } from "@prisma/client";
import { Commander } from "./Commander.js";
import { ShoukakuClient } from "./ShoukakuClient.js";
import { TwitchClient } from "./TwitchClient.js";
import { Server } from "@api/structures/Server.js";
import { Cache } from "./Cache.js";
import { Subscription as MusicSubscription } from "./music/Subscription.js";
import { ActionEmbed } from "@utils/embeds/action.js";

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
    public cliPrefix = Config.bot.cliPrefix;

    public logger: Logger = new Logger(this);
    // Prisma causes an issue with circular references. Try fixing this later
    public prisma: PrismaClient = new PrismaClient({ log: ["warn", "error"] });
    public commander: Commander = new Commander(this);
    public shoukaku: ShoukakuClient = new ShoukakuClient(this);
    public twitch: TwitchClient = new TwitchClient(this);
    public server: Server = new Server(this);
    public cache: Cache = new Cache(this);

    public subscriptions: Collection<Snowflake, MusicSubscription> = new Collection();

    constructor(options: ClientOptions) {
        super(options);

        this.on(Events.Error, (err) => { this.logger.error(err) });

        if (process.env.NODE_ENV != "production") this.on(Events.Debug, msg => { this.logger.debug(msg) });

        process.on("beforeReload", async () => {
            if (!this.subscriptions.size) return;
    
            console.log("-> Warning Subscriptions...");
    
            for (const subscription of this.subscriptions.values()) {
                if (!subscription.active) continue;
    
                const channel = subscription.textChannel;
                if (!channel) continue;
    
                try {
                    await channel.send({ embeds: [new ActionEmbed("warn").setText("The bot is restarting, replay your track after a few seconds!")] });
                    console.log(`-> Warned ${subscription.guild.name} (${subscription.guild.id})`);
                } catch (err) {
                    console.error(`-> Failed To Warn ${subscription.guild.name} (${subscription.guild.id}): ${err instanceof Error ? err.message : err}`);
                }
            }
    
            console.log("-> Warned All Subscriptions");
        });
    }

    async initialize(): Promise<void> {
        try {
            await this.prisma.$connect();
            console.log(chalk.greenBright.bold.underline(">>> Prisma Initialized"));
        } catch (err) {
            this.logger.error(err);
            console.error(chalk.red("Prisma (ERROR) >> Error Connecting"));
            console.error(err);
        }

        await this.commander.initialize();
        console.log(chalk.greenBright.bold.underline(">>> Commander Initialized"));
    }
}