// ----- FOR LATER USE -----
// import readline, { Interface } from "readline";
import { REST, Routes, ChatInputCommandInteraction, Collection } from "discord.js";
import { Module } from "./Module.js";
import { ProcessEvent } from "./Event.js";
import { ActionEmbed } from "../utils/embeds/index.js";
import chalk from "chalk";
// -----------------------------------
import * as Commands from "../commands/index.js";
import * as Events from "../events/index.js";
import * as Modules from "../modules/index.js";
// -----------------------------------
const commands = [
    Commands.PlayCommand,
    Commands.StopCommand,
    Commands.PauseCommand,
    Commands.SkipCommand,
    Commands.LoopCommand,
    Commands.QueueCommand,
    Commands.LyricsCommand,
    Commands.HelpCommand,
    Commands.AffiliateCommand,
];
export class Commander {
    client;
    // ----- FOR LATER USE -----
    // private readline: Interface = readline.createInterface(process.stdin);
    rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
    cli = new Collection();
    groups = new Collection();
    commands = new Collection();
    global = new Collection();
    reserved = new Collection();
    modules = new Collection();
    aliases = new Collection();
    constructor(client) {
        this.client = client;
    }
    async initialize() {
        this.initializeCLICommands();
        this.initializeCommands();
        this.initializeModules();
        await this.registerGlobalCommands();
        await this.registerReservedCommands();
        this.intiliazeEvents();
    }
    initializeCLICommands() {
        const commands = [];
        if (!commands.length)
            return;
        for (const Command of commands) {
            try {
                const command = new Command(this);
                command.initialize();
                this.cli.set(command.name, command);
            }
            catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Commander (ERROR) >> Error Initializing CLI Command"));
                console.error(err);
            }
        }
        this.client.logger.info(`Commander >> Successfully Initialized ${commands.length} CLI Command(s)`);
    }
    initializeCommands() {
        if (!commands.length)
            return;
        for (const Command of commands) {
            try {
                const command = new Command(this.client, this);
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        this.aliases.set(alias, command.name);
                    }
                }
                if (command.legacyAliases) {
                    for (const alias of command.legacyAliases) {
                        this.aliases.set(alias, command.name);
                    }
                }
                if (command.users)
                    command.users.push(this.client.devId);
                if (!this.groups.has(command.group))
                    this.groups.set(command.group, new Collection());
                this.groups.get(command.group)?.set(command.name, command);
                this.commands.set(command.name, command);
            }
            catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Commander (ERROR) >> Error Initializing Global Command"));
                console.error(err);
            }
        }
        this.client.logger.info(`Commander >> Successfully Initialized ${commands.length} Command(s)`);
    }
    intiliazeEvents() {
        const events = Object.values(Events);
        if (!events.length)
            return;
        for (const Event of events) {
            try {
                // Change this in the future please
                if (Event.prototype instanceof ProcessEvent) {
                    const event = new Event(this.client, this);
                    process.on(event.name, event.execute.bind(event));
                }
                else {
                    const event = new Event(this.client, this);
                    this.client.on(event.name, event.execute.bind(event));
                }
            }
            catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Commander (ERROR) >> Error Initializing Event"));
                console.error(err);
            }
        }
        this.client.logger.info(`Commander >> Successfully Initialized ${events.length} Event(s)`);
    }
    async initializeModules() {
        const modules = Object.values(Modules);
        if (!modules.length)
            return;
        for (const Module of modules) {
            try {
                const module = new Module(this.client, this);
                this.modules.set(module.name, module);
            }
            catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Commander (ERROR) >> Error Initializing Guild Command"));
                console.error(err);
            }
        }
        for (const command of this.commands.values()) {
            // In future, modules will always be required
            if (command.module && typeof command.module == "string")
                command.module = this.modules.get(command.module);
            if (command.module instanceof Module && command.module.guilds) {
                for (const guild of command.module.guilds) {
                    const commands = this.reserved.get(guild) || new Collection();
                    commands.set(command.name, command);
                    this.reserved.set(guild, commands);
                }
            }
            else {
                this.global.set(command.name, command);
            }
            this.commands.set(command.name, command);
        }
        this.client.logger.info(`Commander >> Successfully Initialized ${modules.length} Module(s)`);
    }
    async registerGlobalCommands() {
        try {
            let body = [];
            for (const command of this.global.values()) {
                if (!command.data || command.disabled || command.hidden)
                    continue;
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        const data = command.data().setName(alias);
                        body.push(data);
                    }
                }
                body.push(command.data().toJSON());
            }
            const res = await this.rest.put(Routes.applicationCommands(process.env.DISCORD_APP_ID), { body: body });
            this.client.logger.info(`Commander >> Successfully Registered ${res.length} Global Command(s)`);
        }
        catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("Commander (ERROR) >> Error Registering Global Slash Commands"));
            console.error(err);
        }
    }
    async registerReservedCommands() {
        for (const [guild, commands] of this.reserved) {
            let body = [];
            for (const command of commands.values()) {
                if (!command.data || command.disabled || command.hidden)
                    continue;
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        const data = command.data().setName(alias);
                        body.push(data);
                    }
                }
                body.push(command.data().toJSON());
            }
            try {
                const res = await this.rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APP_ID, guild), { body: body });
                this.client.logger.info(`Commander >> Successfully Registered ${res.length} Guild Command(s) For Guild: ${guild}`);
            }
            catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red(`Commander (ERROR) >> Error Registering Guild Slash Commands For Guild: ${guild}`));
                console.error(err);
            }
        }
        this.client.logger.info("Commander >> Successfully Registered All Guild Commands");
    }
    validate(interaction, command) {
        const author = interaction instanceof ChatInputCommandInteraction ? interaction.user : interaction.author;
        if (command.users && !command.users.includes(author.id)) {
            command.reply(interaction, { embeds: [new ActionEmbed("fail").setDesc("You are not allowed to use this command!")] });
            return false;
        }
        if (command.cooldown && command.cooldowns) {
            if (command.cooldowns.has(author.id)) {
                const cooldown = command.cooldowns.get(author.id);
                const secondsLeft = (cooldown - Date.now()) / 1000;
                command.reply(interaction, { embeds: [new ActionEmbed("fail").setDesc(`Please wait \`${secondsLeft.toFixed(1)}\` seconds before using that command again!`)] });
                return false;
            }
        }
        return true;
    }
}
