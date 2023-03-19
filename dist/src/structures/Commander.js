import readline from "readline";
import { REST, Routes, Events, InteractionType, Collection } from "discord.js";
import { ActionEmbed, ErrorEmbed } from "../utils/embeds/index.js";
import chalk from "chalk";
// -----------------------------------
import { PlayCommand, HelpCommand, StopCommand, PauseCommand, SkipCommand, QueueCommand, LyricsCommand, } from "../commands/global/index.js";
const cliCommands = [];
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
const guildCommands = [];
// -----------------------------------
export class Commander {
    client;
    readline = readline.createInterface(process.stdin);
    rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
    cli = new Collection();
    global = new Collection();
    guilds = new Collection();
    groups = new Collection();
    commands = new Collection();
    modules = new Collection();
    aliases = new Collection();
    constructor(client) {
        this.client = client;
        this.client = client;
        // CLI Commands
        this.readline.on("line", async (line) => {
            if (!line.startsWith(">"))
                return;
            const content = line.slice(1).trim().split(/ +/);
            const commandText = content.shift()?.toLowerCase();
            const args = content.join(" ");
            const command = this.cli.get(commandText) || this.cli.get(this.aliases.get(commandText));
            if (!command || command.disabled)
                return;
            try {
                await command.execute(this.client, args);
                // Breakline
                console.log("");
            }
            catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Commander (ERROR) >> Error Running CLI Command"));
                console.error(err);
            }
        });
        // Slash Commands
        this.client.on(Events.InteractionCreate, async (interaction) => {
            if (interaction.type !== InteractionType.ApplicationCommand)
                return;
            const command = this.commands.get(interaction.commandName) || this.commands.get(this.aliases.get(interaction.commandName));
            if (!command || command.disabled)
                return;
            await interaction.deferReply({ ephemeral: command.ephemeral });
            if (!this.validate(interaction, command))
                return;
            try {
                await command.execute(this.client, interaction);
            }
            catch (err) {
                const eventId = this.client.logger.error(err);
                console.error(chalk.red("Commander (ERROR) >> Error Running Slash Command"));
                console.error(err);
                interaction.editReply({ embeds: [new ErrorEmbed(eventId)] });
            }
        });
    }
    // static async initialize(client: KATClient) {
    //     try {
    //         const commander = new Commander(client);
    //         await commander.initializeCLICommands();
    //         await commander.initializeGlobalCommands();
    //         await commander.initializeGuildCommands();
    //         // await commander.initializeModules();
    //         console.log(chalk.greenBright.bold.underline(">>> Commander Initialized"));
    //         return commander;
    //     } catch (err) {
    //         console.error(chalk.red("Commander (ERROR) >> Error Initializing"));
    //         console.error(err);
    //         client.logger.fatal(err);
    //     }
    // }
    validate(interaction, command) {
        if (command.users && !command.users.includes(interaction.user.id)) {
            interaction.editReply({ embeds: [new ActionEmbed("fail", "You are not allowed to use this command!", interaction.user)] });
            return false;
        }
        if (command.cooldown && command.cooldowns) {
            const context = interaction.guild?.id || "dm";
            if (command.cooldowns.has(context) && command.cooldowns.get(context).has(interaction.user.id)) {
                const cooldown = command.cooldowns.get(context).get(interaction.user.id);
                const secondsLeft = (cooldown - Date.now()) / 1000;
                interaction.editReply({ embeds: [new ActionEmbed("fail", `Please wait \`${secondsLeft.toFixed(1)}\` seconds before using that command again!`, interaction.user)] });
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
                }
                catch (err) {
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
                }
                catch (err) {
                    this.client.logger.error(err);
                    console.error(chalk.red("Commander (ERROR) >> Error Registering Global Command"));
                    console.error(err);
                }
            }
        }
    }
    async initializeGuildCommands() {
        if (guildCommands.length) {
            for (const GuildCommand of guildCommands) {
                try {
                    const command = new GuildCommand(this);
                    if (!command.guilds)
                        this.client.logger.warn(`Commander >> Guild Not Set For Guild Command: ${command.name}`);
                    await command.initialize();
                    this.commands.set(command.name, command);
                }
                catch (err) {
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
                if (!command.data || command.disabled || command.hidden)
                    continue;
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        let data = command.data().setName(alias);
                        commands.push(data);
                    }
                }
                commands.push(command.data().toJSON());
            }
            const res = await this.rest.put(Routes.applicationCommands(process.env.BOT_APP_ID), { body: commands });
            console.log(chalk.greenBright(`Commander >> Successfully Registered ${res.length} Global Command(s).`));
        }
        catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("Commander (ERROR) >> Error Registering Global Slash Commands"));
            console.error(err);
        }
    }
    async registerGuildCommands() {
        try {
            for (const [k, g] of this.guilds) {
                let commands = [];
                if (!g.commands)
                    continue;
                for (const [_, command] of g.commands) {
                    if (!command.data || command.disabled || command.hidden)
                        continue;
                    if (command.aliases) {
                        for (const alias of command.aliases) {
                            let data = command.data().setName(alias);
                            commands.push(data);
                        }
                    }
                    commands.push(command.data().toJSON());
                }
                if (!this.client.guilds.cache.has(k))
                    continue;
                try {
                    const res = await this.rest.put(Routes.applicationGuildCommands(process.env.BOT_APP_ID, k), { body: commands });
                    console.log(chalk.greenBright(`Commander >> Successfully Registered ${res.length} Guild Command(s) For Guild: ${k}`));
                }
                catch (err) {
                    this.client.logger.error(err);
                    console.error(chalk.red(`Commander (ERROR) >> Error Registering Guild Slash Commands For Guild: ${k}`));
                    console.error(err);
                }
            }
            console.log(chalk.greenBright("Commander >> Successfully Registered All Guild Commands."));
        }
        catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("Commander (ERROR) >> Error Registering Guild Slash Commands"));
            console.error(err);
        }
    }
}
