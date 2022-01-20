// This is the command handler, CODENAME: Commander v2.0.0
// Last Update: Conversion to class
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
            if (!msg.content.startsWith(this.prefix) || msg.author.bot) return;

            if (msg.guild) {
                if (!msg.guild.me.permissions.has(perms)) {
                    let noPerms = failEmbed('I don\'t have enough permissions in this server. Try contacting an admin!')
                    return msg.author.send({ embeds: [noPerms] }).catch(err => {
                        console.log('Commander (ERROR) >> Could Not Send Permission Warning To User'.red);
                        console.log(`REASON: ${err.meesage}`.red);
                    });
                }
    
                if (!msg.channel.permissionsFor(this.client.user).has(perms)) {
                    let noPerms = failEmbed('I don\'t have enough permissions to type in that channel!');
                    return msg.author.send({ embeds: [noPerms] }).catch(err => {
                        console.log('Commander (ERROR) >> Could Not Send Permission Warning To User'.red);
                        console.log(`REASON: ${err.meesage}`.red);
                    });
                };
            }
            
            const content = msg.content.slice(this.prefix.length).trim().split(/ +/);
            const commandText = content.shift().toLowerCase();
            const args = content.join(' ')
            const now = Date.now();
        
            const command = this.client.commands.get(commandText) || this.client.commands.get(this.client.aliases.get(commandText));
            if (!command || command.disabled) return;

            if ((command.guilds && (!msg.guild || !command.guilds.includes(msg.guild.id))) || (command.users && !command.users.includes(msg.author.id))) return;
            
            if (command.guildOnly && msg.channel.type == 'DM') {
                let notGuild = failEmbed('This command can not be used in DMs!', msg.author);
                return msg.reply({ embeds: [notGuild] }).catch(() => msg.channel.send({ embeds: [notGuild] }));
            }
    
            if (command.cooldown) {
                let cooldown = command.cooldown * 1000;
                if (!this.client.cooldowns.has(msg.guildId)) this.client.cooldowns.set(msg.guildId, new Discord.Collection());
    
                let cooldowns = this.client.cooldowns.get(msg.guildId);
                if (!cooldowns.has(msg.author.id)) cooldowns.set(msg.author.id, new Discord.Collection());
                
                let usages = cooldowns.get(msg.author.id);
                if (usages.has(command.name)) {
                    let expire = usages.get(command.name) + cooldown
                    if (now < expire) {
                        let wait = failEmbed(`Please wait \`${((expire - now) / 1000).toFixed()}\` seconds before using that command again!`, msg.author)
                        return msg.reply({ embeds: [wait] }).catch(() => msg.channel.send({ embeds: [wait] }));
                    }
                }
    
                usages.set(command.name, now)
    
                setTimeout(() => usages.delete(command.name), cooldown);
            }
    
            try {
                command.run(this.client, msg, args);
            } catch (err) {
                this.constructor.handleError(this.client, err, msg, args);
            }
        });
    }

    static initialize(client) {
        try {
            client.commander = new Commander(client);
            client.commander.registerCommands();
            client.commander.registerModules();
            console.log('>>> Commander Initialized'.brightGreen.bold.underline);

            return client.commander;
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
    
                const command = require(`${globalPath}/${folder}/${file}`);

                this.setCommand(command);
            }
        }

        for (const folder of guildFolders) {
            const guildSubFolders = fs.readdirSync(`${guildPath}/${folder}`);

            for (const subFolder of guildSubFolders) {
                const guildFiles = fs.readdirSync(`${guildPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));

                for (const file of guildFiles) {
                    delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)]
    
                    const command = require(`${guildPath}/${folder}/${subFolder}/${file}`);

                    if (!command.guilds || !command.guilds.includes(folder)) console.log(`Commander (WARNING) >> Guild Not Set For Guild Command: ${command.name}`.yellow);
    
                    this.setCommand(command);
                }
            }
        }

        this.client.commands = this.commands;
        this.client.aliases = this.aliases;
        this.client.cooldowns = this.cooldowns;
        this.client.groups = this.groups;
    }

    setCommand(command) {
        if (command.guilds) {
            for (const guildId of command.guilds) {
                if (!this.client.guilds.cache.has(guildId)) console.log(`Commander (WARNING) >> Guild (${guildId}) Not Found For Command: ${command.name}`.yellow);

                let guild = this.guilds.get(guildId) || {};
                guild.commands = guild.commands || new Discord.Collection();
                guild.commands.set(command.name, command);

                this.guilds.set(guildId, guild)
            }
        }

        if (command.users) command.users.push(this.client.owner);

        this.commands.set(command.name, command);

        if (this.groups.has(command.group)) {
            this.groups.get(command.group).set(command.name, command)
        } else {
            console.warn(`Commander (WARNING) >> Command Group Does Not Exist: ${command.group} (${command.name})`)
        }

        if (command.aliases) {
            command.aliases.forEach((alias) => this.aliases.set(alias, command.name))
        }
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
    
                const module = require(`${globalPath}/${folder}/${file}`);

                this.setModule(module);
            }
        }

        for (const folder of guildFolders) {
            const guildSubFolders = fs.readdirSync(`${guildPath}/${folder}`);

            for (const subFolder of guildSubFolders) {
                const guildFiles = fs.readdirSync(`${guildPath}/${folder}/${subFolder}`).filter(file => file.endsWith('.js'));

                for (const file of guildFiles) {
                    delete require.cache[require.resolve(`${guildPath}/${folder}/${subFolder}/${file}`)]
    
                    const module = require(`${guildPath}/${folder}/${subFolder}/${file}`);

                    if (!module.guilds || !module.guilds.includes(folder)) console.log(`Commander (WARNING) >> Guild Not Set For Guild Module: ${module.name}`.yellow);
    
                    this.setModule(module);
                }
            }
        }

        this.client.modules = this.modules;
    }

    setModule(module) {
        if (module.events) {
            for (const event in this.client._events) {
                if (event == 'error' || event == 'shardDisconnect' || event == 'msgCreate') continue;
                if (module.events.includes(event)) this.client.removeAllListeners(event);
            }
        }

        if (module.guilds) {
            for (const guildId of module.guilds) {
                if (!this.client.guilds.cache.has(guildId)) console.log(`Commander (WARNING) >> Guild (${guildId}) Not Found For Module: ${module.name}`.yellow);

                let guild = this.guilds.get(guildId) || {};
                guild.modules = guild.modules || new Discord.Collection();
                guild.modules.set(module.name, module);

                this.guilds.set(guildId, guild);
            }
        }

        this.modules.set(module.name, module);

        try {
            module.run(this.client);
            console.log(`Commander >> Loaded ${module.guilds ? 'Guild' : 'Global'} Module: ${module.name}`.brightGreen);
        } catch (err) {
            this.constructor.handleError(this.client, err);
        }
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

module.exports = Commander;