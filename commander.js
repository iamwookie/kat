// This is the command handler, CODENAME: Commander v3.0.0
// Last Update: Modules and Commands converted to seperate classes
const Discord = require('discord.js');
const { failEmbed } = require('@utils/other/embeds');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
// -----------------------------------
const perms = [ // 37047360
    // GENERAL
    Discord.Permissions.FLAGS.VIEW_CHANNEL,
    // TEXT
    Discord.Permissions.FLAGS.SEND_MESSAGES,
    Discord.Permissions.FLAGS.EMBED_LINKS,
    Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY,
    Discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
    Discord.Permissions.FLAGS.ADD_REACTIONS,
    // VOICE
    Discord.Permissions.FLAGS.CONNECT,
    Discord.Permissions.FLAGS.SPEAK,
    Discord.Permissions.FLAGS.USE_VAD
];
const groups = [
    'CLI',
    'Misc',
    'Music',
    'Twitch'
];

class Commander {
    constructor(client) {
        this.client = client;
        this.prefix = client.prefix;
        this.readline = readline.createInterface(process.stdin);
        this.guilds = new Discord.Collection();

        // Music
        this.client.subscriptions = this.client.subscriptions || new Discord.Collection();

        // CLI Commands
        this.readline.on('line', async line => {
            if (!line.startsWith('>')) return;
            
            const content = line.slice(1).trim().split(/ +/);
            const commandText = content.shift().toLowerCase();
            const args = content.join(' ');

            const command = client.groups.get('CLI').get(commandText) || client.groups.get('CLI').get(this.client.aliases.get(commandText));
            if (!command || command.disabled) return;

            try {
                await command.run(this.client, args);
                // Breakline
                console.log('');
            } catch (err) {
                this.constructor.handleError(this.client, err, args);
            }
        })

        // Discord Commands
        this.client.on('messageCreate', async msg => {
            let prefix = this.prefix;

            if (msg.guild) prefix = await this.client.database.get(msg.guildId, 'prefix') || this.prefix

            if (!msg.content.startsWith(prefix) || msg.author.bot) return;

            if (!this.authorize(msg)) return;

            const content = msg.content.slice(prefix.length).trim().split(/ +/);
            const commandText = content.shift().toLowerCase();
            const args = content.join(' ');
        
            const command = this.client.commands.get(commandText) || this.client.commands.get(this.client.aliases.get(commandText));
            if (!command || command.disabled) return false;

            if (!command.validate(msg)) return;
    
            let cooldown = command.getCooldown(msg);
            if (cooldown) {
                let wait = failEmbed(`Please wait \`${cooldown}\` seconds before using that command again!`, msg.author)
                return msg.reply({ embeds: [wait] }).catch(() => msg.channel.send({ embeds: [wait] }));
            }
    
            try {
                command.run(this.client, msg, args);
            } catch (err) {
                this.constructor.handleError(this.client, err, msg, args);
            }
        });
    }

    static async initialize(client) {
        try {
            let commander = new Commander(client);
            commander.registerCommands();
            commander.registerModules();
            console.log('>>> Commander Initialized'.brightGreen.bold.underline);

            return commander;
        } catch (err) {
            return Commander.handleError(client, err)
        }
    }

    static async reload(client) {
        const srcPath = path.join(__dirname, 'src');
        const srcFolders = await fs.promises.readdir(srcPath);

        for (const folder of srcFolders) {
            if (!(folder == 'core' || folder == 'utils')) continue;

            const subFolders = fs.readdirSync(`${srcPath}/${folder}`);

            for (const subFolder of subFolders) {
                const srcFiles = fs.readdirSync(`${srcPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));
                
                for (const file of srcFiles) {
                    delete require.cache[require.resolve(`${srcPath}/${folder}/${subFolder}/${file}`)];
                }
            }
        }

        for (const event in client._events) {
            if (event == 'error' || event == 'shardDisconnect') continue;
            client.removeAllListeners(event);
        }

        client.commander.readline.close();

        const Commander = require('./commander');
        return Commander.initialize(client);
    }

    registerCommands() {
        const globalPath = path.join(__dirname, 'src', 'commands', 'Global');
        const guildPath = path.join(__dirname, 'src', 'commands', 'Guild');
        const globalFolders = fs.readdirSync(globalPath);
        const guildFolders = fs.readdirSync(guildPath);
        
        this.commands = new Discord.Collection();
        this.aliases = new Discord.Collection();
        this.cooldowns = new Discord.Collection();
        this.groups = new Discord.Collection();

        groups.forEach((g) => {
            if(this.groups.has(g)) return;
    
            this.groups.set(g, new Discord.Collection())
        })
    
        for (const folder of globalFolders) {
            const globalFiles = fs.readdirSync(`${globalPath}/${folder}`).filter(file => file.endsWith('.js'));
    
            for (const file of globalFiles) {
                delete require.cache[require.resolve(`${globalPath}/${folder}/${file}`)]
    
                const object = require(`${globalPath}/${folder}/${file}`);
                const command = new CommanderCommand(object, this);

                this.commands.set(command.name, command);
            }
        }

        for (const folder of guildFolders) {
            const guildSubFolders = fs.readdirSync(`${guildPath}/${folder}`);

            for (const subFolder of guildSubFolders) {
                const guildFiles = fs.readdirSync(`${guildPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));

                for (const file of guildFiles) {
                    delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)]
    
                    const object = require(`${guildPath}/${folder}/${subFolder}/${file}`);
                    const command = new CommanderCommand(object, this);
                    if (!command.guilds || !command.guilds.includes(folder)) console.log(`Commander (WARNING) >> Guild Not Set For Guild Command: ${command.name}`.yellow);

                    this.commands.set(command.name, command);
                }
            }
        }

        this.client.commands = this.commands;
        this.client.aliases = this.aliases;
        this.client.cooldowns = this.cooldowns;
        this.client.groups = this.groups;
    }


    registerModules() {
        const globalPath = path.join(__dirname, 'src', 'modules', 'Global');
        const guildPath = path.join(__dirname, 'src', 'modules', 'Guild');
        const globalFolders = fs.readdirSync(globalPath);
        const guildFolders = fs.readdirSync(guildPath);

        this.modules = new Discord.Collection();

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

        for (const folder of guildFolders) {
            const guildSubFolders = fs.readdirSync(`${guildPath}/${folder}`);

            for (const subFolder of guildSubFolders) {
                const guildFiles = fs.readdirSync(`${guildPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));

                for (const file of guildFiles) {
                    delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)]
    
                    const object = require(`${guildPath}/${folder}/${subFolder}/${file}`);
                    const module = new CommanderModule(object, this);
                    if (!module.guilds || !module.guilds.includes(folder)) console.log(`Commander (WARNING) >> Guild Not Set For Guild Module: ${module.name}`.yellow);
    
                    module.initialize(this.client);

                    this.modules.set(module.name, module);
                }
            }
        }

        this.client.modules = this.modules;
    }

    authorize(msg) {
        if (!msg.guild) return true;

        if (!msg.guild.me.permissions.has(perms)) {
            let noPerms = failEmbed('I don\'t have enough permissions in this server. Try contacting an admin!')
            msg.author.send({ embeds: [noPerms] }).catch(err => {
                console.log('Commander (ERROR) >> Could Not Send Permission Warning To User'.red);
                console.log(`REASON: ${err.meesage}`.red);
            });
            return false;
        }

        if (!msg.channel.permissionsFor(this.client.user).has(perms)) {
            let noPerms = failEmbed('I don\'t have enough permissions to type in that channel!');
            msg.author.send({ embeds: [noPerms] }).catch(err => {
                console.log('Commander (ERROR) >> Could Not Send Permission Warning To User'.red);
                console.log(`REASON: ${err.meesage}`.red);
            });
            return false;
        };

        return true;
    }

    // Error Handling
    
    static async handleError(client, err, msg, args = null) {
        let dev = await client.users.fetch(client.owner);
        let code = Date.now();
        let errorObject = {
            errorName: err.name,
            errorMessage: err.message,
            errorStack: err.stack,
            message: msg ? msg : "N/A",
            arguments: args ? msg : "N/A",
        };
        
        fs.appendFile('./error.log', `${code}: ${JSON.stringify(errorObject)}\n`, async (err) => {
            if (err) throw err;

            if (msg || dev) {
                let embed = new Discord.MessageEmbed()
                .setColor('#F04947')
                .setTitle('Uh Oh!')
                .setDescription(`A critical error in the internal code has occured. The developer has already been notified. Please wait patiently until we fix the issue!`)
                .addFields(
                    { name: 'Error Code', value: `\`${code}\`` }
                )
                .setThumbnail('https://icon-library.com/images/image-error-icon/image-error-icon-17.jpg')
                .setFooter({ text:'NOTE: The bot will now shutdown until restarted by a developer! Thanks for your help!' })
        
                if (dev) await dev.send({embeds: [embed]});
                if (msg) await msg.channel.send({embeds: [embed]});
            }

            console.log('Commander (ERROR) >> Command Error! Logged to file!'.red);
            console.log(errorObject.errorStack);
            process.exit();
        })
    }
}

class CommanderCommand {
    constructor(command, commander) {
        this.commander = commander;
        this.command = command;

        for (const key in command) {
            this[key] = command[key];
        }

        if (this.guilds) {
            for (const guildId of this.guilds) {
                if (!this.commander.client.guilds.cache.has(guildId)) console.log(`Commander (WARNING) >> Guild (${guildId}) Not Found For Command: ${this.name}`.yellow);

                let guild = this.commander.guilds.get(guildId) || {};
                guild.commands = guild.commands || new Discord.Collection();
                guild.commands.set(this.name, this);

                this.commander.guilds.set(guildId, guild);
            }
        }

        if (this.users) this.users.push(this.commander.client.owner);

        if (this.commander.groups.has(this.group)) {
            this.commander.groups.get(this.group).set(this.name, this);
        } else {
            console.warn(`Commander (WARNING) >> Command Group Does Not Exist: ${this.group} (${this.name})`)
        }

        if (this.aliases) {
            this.aliases.forEach((alias) => this.commander.aliases.set(alias, this.name))
        }
    }

    validate(msg) {
        if ((this.guilds && (!msg.guild || !this.guilds.includes(msg.guild.id))) || (this.users && !this.users.includes(msg.author.id))) return false;

        if (this.guildOnly && msg.channel.type == 'DM') {
            let notGuild = failEmbed('This command can not be used in DMs!', msg.author);
            msg.reply({ embeds: [notGuild] }).catch(() => msg.channel.send({ embeds: [notGuild] }));
            return false;
        }

        return true;
    }

    getCooldown(msg) {
        const now = Date.now();

        if (!this.cooldown) return false;

        let cooldown = this.cooldown * 1000;
        if (!this.commander.cooldowns.has(msg.guildId || 'dm')) this.commander.cooldowns.set(msg.guildId || 'dm', new Discord.Collection());

        let cooldowns = this.commander.cooldowns.get(msg.guildId || 'dm');
        if (!cooldowns.has(msg.author.id)) cooldowns.set(msg.author.id, new Discord.Collection());
        
        let usages = cooldowns.get(msg.author.id);
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
                if (!this.commander.client.guilds.cache.has(guildId)) console.log(`Commander (WARNING) >> Guild (${guildId}) Not Found For Module: ${this.name}`.yellow);

                let guild = this.commander.guilds.get(guildId) || {};
                guild.modules = guild.modules || new Discord.Collection();
                guild.modules.set(this.name, this);

                this.commander.guilds.set(guildId, guild);
            }
        }
    }

    initialize(client) {
        try {
            this.run(client);
            console.log(`Commander >> Loaded ${this.guilds ? 'Guild' : 'Global'} Module: ${this.name}`.brightGreen);
        } catch (err) {
            Commander.handleError(client, err);
        }
    }
}

module.exports = Commander;