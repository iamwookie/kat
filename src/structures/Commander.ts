// This is the command handler, CODENAME: Commander v7.0.0
import { KATClient as Client} from "./Client.js";

// ----- FOR LATER USE -----
// import readline, { Interface } from "readline";
import { REST, Routes, ChatInputCommandInteraction, Message, Collection, Snowflake } from "discord.js";
import { Command }from "./Command.js";
import { Module } from "./Module.js";
import { ActionEmbed } from "@utils/embeds/index.js";

import chalk from "chalk";

// -----------------------------------
import * as Commands from "@commands/index.js";
import * as Events from "@events/index.js";

const cliCommands: any = [];

const globalCommands = [
    // Music
    Commands.PlayCommand,
    Commands.StopCommand,
    Commands.PauseCommand,
    Commands.SkipCommand,
    Commands.QueueCommand,
    Commands.LyricsCommand,

    // Misc
    Commands.HelpCommand,
]

const reservedCommands = [
    // Color
    Commands.ColorCommand,
    Commands.AddColorCommand,

    // Twitch
    Commands.TwitchCommand,
];
// -----------------------------------
export class Commander {
    // ----- FOR LATER USE -----
    // private readline: Interface = readline.createInterface(process.stdin);
    private rest: REST = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);

    public cli: Collection<string, any> = new Collection();
    public global: Collection<string, any> = new Collection();
    public guilds: Collection<Snowflake, any> = new Collection();

    public groups: Collection<string, Collection<string, Command>> = new Collection();
    public commands: Collection<string, Command> = new Collection();
    public modules: Collection<string, Module> = new Collection();
    public aliases: Collection<string, string> = new Collection();

    constructor(public readonly client: Client) {
        this.client = client;
    }

    async initialize() {
        this.initializeCLICommands();
        this.initializeGlobalCommands();
        this.initializeReservedCommands();

        await this.registerGlobalCommands();
        await this.registerReservedCommands();

        this.intiliazeEvents();
    }

    initializeCLICommands() {
        if (cliCommands.length) {
            for (const CLICommand of cliCommands) {
                try {
                    const command = new CLICommand(this);
                    command.initialize();

                    this.cli.set(command.name, command);
                } catch (err) {
                    this.client.logger.error(err);
                    console.error(chalk.red("Commander (ERROR) >> Error Initializing CLI Command"));
                    console.error(err);
                }
            }
        }
    }

    initializeGlobalCommands() {
        if (globalCommands.length) {
            for (const GlobalCommand of globalCommands) {
                try {
                    const command = new GlobalCommand(this);
                    command.initialize();

                    this.commands.set(command.name, command);
                } catch (err) {
                    this.client.logger.error(err);
                    console.error(chalk.red("Commander (ERROR) >> Error Initializing Global Command"));
                    console.error(err);
                }
            }

            this.client.logger.info(`Commander >> Successfully Initialized ${globalCommands.length} Global Commands`);
        }
    }

    initializeReservedCommands() {
        if (reservedCommands.length) {
            for (const GuildCommand of reservedCommands) {
                try {
                    const command = new GuildCommand(this);
                    if (!command.guilds) this.client.logger.warn(`Commander >> Guild Not Set For Guild Command: ${command.name}`);
                    command.initialize();

                    this.commands.set(command.name, command);
                } catch (err) {
                    this.client.logger.error(err);
                    console.error(chalk.red("Commander (ERROR) >> Error Initializing Guild Command"));
                    console.error(err);
                }
            }

            this.client.logger.info(`Commander >> Successfully Initialized ${reservedCommands.length} Reserved Commands`);
        }
    }

    intiliazeEvents() {
        const events = Object.values(Events);

        if (events.length) {
            for (const GlobalEvent of events) {
                try {
                    const event = new GlobalEvent(this.client, this);
                    this.client.on(event.name, event.execute.bind(event));
                } catch (err) {
                    this.client.logger.error(err);
                    console.error(chalk.red("Commander (ERROR) >> Error Registering Event"));
                    console.error(err);
                }
            }

            this.client.logger.info(`Commander >> Successfully Initialized ${events.length} Events`);
        }
    }

    async registerGlobalCommands() {
        try {
            let commands = [];

            for (const [_, command] of this.global) {
                if (!command.data || command.disabled || command.hidden) continue;

                if (command.aliases) {
                    for (const alias of command.aliases) {
                        const data = command.data().setName(alias);
                        commands.push(data);
                    }
                }

                commands.push(command.data().toJSON());
            }

            const res: any = await this.rest.put(Routes.applicationCommands(process.env.BOT_APP_ID!), { body: commands });
            this.client.logger.info(`Commander >> Successfully Registered ${res.length} Global Command(s)`);
        } catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("Commander (ERROR) >> Error Registering Global Slash Commands"));
            console.error(err);
        }
    }

    async registerReservedCommands() {
        for (const [k, g] of this.guilds) {
            let commands = [];

            if (!g.commands) continue;

            for (const [_, command] of g.commands) {
                if (!command.data || command.disabled || command.hidden) continue;

                if (command.aliases) {
                    for (const alias of command.aliases) {
                        const data = command.data().setName(alias);
                        commands.push(data);
                    }
                }

                commands.push(command.data().toJSON());
            }

            try {
                const res: any = await this.rest.put(Routes.applicationGuildCommands(process.env.BOT_APP_ID!, k), { body: commands });
                this.client.logger.info(`Commander >> Successfully Registered ${res.length} Guild Command(s) For Guild: ${k}`);
            } catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red(`Commander (ERROR) >> Error Registering Guild Slash Commands For Guild: ${k}`));
                console.error(err);
            }
        }

        this.client.logger.info("Commander >> Successfully Registered All Guild Commands");
    }

    validate(interaction: ChatInputCommandInteraction | Message, command: any) {
        const author = interaction instanceof ChatInputCommandInteraction ? interaction.user : interaction.author;

        if (command.users && !command.users.includes(author.id)) {
            interaction.reply({ embeds: [new ActionEmbed("fail").setUser(author).setDesc("You are not allowed to use this command!")] });
            return false;
        }

        if (command.cooldown && command.cooldowns) {
            if (command.cooldowns.has(author.id)) {
                const cooldown = command.cooldowns.get(author.id);
                const secondsLeft = (cooldown - Date.now()) / 1000;

                interaction.reply({ embeds: [new ActionEmbed("fail").setUser(author).setDesc(`Please wait \`${secondsLeft.toFixed(1)}\` seconds before using that command again!`)] });
                return false;
            }
        }

        return true;
    }

    // async initializeModules() {
    //     if (globalFolders.length) {
    //         for (const folder of globalFolders) {
    //             const globalFiles = fs.readdirSync(`${globalPath}/${folder}`).filter((file) => file.endsWith(".js"));

    //             for (const file of globalFiles) {
    //                 // delete require.cache[require.resolve(`${globalPath}/${folder}/${file}`)];

    //                 const object = await import(`${globalPath}/${folder}/${file}`);
    //                 const module = new Module(this, object);

    //                 await module.initialize(this.client);

    //                 this.modules.set(module.name, module);
    //             }
    //         }
    //     }

    //     if (guildFolders.length) {
    //         for (const folder of guildFolders) {
    //             const guildSubFolders = fs.readdirSync(`${guildPath}/${folder}`);

    //             for (const subFolder of guildSubFolders) {
    //                 const guildFiles = fs.readdirSync(`${guildPath}/${folder}/${subFolder}`).filter((file) => file.endsWith(".js"));

    //                 for (const file of guildFiles) {
    //                     // delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)];

    //                     const object = await import(`${guildPath}/${folder}/${subFolder}/${file}`);
    //                     const module = new Module(this, object);
    //                     if (!module.guilds || !module.guilds.includes(folder)) this.client.logger.warn(`Commander >> Guild Not Set For Guild Module: ${module.name}`);

    //                     module.initialize(this.client);

    //                     this.modules.set(module.name, module);
    //                 }
    //             }
    //         }
    //     }
    // }
}
