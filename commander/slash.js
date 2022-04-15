const Discord = require('discord.js');
const Commander = require('./commander');
const { failEmbed } = require('@utils/other/embeds');
// -----------------------------------

class SlashCommander {
    constructor(client, commander) {
        this.client = client;
        this.commander = commander;

        this.global = new Discord.Collection();
        this.guilds = new Discord.Collection();

        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            await interaction.deferReply();

            const command = this.commands.get(interaction.commandName) || this.commands.get(this.aliases.get(interaction.commandName));
            if (!command || command.disabled) {
                let notFound = failEmbed('This command has been disabled or removed!', interaction.user);
                return interaction.editReply({ embeds: [notFound] });
            }

            if (!this.authenticate(interaction, command)) return;
            
            let cooldown = command.parent.getCooldown(interaction.guild, interaction.user);
            if (cooldown) {
                let wait = failEmbed(`Please wait \`${cooldown}\` seconds before using that command again!`, interaction.user)
                return interaction.editReply({ embeds: [wait] })
            }

            try {
                command.run(this.client, interaction);
            } catch (err) {
                Commander.handleError(this.client, err, false, msg.guild, msg);
                console.error('SlashCommander (ERROR) >> Error Running Slash Command'.red);
            }
        })
    }

    static initialize(client, commander) {
        try {
            let slashCommander = new SlashCommander(client, commander);
            slashCommander.registerCommands();
            console.log('>>> SlashCommander Initialized'.brightGreen.bold.underline);

            return slashCommander;
        } catch (err) {
            Commander.handleError(client, err, true);
            console.error('SlashCommander (ERROR) >> Error Initializing'.red);
            console.error(err);
        }
    }

    registerCommands() {
        this.commands = new Discord.Collection();
        this.aliases = new Discord.Collection();

        for (const [key, value] of this.commander.commands) {
            if (value.group && value.group == 'CLI') continue;

            let command = new SlashCommand(value, this);

            this.commands.set(key, command);
        }
    }

    async updateCommands() {
        try {
            let commands = [];

            for (const [_, command] of this.global) {
                if (!command.data || command.disabled || command.hidden) continue;

                if (command.aliases) {
                    for (const alias in command.aliases) {
                        if (command.aliases[alias]) {
                            let data = command.data().setName(alias);
                            commands.push(data);
                        }
                    }
                }

                commands.push(command.data().toJSON());
            }

            if (commands.length) await this.client.application.commands.set(commands);
            console.log('SlashCommander >> Successfully Registered Global Commands.'.brightGreen);
        } catch (err) {
            Commander.handleError(this.client, err, false);
            console.error('SlashCommander (ERROR) >> Error Registering Global Slash Commands'.red);
            console.error(err.stack);
        }

        try {
            for (const [k, g] of this.guilds) {
                let commands = [];

                for (const [_, command] of g.commands) {
                    if (!command.data || command.disabled || command.hidden) continue;

                    if (command.aliases) {
                        for (const alias in command.aliases) {
                            if (command.aliases[alias]) {
                                let data = command.data().setName(alias);
                                commands.push(data);
                            }
                        }
                    }

                    commands.push(command.data().toJSON());
                }

                const guild = this.client.guilds.cache.get(k);
                if (commands.length && guild) await guild.commands.set(commands).catch(err => {
                    console.error(`SlashCommander (ERROR) >> Error Registering Guild Slash Commands For: ${guild.id}`.red);
                    console.error(err);
                });
            }
            console.log('SlashCommander >> Successfully Registered Guild Commands.'.brightGreen);
        } catch (err) {
            Commander.handleError(this.client, err, false);
            console.error('SlashCommander (ERROR) >> Error Registering Guild Slash Commands'.red);
            console.error(err);
        }
    }

    authenticate(interaction, command) {
        if (command.users && !command.users.includes(interaction.user.id)) {
            let notAllowed = failEmbed('You are not allowed to use this command!', interaction.user);
            interaction.editReply({ embeds: [notAllowed] });
            return false;
        }

        if (command.guildOnly && !interaction.inGuild()) {
            let notGuild = failEmbed('This command can not be used in DMs!', msg.author);
            interaction.editReply({ embeds: [notGuild] });
            return false;
        }

        return true;
    }
}

class SlashCommand {
    constructor(parent, commander) {
        this.parent = parent;

        for (const key in parent) this[key] = parent[key];

        this.commander = commander;

        if (this.aliases) {
            for (const alias in this.aliases) {
                this.commander.aliases.set(alias, this.name);
            }
        }

        if (this.guilds) {
            for (const guildId of this.guilds) {
                let guild = this.commander.guilds.get(guildId) || {};
                guild.commands = guild.commands || new Discord.Collection();
                guild.commands.set(this.name, this);

                this.commander.guilds.set(guildId, guild);
            }
        } else {
            this.commander.global.set(this.name, this);
        }
    }
}

module.exports = SlashCommander;