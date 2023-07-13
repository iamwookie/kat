import { KATClient as Client } from '../Client.js';
import { Command as CommanderCommand } from './Command.js';
import { Module as CommanderModule } from './Module.js';
import {
    Events as DiscordEvents,
    REST,
    Routes,
    ChatInputCommandInteraction,
    Message,
    Collection,
    MessagePayload,
    MessageEditOptions,
    InteractionEditReplyOptions,
    MessageCreateOptions,
    EmojiIdentifierResolvable,
    User,
    MessageReaction,
} from 'discord.js';
import { ActionEmbed } from '@utils/embeds/index.js';
import { PermissionPrompts } from '@structures/interfaces/Enums.js';

// -----------------------------------
import * as Commands from '@commands/index.js';
import * as Events from '@events/index.js';
import * as Modules from '@modules/index.js';
// -----------------------------------

export class Commander {
    private rest: REST;

    public commands: Collection<string, CommanderCommand>;
    public modules: Collection<string, CommanderModule>;
    public aliases: Collection<string, string>;

    constructor(public client: Client) {
        this.rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
        this.commands = new Collection<string, CommanderCommand>();
        this.modules = new Collection<string, CommanderModule>();
        this.aliases = new Collection<string, string>();
    }

    public async initialize(): Promise<void> {
        this.initializeModules();
        this.initializeCommands();

        if (process.argv.includes('--register')) {
            this.client.logger.info('Registering Commands...', 'Commander');
            await this.registerCommands();
            this.client.logger.info('Commands Registered!', 'Commander');
        }

        this.intiliazeEvents();

        this.client.logger.status('>>>> Commander Initialized!');
    }

    public validate(interaction: ChatInputCommandInteraction | Message, command: CommanderCommand): boolean {
        const author = this.getAuthor(interaction);

        if (interaction.inGuild()) {
            if (interaction instanceof ChatInputCommandInteraction && !interaction.inCachedGuild()) return false;
            if (command.module.guilds && !command.module.guilds.includes(interaction.guild.id)) return false;
            if (!interaction.channel || !interaction.channel.permissionsFor(interaction.guild.members.me!).has(this.client.permissions.text)) {
                if (!command.hidden) {
                    const embed = new ActionEmbed('fail').setTitle('Uh Oh!').setText(PermissionPrompts.NotEnough);

                    // prettier-ignore
                    if (interaction instanceof ChatInputCommandInteraction) {
                        this.reply(interaction, { embeds: [embed] }).catch((err) => this.client.logger.error(err, 'Error Sending Permissions Reply', 'Commander'));
                    } else if (interaction instanceof Message) {
                        author.send({ embeds: [embed] }).catch((err) => this.client.logger.error(err, 'Error Sending Permissions Prompt', 'Commander'));
                    }
                }

                return false;
            }
        }

        if (command.cooldown && command.cooldowns) {
            if (command.cooldowns.has(author.id)) {
                const cooldown = command.cooldowns.get(author.id)!;
                const secondsLeft = (cooldown - Date.now()) / 1000;

                this.reply(interaction, {
                    embeds: [new ActionEmbed('fail').setText(`Please wait \`${secondsLeft.toFixed(1)}\` seconds before using that command again!`)],
                }).catch((err) => {
                    this.client.logger.error(err, 'Error Sending Cooldown Prompt', 'Commander');
                });

                return false;
            }
        }

        return true;
    }

    public authorize(interaction: ChatInputCommandInteraction | Message, command: CommanderCommand): boolean {
        const author = this.getAuthor(interaction);

        if (command.users && !command.users.includes(author.id)) {
            if (!command.hidden)
                this.reply(interaction, {
                    embeds: [new ActionEmbed('fail').setText(PermissionPrompts.NotAllowed)],
                }).catch((err) => {
                    this.client.logger.error(err, 'Error Sending Permissions Prompt', 'Commander');
                });

            return false;
        }

        return true;
    }

    public getAuthor(interaction: ChatInputCommandInteraction | Message): User {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.user;
        } else if (interaction instanceof Message) {
            return interaction.author;
        } else {
            throw new Error('Invalid interaction.');
        }
    }

    public getArgs(interaction: ChatInputCommandInteraction | Message): (string | undefined)[] {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.options.data.map((option) => (typeof option.value == 'string' ? option.value.split(/ +/) : option.options)).flat() as string[];
        } else if (interaction instanceof Message) {
            return interaction.content.split(/ +/).slice(1);
        } else {
            return [];
        }
    }

    public reply(
        interaction: ChatInputCommandInteraction | Message,
        content: string | MessagePayload | MessageCreateOptions | InteractionEditReplyOptions
    ): Promise<Message> {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.editReply(content as Exclude<typeof content, MessageCreateOptions>);
        } else if (interaction instanceof Message) {
            return interaction.channel.send(content as Exclude<typeof content, InteractionEditReplyOptions>);
        } else {
            throw new Error('Invalid interaction.');
        }
    }

    public edit(
        interaction: ChatInputCommandInteraction | Message,
        editable: Message,
        content: string | MessagePayload | MessageEditOptions | InteractionEditReplyOptions
    ): Promise<Message> {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.editReply(content as Exclude<typeof content, MessageEditOptions>);
        } else if (interaction instanceof Message) {
            return editable.edit(content as Exclude<typeof content, InteractionEditReplyOptions>);
        } else {
            throw new Error('Invalid interaction.');
        }
    }

    public react(interaction: ChatInputCommandInteraction | Message, emoji: string | EmojiIdentifierResolvable): Promise<Message | MessageReaction> {
        if (interaction instanceof ChatInputCommandInteraction) {
            return interaction.editReply({ content: emoji as Exclude<typeof emoji, EmojiIdentifierResolvable> });
        } else if (interaction instanceof Message) {
            return interaction.react(emoji);
        } else {
            throw new Error('Invalid interaction.');
        }
    }

    private initializeModules(): void {
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

    private initializeCommands(): void {
        const commands = Object.values(Commands);

        for (const Command of commands) {
            try {
                const command = new Command(this.client, this);

                if (command.aliases) for (const alias of command.aliases) this.aliases.set(alias, command.name);
                if (command.users) command.users = command.users.concat(this.client.config.devs);
                if (!this.modules.has(command.module.name)) this.modules.set(command.module.name, command.module);
                command.module.commands.set(command.name, command);

                this.commands.set(command.name, command);
            } catch (err) {
                this.client.logger.error(err, 'Error Initializing Global Command', 'Commander');
            }
        }

        this.client.emit(DiscordEvents.Debug, `Commander >> Successfully Initialized ${commands.length} Command(s)`);
    }

    private intiliazeEvents(): void {
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

    private async registerCommands(): Promise<void> {
        try {
            let body = [];

            for (const command of this.commands.values()) {
                if (command.disabled || command.hidden) continue;
                body.push(command.data().toJSON());
            }

            const res: any = await this.rest.put(Routes.applicationCommands(process.env.DISCORD_APP_ID), { body });
            this.client.emit(DiscordEvents.Debug, `Commander >> Successfully Registered ${res.length} Global Command(s)`);
        } catch (err) {
            this.client.logger.error(err, 'Error Registering Global Slash Commands', 'Commander');
        }
    }
}
