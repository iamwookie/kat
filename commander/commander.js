// This is the command handler, CODENAME: Commander v5.0.0

const Discord = require('discord.js');
const { youtube } = require('@root/config.json');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Player } = require('discord-player');
const { MusicEmbed, failEmbed } = require('@utils/other/embeds');

// -----------------------------------
const perms = [ // 137476000832
    // GENERAL
    Discord.Permissions.FLAGS.VIEW_CHANNEL,
    // TEXT
    Discord.Permissions.FLAGS.SEND_MESSAGES,
    Discord.Permissions.FLAGS.EMBED_LINKS,
    Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY,
    Discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
    Discord.Permissions.FLAGS.USE_EXTERNAL_STICKERS,
    Discord.Permissions.FLAGS.ADD_REACTIONS,
    // VOICE
    Discord.Permissions.FLAGS.CONNECT,
    Discord.Permissions.FLAGS.SPEAK,
    Discord.Permissions.FLAGS.USE_VAD
];

class Commander {
    constructor(client) {
        this.client = client;
        this.prefix = client.prefix;
        this.readline = readline.createInterface(process.stdin);
        
        this.global = new Discord.Collection();
        this.guilds = new Discord.Collection();

        // Music

        this.client.player = new Player(this.client, {
            ytdlOptions: {
                requestOptions: {
                    headers: {
                        cookie: youtube.cookie
                    }
                }
            }
        });

        this.client.player.on('botDisconnect', async queue => {
            try {
                let sub = this.client.subscriptions.get(queue.guild.id);
                if (sub) sub.destroy();
            } catch (err) {
                console.error('Music (ERROR) >> Error Destroying Subscription'.red);
                console.error(err);
            }
        });

        this.client.player.on('queueEnd', async queue => {
            try {
                let sub = this.client.subscriptions.get(queue.guild.id);
                if (sub) sub.destroy();
            } catch (err) {
                console.error('Music (ERROR) >> Error Destroying Subscription'.red);
                console.error(err);
            }
        });

        this.client.player.on('trackStart', async (queue, track) => {
            try {
                let sub = this.client.subscriptions.get(queue.guild.id);
                let onstart = new MusicEmbed(this.client, sub.interaction, 'playing', track);
                return sub.interaction.channel.send({ embeds: [onstart] });
            } catch (err) {
                console.error('Music (ERROR) >> Error Sending Track Start Message'.red);
                console.error(err);
            }
        });

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

            const command = this.groups.get('CLI').get(commandText) || this.groups.get('CLI').get(this.aliases.get(commandText));
            if (!command || command.disabled) return;

            try {
                await command.run(this.client, args);
                // Breakline
                console.log('');
            } catch (err) {
                Commander.handleError(this.client, err, false);
                console.error('Commander (ERROR) >> Error Running CLI Command'.red + err);
            }
        })

        // Discord Commands
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            await interaction.deferReply();

            const command = this.commands.get(interaction.commandName) || this.commands.get(this.aliases.get(interaction.commandName));
            if (!command || command.disabled) {
                let notFound = failEmbed('This command has been disabled or removed!', interaction.user);
                return interaction.editReply({ embeds: [notFound] });
            }

            if (!this.authenticate(interaction, command)) return;
            
            let cooldown = command.getCooldown(interaction.guild, interaction.user);
            if (cooldown) {
                let wait = failEmbed(`Please wait \`${cooldown}\` seconds before using that command again!`, interaction.user)
                return interaction.editReply({ embeds: [wait] })
            }

            try {
                await command.run(this.client, interaction);
            } catch (err) {
                Commander.handleError(this.client, err, false, interaction.guild);
                console.error('Commander (ERROR) >> Error Running Slash Command'.red);
            }
        })
    }

    static initialize(client) {
        try {
            let commander = new Commander(client);
            commander.registerCommands();
            commander.registerModules();
            console.log('>>> Commander Initialized'.brightGreen.bold.underline);

            return commander;
        } catch (err) {
            Commander.handleError(client, err, true);
            console.error('Commander (ERROR) >> Error Initializing'.red);
            console.error(err);
        }
    }

    // static async reload(client) {
    //     const srcPath = path.join(__dirname, 'src');
    //     const srcFolders = await fs.promises.readdir(srcPath);

    //     for (const folder of srcFolders) {
    //         if (!(folder == 'core' || folder == 'utils')) continue;

    //         const subFolders = fs.readdirSync(`${srcPath}/${folder}`);

    //         for (const subFolder of subFolders) {
    //             const srcFiles = fs.readdirSync(`${srcPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));
                
    //             for (const file of srcFiles) {
    //                 delete require.cache[require.resolve(`${srcPath}/${folder}/${subFolder}/${file}`)];
    //             }
    //         }
    //     }

    //     for (const event in client._events) {
    //         if (event == 'error' || event == 'shardDisconnect') continue;
    //         client.removeAllListeners(event);
    //     }

    //     client.commander.readline.close();

    //     const Commander = require('./commander');
    //     return Commander.initialize(client);
    // }

    registerCommands() {
        const globalPath = path.join(__dirname, '../src', 'commands', 'Global');
        const guildPath = path.join(__dirname, '../src', 'commands', 'Guild');
        const globalFolders = fs.existsSync(globalPath) ? fs.readdirSync(globalPath) : [];
        const guildFolders = fs.existsSync(guildPath) ? fs.readdirSync(guildPath) : [];
        
        this.commands = new Discord.Collection();
        this.aliases = new Discord.Collection();
        this.cooldowns = new Discord.Collection();
        this.groups = new Discord.Collection();
    
        if (globalFolders.length) {
            for (const folder of globalFolders) {
                const globalFiles = fs.readdirSync(`${globalPath}/${folder}`).filter(file => file.endsWith('.js'));
        
                for (const file of globalFiles) {
                    delete require.cache[require.resolve(`${globalPath}/${folder}/${file}`)]
        
                    const object = require(`${globalPath}/${folder}/${file}`);
                    const command = new CommanderCommand(object, this);
    
                    this.commands.set(command.name, command);
                }
            }
        }
        
        if (guildFolders.length) {
            for (const folder of guildFolders) {
                const guildSubFolders = fs.readdirSync(`${guildPath}/${folder}`);
    
                for (const subFolder of guildSubFolders) {
                    const guildFiles = fs.readdirSync(`${guildPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));
    
                    for (const file of guildFiles) {
                        delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)]
        
                        const object = require(`${guildPath}/${folder}/${subFolder}/${file}`);
                        const command = new CommanderCommand(object, this);
                        if (!command.guilds || !command.guilds.includes(folder)) console.warn(`Commander (WARNING) >> Guild Not Set For Guild Command: ${command.name}`.yellow);
    
                        this.commands.set(command.name, command);
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

            if (commands.length) await this.client.application.commands.set(commands);
            console.log('Commander >> Successfully Registered Global Commands.'.brightGreen);
        } catch (err) {
            Commander.handleError(this.client, err, false);
            console.error('Commander (ERROR) >> Error Registering Global Slash Commands'.red);
            console.error(err);
        }

        try {
            for (const [k, g] of this.guilds) {
                let commands = [];

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

                const guild = this.client.guilds.cache.get(k);
                if (commands.length && guild) await guild.commands.set(commands).catch(err => {
                    console.error(`Commander (ERROR) >> Error Registering Guild Slash Commands For: ${guild.id}`.red);
                    console.error(err);
                });
            }
            console.log('Commander >> Successfully Registered Guild Commands.'.brightGreen);
        } catch (err) {
            Commander.handleError(this.client, err, false);
            console.error('Commander (ERROR) >> Error Registering Guild Slash Commands'.red);
            console.error(err);
        }
    }

    registerModules() {
        const globalPath = path.join(__dirname, '../src', 'modules', 'Global');
        const guildPath = path.join(__dirname, '../src', 'modules', 'Guild');
        const globalFolders = fs.existsSync(globalPath) ? fs.readdirSync(globalPath) : [];
        const guildFolders = fs.existsSync(guildPath) ? fs.readdirSync(guildPath) : [];

        this.modules = new Discord.Collection();

        if (globalFolders.length) {
            for (const folder of globalFolders) {
                const globalFiles = fs.readdirSync(`${globalPath}/${folder}`).filter(file => file.endsWith('.js'));
        
                for (const file of globalFiles) {
                    delete require.cache[require.resolve(`${globalPath}/${folder}/${file}`)]
        
                    const object = require(`${globalPath}/${folder}/${file}`);
                    const module = new CommanderModule(object, this);
    
                    module.initialize(this.client);
    
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
                        delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)]
        
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

    validate(msg) {
        if (!msg.guild) return true;

        if (!msg.guild.me.permissions.has(perms)) {
            let noPerms = failEmbed('I don\'t have enough permissions in this server. Try contacting an admin!')
            msg.author.send({ embeds: [noPerms] }).catch(err => {
                console.error('Commander (ERROR) >> Could Not Send Permission Warning To User'.red);
                console.error(err);
            });

            return false;
        }

        if (!msg.channel.permissionsFor(this.client.user).has(perms)) {
            let noPerms = failEmbed('I don\'t have enough permissions to type in that channel!');
            msg.author.send({ embeds: [noPerms] }).catch(err => {
                console.error('Commander (ERROR) >> Could Not Send Permission Warning To User'.red);
                console.error(err);
            });
            
            return false;
        };

        return true;
    }

    authenticate(interaction, command) {
        if (command.users && !command.users.includes(interaction.user.id)) {
            let notAllowed = failEmbed('You are not allowed to use this command!', interaction.user);
            interaction.editReply({ embeds: [notAllowed] });
            return false;
        }

        if (command.guildOnly && !interaction.inGuild()) {
            let notGuild = failEmbed('This command can not be used in DMs!', interaction.user);
            interaction.editReply({ embeds: [notGuild] });
            return false;
        }

        return true;
    }

    // Error Handling
    
    static async handleError(client, err, quit, guild) {
        let dev = client ? await client.users.fetch(client.dev).catch(() => { return }) : null;
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
                let embed = new Discord.MessageEmbed()
                .setColor('#F04947')
                .setTitle('Uh Oh!')
                .setDescription(`A critical error in the internal code has occured.`)
                .addFields(
                    { name: 'Error Code', value: `\`${code}\``, inline: true },
                )
                .setThumbnail('https://icon-library.com/images/image-error-icon/image-error-icon-17.jpg');

                if (guild) {
                    embed.addFields(
                        { name: 'Guild', value: `\`${guild ? guild.name : 'N/A'}\`` },
                        { name: 'Guild ID', value: `\`${guild ? guild.id : 'N/A'}\``, inline: true },
                        { name: 'Guild Owner ID', value: `\`${guild ? guild.ownerId : 'N/A'}\``, inline: true },
                    );
                }
        
                await dev.send({embeds: [embed]}).catch(() => { return });
            }

            console.error('Commander (ERROR) >> Error! Logged to file!'.red);
            console.error(errorObject.errorStack);
            if (quit) process.exit();
        })
    }
}

class CommanderCommand {
    constructor(object, commander) {
        this.commander = commander;
        this.object = object;

        for (const key in object) {
            this[key] = object[key];
        }

        if (this.users) this.users.push(this.commander.client.dev);

        if (this.aliases) {
            for (const alias of this.aliases) {
                this.commander.aliases.set(alias, this.name);
            }
        }

        if (!this.commander.groups.has(this.group)) this.commander.groups.set(this.group, new Discord.Collection());
    
        this.commander.groups.get(this.group).set(this.name, this);

        if (this.guilds) {
            for (const guildId of this.guilds) {
                if (!this.commander.client.guilds.cache.has(guildId)) console.warn(`Commander (WARNING) >> Guild (${guildId}) Not Found For Command: ${this.name}`.yellow);

                let guild = this.commander.guilds.get(guildId) || {};
                guild.commands = guild.commands || new Discord.Collection();
                guild.commands.set(this.name, this);

                this.commander.guilds.set(guildId, guild);
            }
        } else {
            this.commander.global.set(this.name, this);
        }
    }

    getCooldown(guild, user) {
        const now = Date.now();

        if (!this.cooldown) return false;

        let cooldown = this.cooldown * 1000;
        if (!this.commander.cooldowns.has(guild?.id || 'dm')) this.commander.cooldowns.set(guild?.id || 'dm', new Discord.Collection());

        let cooldowns = this.commander.cooldowns.get(guild?.id || 'dm');
        if (!cooldowns.has(user.id)) cooldowns.set(user.id, new Discord.Collection());
        
        let usages = cooldowns.get(user.id);
        if (usages.has(this.name)) {
            let expire = usages.get(this.name) + cooldown;
            if (now < expire) return ((expire - now) / 1000).toFixed();
        }

        usages.set(this.name, now)

        setTimeout(() => usages.delete(this.name), cooldown);

        return false;
    }
}

class CommanderModule {
    constructor(module, commander) {
        this.commander = commander;
        this.module = module;

        for (const key in module) {
            this[key] = module[key];
        }

        if (this.events) {
            for (const event in this.commander.client._events) {
                if (event == 'error' || event == 'shardDisconnect' || event == 'msgCreate') continue;
                if (this.events.includes(event)) this.client.removeAllListeners(event);
            }
        }

        if (this.guilds) {
            for (const guildId of this.guilds) {
                if (!this.commander.client.guilds.cache.has(guildId)) console.warn(`Commander (WARNING) >> Guild (${guildId}) Not Found For Module: ${this.name}`.yellow);

                let guild = this.commander.guilds.get(guildId) || {};
                guild.modules = guild.modules || new Discord.Collection();
                guild.modules.set(this.name, this);

                this.commander.guilds.set(guildId, guild);
            }
        }
    }

    async initialize(client) {
        try {
            await this.run(client);
            console.log(`Commander >> Loaded ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`.brightGreen);
        } catch (err) {
            Commander.handleError(client, err, false);
            console.error(`Commander >> Failed to Load ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`.red);
            console.error(err);
        }
    }
}

module.exports = Commander;