import { KATClient as Client } from '../Client.js';

// ----- FOR LATER USE -----
import { Events as DiscordEvents, REST, Routes, ChatInputCommandInteraction, Message, Collection, Snowflake, PermissionFlagsBits } from 'discord.js';
import { Command } from './Command.js';
import { Module } from './Module.js';
import { ActionEmbed } from '@utils/embeds/index.js';
import { PermissionPrompts } from 'enums.js';

// -----------------------------------
import * as Commands from '@commands/index.js';
import * as Events from '@events/index.js';
import * as Modules from '@modules/index.js';
// -----------------------------------

const commands = [
    // Music
    Commands.PlayCommand,
    Commands.LoopCommand,
    Commands.StopCommand,
    Commands.PauseCommand,
    Commands.SkipCommand,
    Commands.QueueCommand,
    Commands.VolumeCommand,
    Commands.LyricsCommand,
    // Misc
    Commands.PrefixCommand,
    Commands.HelpCommand,
    Commands.StatsCommand,
    // Reserved
    Commands.AffiliateCommand,
];

export class Commander {
    public commands = new Collection<string, Command<true>>();
    public global = new Collection<string, Command<true>>();
    public reserved = new Collection<Snowflake, Collection<string, Command<true>>>();
    public modules = new Collection<string, Module>();
    public aliases = new Collection<string, string>();

    private rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    constructor(public readonly client: Client) {}

    async initialize() {
        this.initializeModules();
        this.initializeCommands();

        if (process.argv.includes('--register')) {
            this.client.logger.info('Registering Commands...', 'Commander');
            await this.registerGlobalCommands();
            await this.registerReservedCommands();
            this.client.logger.info('Commands Registered!', 'Commander');
        }

        this.intiliazeEvents();
    }

    authorize(interaction: ChatInputCommandInteraction | Message, command: Command<true>) {
        const author = command.getAuthor(interaction);

        if (interaction.inGuild()) {
            if (command.module.guilds && !command.module.guilds.includes(interaction.guild!.id)) return false;
            if (!interaction.channel?.permissionsFor(interaction.guild!.members.me!).has(PermissionFlagsBits.SendMessages)) {
                if (!command.hidden)
                    author
                        .send({
                            embeds: [new ActionEmbed('fail').setText(PermissionPrompts.CannotSend)],
                        })
                        .catch((err) => {
                            this.client.logger.error(err, 'Error Sending Permissions Prompt', 'Commander');
                        });
                return false;
            }
        } else if (!command.allowDM) {
            return false;
        }

        if (command.users && !command.users.includes(author.id)) {
            if (!command.hidden)
                command
                    .reply(interaction, {
                        embeds: [new ActionEmbed('fail').setText(PermissionPrompts.NotAllowed)],
                    })
                    .catch((err) => {
                        this.client.logger.error(err, 'Error Sending Permissions Prompt', 'Commander');
                    });
            return false;
        }

        if (command.cooldown && command.cooldowns) {
            if (command.cooldowns.has(author.id)) {
                const cooldown = command.cooldowns.get(author.id)!;
                const secondsLeft = (cooldown - Date.now()) / 1000;
                command
                    .reply(interaction, {
                        embeds: [
                            new ActionEmbed('fail').setText(`Please wait \`${secondsLeft.toFixed(1)}\` seconds before using that command again!`),
                        ],
                    })
                    .catch((err) => {
                        this.client.logger.error(err, 'Error Sending Cooldown Prompt', 'Commander');
                    });
                return false;
            }
        }

        return true;
    }

    private initializeModules() {
        const modules = Object.values(Modules);

        for (const Module of modules) {
            try {
                const module = new Module(this.client, this);
                this.modules.set(module.name, module);
            } catch (err) {
                this.client.logger.error(err, 'Error Initializing Module', 'Commander');
            }
        }

        this.client.emit(DiscordEvents.Debug, `Commander >> Successfully Initialized ${modules.length} Module(s)`);
    }

    private initializeCommands() {
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

                if (command.users) command.users.push(this.client.devId);

                command.module = this.modules.get(command.module as string) ?? new Module(this.client, this, { name: command.module as string });
                if (!this.modules.has(command.module.name)) this.modules.set(command.module.name, command.module);

                const loaded = command as Command<true>;

                command.module.commands.set(command.name, loaded);

                // Remove reserved in the future and use modules directly for registering
                if (command.module.guilds) {
                    for (const guild of command.module.guilds) {
                        const commands = this.reserved.get(guild) || new Collection();
                        commands.set(command.name, loaded);
                        this.reserved.set(guild, commands);
                    }
                } else {
                    this.global.set(command.name, loaded);
                }

                this.commands.set(command.name, loaded);
            } catch (err) {
                this.client.logger.error(err, 'Error Initializing Global Command', 'Commander');
            }
        }

        this.client.emit(DiscordEvents.Debug, `Commander >> Successfully Initialized ${commands.length} Command(s)`);
    }

    private intiliazeEvents() {
        const events = Object.values(Events);

        for (const Event of events) {
            try {
                const event = new Event(this.client, this);
                this.client.on(event.name, event.execute.bind(event));
            } catch (err) {
                this.client.logger.error(err, 'Error Initializing Event', 'Commander');
            }
        }

        this.client.emit(DiscordEvents.Debug, `Commander >> Successfully Initialized ${events.length} Event(s)`);
    }

    private async registerGlobalCommands() {
        try {
            let body = [];

            for (const command of this.global.values()) {
                if (command.disabled || command.hidden) continue;
                
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        const data = command.data().setName(alias);
                        body.push(data);
                    }
                }

                body.push(command.data().toJSON());
            }

            const res: any = await this.rest.put(Routes.applicationCommands(process.env.DISCORD_APP_ID!), {
                body: body,
            });
            this.client.emit(DiscordEvents.Debug, `Commander >> Successfully Registered ${res.length} Global Command(s)`);
        } catch (err) {
            this.client.logger.error(err, 'Error Registering Global Slash Commands', 'Commander');
        }
    }

    private async registerReservedCommands() {
        for (const [guildId, commands] of this.reserved) {
            if (!this.client.guilds.cache.has(guildId)) continue;

            let body = [];

            for (const command of commands.values()) {
                if (command.disabled || command.hidden) continue;

                if (command.aliases) {
                    for (const alias of command.aliases) {
                        const data = command.data().setName(alias);
                        body.push(data);
                    }
                }

                body.push(command.data().toJSON());
            }

            try {
                const res: any = await this.rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APP_ID!, guildId), {
                    body: body,
                });
                this.client.emit(DiscordEvents.Debug, `Commander >> Successfully Registered ${res.length} Guild Command(s) For Guild: ${guildId}`);
            } catch (err) {
                this.client.logger.error(err, `Error Registering Guild Slash Commands For Guild: ${guildId}`, 'Commander');
            }
        }

        this.client.emit(DiscordEvents.Debug, 'Commander >> Successfully Registered All Guild Commands');
    }
}
