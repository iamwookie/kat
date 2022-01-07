// This is the command handler, CODENAME: Commander v2.0.0
// Last Update: Conversion to class
const Discord = require('discord.js');
const { failEmbed } = require('@utils/embeds');
const fs = require('fs');
const path = require('path');
// -----------------------------------

class Commander {
    constructor(client) {
        this.client = client;
        this.prefix = client.prefix;
        this.groupsArray = [
            'Misc',
            'Music'
        ]
        
        // Music
        this.client.subscriptions = new Discord.Collection();
    
        this.client.on('messageCreate', async msg => {
            if (!msg.content.startsWith(this.prefix) || msg.author.bot) return;
    
            const content = msg.content.slice(this.prefix.length).trim().split(/ +/);
            const commandText = content.shift().toLowerCase();
            const args = content.join(' ')
            const now = Date.now();
        
            const command = this.client.commands.get(commandText) || this.client.commands.get(this.client.aliases.get(commandText));
            if (!command || command.disabled || (command.users && !command.users.includes(msg.author.id))) return;
    
            if (command.guildOnly && msg.channel.type == 'DM') {
                let notGuild = failEmbed('This command can not be used in DMs!', msg.author);
                return msg.reply({embeds: [notGuild]});
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
                        return msg.reply({embeds: [wait]});
                    }
                }
    
                usages.set(command.name, now)
    
                setTimeout(() => usages.delete(command.name), cooldown);
            }
    
            try {
                return command.run(this.client, msg, args);
            } catch (error) {
                return this.constructor.handleError(this.client, error, msg, args);
            }
        });
    }

    static initialize(client) {
        try {
            client.commander = new Commander(client);
            client.commander.registerCommands();
            client.commander.registerModules();
            console.log('>>> Commander Initialized');
    
            return client.commander;
        } catch(err) {
            return Commander.handleError(client, err)
        }
    }

    reload(msg) {
        try {
            this.registerCommands();
            this.registerModules();
            console.log('>>> Commander Reloaded');

            return this;
        } catch(err) {
            return this.constructor.handleError(this.client, err, msg);
        }
    }

    registerCommands() {
        const cPath = path.join(__dirname, 'src', 'commands');
        const commandFolders = fs.readdirSync(cPath);
        
        this.commands = new Discord.Collection();
        this.aliases = new Discord.Collection();
        this.cooldowns = new Discord.Collection();
        this.groups = new Discord.Collection();

        this.groupsArray.forEach((g) => {
            if(this.groups.has(g)) return;
    
            this.groups.set(g, new Discord.Collection())
        })
    
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${cPath}/${folder}`).filter(file => file.endsWith('.js'));
    
            for (const file of commandFiles) {
                delete require.cache[require.resolve(`${cPath}/${folder}/${file}`)]

                const command = require(`${cPath}/${folder}/${file}`);
    
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
        }

        this.client.commands = this.commands;
        this.client.aliases = this.aliases;
        this.client.cooldowns = this.cooldowns;
        this.client.groups = this.groups;
    }

    registerModules() {
        const mPath = path.join(__dirname, "src", 'modules');
        const moduleFolders = fs.readdirSync(mPath);

        this.modules = new Discord.Collection();

        for (const folder of moduleFolders) {
            const moduleFiles = fs.readdirSync(`${mPath}/${folder}`).filter(file => file.endsWith('.js'));
    
            for (const file of moduleFiles) {
                delete require.cache[require.resolve(`${mPath}/${folder}/${file}`)]

                const module = require(`${mPath}/${folder}/${file}`);
    
                this.modules.set(module.name, module);
    
                try {
                    module.run(this.client)
                    console.log("Commander >> Loaded Module: " + module.name)
                } catch(err) {
                    this.constructor.handleError(this.client, err);
                }
            }
        }

        this.client.modules = this.modules;
    }
    
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
                .setDescription(`A critical error in the internal code has occured! Please DM the error code provided below to \`${dev ? dev.tag : 'the developer.'}\``)
                .addFields(
                    { name: 'Error Code', value: `\`${code}\`` }
                )
                .setThumbnail('https://icon-library.com/images/image-error-icon/image-error-icon-17.jpg')
                .setFooter('NOTE: The bot will now shutdown until restarted by a developer! Thanks for your help!')
        
                if (dev) await dev.send({embeds: [embed]});
                if (msg) await msg.channel.send({embeds: [embed]});
            }

            console.log('Commander (ERROR) >> Command Error! Logged to file!');
            console.log(errorObject.errorStack);
            process.exit();
        })
    }
}

module.exports = Commander;