// This is the command handler, CODENAME: Commander v6.2.0

const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const ActionEmbed = require('@utils/embeds/action');

const CommanderCommand = require('@commander/command');
const CommanderModule = require('@commander/module');

// -----------------------------------
const perms = [ // 137476033600
    // GENERAL
    Discord.PermissionFlagsBits.ViewChannel,
    // TEXT
    Discord.PermissionFlagsBits.SendMessages,
    Discord.PermissionFlagsBits.EmbedLinks,
    Discord.PermissionFlagsBits.AttachFiles,
    Discord.PermissionFlagsBits.ReadMessageHistory,
    Discord.PermissionFlagsBits.UseExternalEmojis,
    Discord.PermissionFlagsBits.UseExternalStickers,
    Discord.PermissionFlagsBits.AddReactions,
    // VOICE
    Discord.PermissionFlagsBits.Connect,
    Discord.PermissionFlagsBits.Speak,
    Discord.PermissionFlagsBits.UseVAD
];

class Commander {
    constructor(client) {
        this.client = client;
        this.prefix = client.prefix;
        this.readline = readline.createInterface(process.stdin);

        this.cli = new Discord.Collection();
        this.global = new Discord.Collection();
        this.guilds = new Discord.Collection();

        this.rest = new Discord.REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

        // Commands
        this.commands = new Discord.Collection();
        this.aliases = new Discord.Collection();
        this.cooldowns = new Discord.Collection();
        this.groups = new Discord.Collection();

        // Music
        this.client.subscriptions = this.client.subscriptions || new Discord.Collection();

        // Guilds
        this.client.linkSessions = this.client.linkSessions || new Discord.Collection();

        // Colors
        this.client.colors = this.client.colors || new Discord.Collection();

        // CLI Commands
        this.readline.on('line', async line => {
            if (!line.startsWith('>')) return;

            const content = line.slice(1).trim().split(/ +/);
            const commandText = content.shift().toLowerCase();
            const args = content.join(' ');

            const command = this.cli.get(commandText) || this.cli.get(this.aliases.get(commandText));
            if (!command || command.disabled) return;

            try {
                await command.run(this.client, args);
                // Breakline
                console.log('');
            } catch (err) {
                console.error('Commander (ERROR) >> Error Running CLI Command'.red);
                console.error(err);
                Commander.handleError(this.client, err);
            }
        });

        // Discord Commands
        this.client.on('interactionCreate', async interaction => {
            if (interaction.type !== Discord.InteractionType.ApplicationCommand) return;

            await interaction.deferReply();

            const command = this.commands.get(interaction.commandName) || this.commands.get(this.aliases.get(interaction.commandName));

            if (!command || command.disabled) return interaction.editReply({ embeds: [new ActionEmbed('fail', 'This command has been disabled or removed!', interaction.user)] });

            if (!this.authenticate(interaction, command)) return;

            try {
                await command.run(this.client, interaction);
            } catch (err) {
                console.error('Commander (ERROR) >> Error Running Slash Command'.red);
                console.error(err);
                Commander.handleError(this.client, err, false, interaction.guild);
            }
        });
    }

    static async initialize(client) {
        try {
            let commander = new Commander(client);
            await commander.registerCLICommands();
            await commander.registerGlobalCommands();
            await commander.registerGuildCommands();
            await commander.registerModules();
            console.log('>>> Commander Initialized'.brightGreen.bold.underline);

            return commander;
        } catch (err) {
            console.error('Commander (ERROR) >> Error Initializing'.red);
            console.error(err);
            Commander.handleError(client, err, true);
        }
    }

    async registerCLICommands() {
        const cliPath = path.join(__dirname, '../commands', 'CLI');
        const cliFiles = fs.existsSync(cliPath) ? fs.readdirSync(cliPath).filter(file => file.endsWith('.js')) : [];

        if (cliFiles.length) {
            for (const file of cliFiles) {
                try {
                    delete require.cache[require.resolve(`${cliPath}/${file}`)];

                    const object = require(`${cliPath}/${file}`);
                    const command = new CommanderCommand(this, object);
                    await command.initialize();

                    this.cli.set(command.name, command);
                } catch (err) {
                    console.error('Commander (ERROR) >> Error Registering CLI Command'.red);
                    console.error(err);
                    Commander.handleError(this.client, err);
                }
            }
        }
    }

    async registerGlobalCommands() {
        const globalPath = path.join(__dirname, '../commands', 'Global');
        const globalFolders = fs.existsSync(globalPath) ? fs.readdirSync(globalPath) : [];

        if (globalFolders.length) {
            for (const folder of globalFolders) {
                const globalFiles = fs.readdirSync(`${globalPath}/${folder}`).filter(file => file.endsWith('.js'));

                for (const file of globalFiles) {
                    try {
                        delete require.cache[require.resolve(`${globalPath}/${folder}/${file}`)];

                        const object = require(`${globalPath}/${folder}/${file}`);
                        const command = new CommanderCommand(this, object);
                        await command.initialize();

                        this.commands.set(command.name, command);
                    } catch (err) {
                        console.error('Commander (ERROR) >> Error Registering Global Command'.red);
                        console.error(err);
                        Commander.handleError(this.client, err);
                    }
                }
            }
        }
    }

    async registerGuildCommands() {
        const guildPath = path.join(__dirname, '../commands', 'Guild');
        const guildFolders = fs.existsSync(guildPath) ? fs.readdirSync(guildPath) : [];

        if (guildFolders.length) {
            for (const folder of guildFolders) {
                const guildSubFolders = fs.readdirSync(`${guildPath}/${folder}`);

                for (const subFolder of guildSubFolders) {
                    const guildFiles = fs.readdirSync(`${guildPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));

                    for (const file of guildFiles) {
                        try {
                            delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)];

                            const object = require(`${guildPath}/${folder}/${subFolder}/${file}`);
                            const command = new CommanderCommand(this, object);
                            if (!command.guilds) console.warn(`Commander (WARNING) >> Guild Not Set For Guild Command: ${command.name}`.yellow);
                            await command.initialize();

                            this.commands.set(command.name, command);
                        } catch (err) {
                            console.error('Commander (ERROR) >> Error Registering Guild Command'.red);
                            console.error(err);
                            Commander.handleError(this.client, err);
                        }
                    }
                }
            }
        }
    }

    async updateCommands() {
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

            const res = await this.rest.put(Discord.Routes.applicationCommands(process.env.BOT_APP_ID), { body: commands });

            console.log(`Commander >> Successfully Registered ${res.length} Global Command(s).`.brightGreen);
        } catch (err) {
            console.error('Commander (ERROR) >> Error Registering Global Slash Commands'.red);
            console.error(err);
            Commander.handleError(this.client, err);
        }

        try {
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

                if (!this.client.guilds.cache.has(k)) continue;

                try {
                    const res = await this.rest.put(Discord.Routes.applicationGuildCommands(process.env.BOT_APP_ID, k), { body: commands });
                    console.log(`Commander >> Successfully Registered ${res.length} Guild Command(s) For Guild: ${k}`.brightGreen);
                } catch (err) {
                    console.error(`Commander (ERROR) >> Error Registering Guild Slash Commands For Guild: ${k}`.red);
                    console.error(err);
                    Commander.handleError(this.client, err);
                }
            }
            console.log('Commander >> Successfully Registered All Guild Commands.'.brightGreen);
        } catch (err) {
            console.error('Commander (ERROR) >> Error Registering Guild Slash Commands'.red);
            console.error(err);
            Commander.handleError(this.client, err);
        }
    }

    async registerModules() {
        const globalPath = path.join(__dirname, '../modules', 'Global');
        const guildPath = path.join(__dirname, '../modules', 'Guild');
        const globalFolders = fs.existsSync(globalPath) ? fs.readdirSync(globalPath) : [];
        const guildFolders = fs.existsSync(guildPath) ? fs.readdirSync(guildPath) : [];

        this.modules = new Discord.Collection();

        if (globalFolders.length) {
            for (const folder of globalFolders) {
                const globalFiles = fs.readdirSync(`${globalPath}/${folder}`).filter(file => file.endsWith('.js'));

                for (const file of globalFiles) {
                    delete require.cache[require.resolve(`${globalPath}/${folder}/${file}`)];

                    const object = require(`${globalPath}/${folder}/${file}`);
                    const module = new CommanderModule(object, this);

                    await module.initialize(this.client);

                    this.modules.set(module.name, module);
                }
            }
        }

        if (guildFolders.length) {
            for (const folder of guildFolders) {
                const guildSubFolders = fs.readdirSync(`${guildPath}/${folder}`);

                for (const subFolder of guildSubFolders) {
                    const guildFiles = fs.readdirSync(`${guildPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));

                    for (const file of guildFiles) {
                        delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)];

                        const object = require(`${guildPath}/${folder}/${subFolder}/${file}`);
                        const module = new CommanderModule(object, this);
                        if (!module.guilds || !module.guilds.includes(folder)) console.warn(`Commander (WARNING) >> Guild Not Set For Guild Module: ${module.name}`.yellow);

                        module.initialize(this.client);

                        this.modules.set(module.name, module);
                    }
                }
            }
        }
    }

    authenticate(interaction, command) {
        if (command.users && !command.users.includes(interaction.user.id)) {
            interaction.editReply({ embeds: [new ActionEmbed('fail', 'You are not allowed to use this command!', interaction.user)] });
            return false;
        }

        if (command.guildOnly && !interaction.inGuild()) {
            interaction.editReply({ embeds: [new ActionEmbed('fail', 'This command can not be used in DMs!', interaction.user)] });
            return false;
        }

        if (command.cooldown && command.cooldowns) {
            const context = interaction.guild?.id || 'dm';

            if (command.cooldowns.has(context) && command.cooldowns.get(context).has(interaction.user.id)) {
                const cooldown = command.cooldowns.get(context).get(interaction.user.id);
                const secondsLeft = (cooldown - Date.now()) / 1000;

                interaction.editReply({ embeds: [new ActionEmbed('fail', `Please wait \`${secondsLeft.toFixed(1)}\` seconds before using that command again!`, interaction.user)] });
                return false;
            }

            command.applyCooldown(interaction.guild, interaction.user);
        }

        return true;
    }

    // Error Handling

    static async handleError(client, err, quit, guild) {
        let dev = client ? await client.users.fetch(client.dev).catch(() => { return; }) : null;
        let code = Date.now();

        let errorObject = {
            errorName: err.name,
            errorMessage: err.message,
            errorStack: err.stack,
            guild: guild ? guild : "N/A",
        };

        fs.appendFile('./error.log', `${code}: ${JSON.stringify(errorObject)}\n`, async (err) => {
            if (err) throw err;

            if (dev) {
                let embed = new Discord.EmbedBuilder()
                    .setColor('#F04947')
                    .setTitle('Uh Oh!')
                    .setDescription(`A critical error in the internal code has occured.`)
                    .addFields([{ name: 'Error Code', value: `\`${code}\``, inline: true }])
                    .setThumbnail('https://icon-library.com/images/image-error-icon/image-error-icon-17.jpg');

                if (guild) {
                    embed.addFields([
                        { name: 'Guild', value: `\`${guild ? guild.name : 'N/A'}\`` },
                        { name: 'Guild ID', value: `\`${guild ? guild.id : 'N/A'}\``, inline: true },
                        { name: 'Guild Owner ID', value: `\`${guild ? guild.ownerId : 'N/A'}\``, inline: true }
                    ]);
                }

                await dev.send({ embeds: [embed] }).catch(() => { return; });
            }

            console.error('Commander (ERROR) >> Error! Logged to file!'.red);
            console.error(errorObject.errorStack);
            if (quit) process.exit();
        });
    }
}

module.exports = Commander;