// This is the command handler, CODENAME: Commander v7.0.0
import { KATClient } from "./Client.js";

import readline, { Interface } from "readline";
import { REST, Routes, Events, CommandInteraction, InteractionType, Collection, Snowflake, ChatInputCommandInteraction } from "discord.js";
import { Command }from "./Command.js";
import { Module } from "./Module.js";
import { ActionEmbed, ErrorEmbed } from "@utils/embeds/index.js";

import chalk from "chalk";

// -----------------------------------
import {
    PlayCommand,
    StopCommand,
    PauseCommand,
    SkipCommand,
    QueueCommand,
    LyricsCommand,
    HelpCommand,
} from "@commands/global/index.js";

import {
    ColorCommand,
    AddColorCommand,
    TwitchCommand
} from "@src/commands/reserved/index.js";

const cliCommands: any = [];

const globalCommands = [
    // Music
    PlayCommand,
    StopCommand,
    PauseCommand,
    SkipCommand,
    QueueCommand,
    LyricsCommand,

    // Misc
    HelpCommand,
];

const reservedCommands: any = [
    // Color
    ColorCommand,
    AddColorCommand,

    // Twitch
    TwitchCommand,
];
// -----------------------------------
export class Commander {
    private readline: Interface = readline.createInterface(process.stdin);
    private rest: REST = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);

    public cli: Collection<string, any> = new Collection();
    public global: Collection<string, any> = new Collection();
    public guilds: Collection<Snowflake, any> = new Collection();

    public groups: Collection<string, Collection<string, Command>> = new Collection();
    public commands: Collection<string, Command> = new Collection();
    public modules: Collection<string, Module> = new Collection();
    public aliases: Collection<string, string> = new Collection();

    constructor(public readonly client: KATClient) {
        this.client = client;

        // CLI Commands
        this.readline.on("line", async (line) => {
            if (!line.startsWith(">")) return;

            const content = line.slice(1).trim().split(/ +/);
            const commandText = content.shift()?.toLowerCase();
            const args = content.join(" ");

            const command = this.cli.get(commandText!) || this.cli.get(this.aliases.get(commandText as string) as string);
            if (!command || command.disabled) return;

            try {
                await command.execute(this.client, args);
                // Breakline
                console.log("");
            } catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Commander (ERROR) >> Error Running CLI Command"));
                console.error(err);
            }
        });

        // Slash Commands
        this.client.on(Events.InteractionCreate, async (interaction) => {
            if (interaction.type !== InteractionType.ApplicationCommand) return;

            const command = this.commands.get(interaction.commandName) || this.commands.get(this.aliases.get(interaction.commandName) as string);
            if (!command || command.disabled) return;

            await interaction.deferReply({ ephemeral: command.ephemeral });

            if (!this.validate(interaction, command)) return;

            try {
                await command.execute(this.client, interaction as ChatInputCommandInteraction);
            } catch (err) {
                const eventId = this.client.logger.error(err);
                console.error(chalk.red("Commander (ERROR) >> Error Running Slash Command"));
                console.error(err);

                interaction.editReply({ embeds: [new ErrorEmbed(eventId)] });
            }
        });
    }

    private validate(interaction: CommandInteraction, command: any) {
        if (command.users && !command.users.includes(interaction.user.id)) {
            interaction.editReply({ embeds: [new ActionEmbed("fail").setUser(interaction.user).setDesc("You are not allowed to use this command!")] });
            return false;
        }

        if (command.cooldown && command.cooldowns) {
            const context = interaction.guild?.id || "dm";

            if (command.cooldowns.has(context) && command.cooldowns.get(context).has(interaction.user.id)) {
                const cooldown = command.cooldowns.get(context).get(interaction.user.id);
                const secondsLeft = (cooldown - Date.now()) / 1000;

                interaction.editReply({ embeds: [new ActionEmbed("fail").setUser(interaction.user).setDesc(`Please wait \`${secondsLeft.toFixed(1)}\` seconds before using that command again!`)] });
                return false;
            }

            command.applyCooldown(interaction.guild, interaction.user);
        }

        return true;
    }

    async initializeCLICommands() {
        if (cliCommands.length) {
            for (const CLICommand of cliCommands) {
                try {
                    const command = new CLICommand(this);
                    await command.initialize();
                    this.cli.set(command.name, command);
                } catch (err) {
                    this.client.logger.error(err);
                    console.error(chalk.red("Commander (ERROR) >> Error Registering CLI Command"));
                    console.error(err);
                }
            }
        }
    }

    async initializeGlobalCommands() {
        if (globalCommands.length) {
            for (const GlobalCommand of globalCommands) {
                try {
                    const command = new GlobalCommand(this);
                    await command.initialize();
                    this.commands.set(command.name, command);
                } catch (err) {
                    this.client.logger.error(err);
                    console.error(chalk.red("Commander (ERROR) >> Error Registering Global Command"));
                    console.error(err);
                }
            }
        }
    }

    async initializeReservedCommands() {
        if (reservedCommands.length) {
            for (const GuildCommand of reservedCommands) {
                try {
                    const command = new GuildCommand(this);
                    if (!command.guilds) this.client.logger.warn(`Commander >> Guild Not Set For Guild Command: ${command.name}`);
                    await command.initialize();

                    this.commands.set(command.name, command);
                } catch (err) {
                    this.client.logger.error(err);
                    console.error(chalk.red("Commander (ERROR) >> Error Registering Guild Command"));
                    console.error(err);
                }
            }
        }
    }

    async registerGlobalCommands() {
        try {
            let commands = [];

            for (const [_, command] of this.global) {
                if (!command.data || command.disabled || command.hidden) continue;

                if (command.aliases) {
                    for (const alias of command.aliases) {
                        let data = command.data().setName(alias);
                        commands.push(data);
                    }
                }

                commands.push(command.data().toJSON());
            }

            const res: any = await this.rest.put(Routes.applicationCommands(process.env.BOT_APP_ID!), { body: commands });
            console.log(chalk.greenBright(`Commander >> Successfully Registered ${res.length} Global Command(s).`));
        } catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("Commander (ERROR) >> Error Registering Global Slash Commands"));
            console.error(err);
        }
    }

    async registerGuildCommands() {
        for (const [k, g] of this.guilds) {
            let commands = [];

            if (!g.commands) continue;

            for (const [_, command] of g.commands) {
                if (!command.data || command.disabled || command.hidden) continue;

                if (command.aliases) {
                    for (const alias of command.aliases) {
                        let data = command.data().setName(alias);
                        commands.push(data);
                    }
                }

                commands.push(command.data().toJSON());
            }

            try {
                const res: any = await this.rest.put(Routes.applicationGuildCommands(process.env.BOT_APP_ID!, k), { body: commands });
                console.log(chalk.greenBright(`Commander >> Successfully Registered ${res.length} Guild Command(s) For Guild: ${k}`));
            } catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red(`Commander (ERROR) >> Error Registering Guild Slash Commands For Guild: ${k}`));
                console.error(err);
            }
        }

        console.log(chalk.greenBright("Commander >> Successfully Registered All Guild Commands."));
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
