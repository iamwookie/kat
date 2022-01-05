// This is the command handler, CODENAME: Commander v1.1.5
// Last Update: Added support for multi guilds.
const Discord = require('discord.js');
const { failEmbed } = require('@utils/embeds');
const fs = require('fs');
const path = require('path');
// -----------------------------------
const groups = [
    'Misc',
    'Music'
]

module.exports = (client) => {
    const prefix = client.prefix;
    const cPath = path.join(__dirname, 'src', 'commands');
    const mPath = path.join(__dirname, "src", 'modules');
    const commandFolders = fs.readdirSync(cPath);
    const moduleFolders = fs.readdirSync(mPath);
    
    client.commands = new Discord.Collection();
    client.aliases = new Discord.Collection();
    client.cooldowns = new Discord.Collection();
    client.groups = new Discord.Collection();
    client.modules = new Discord.Collection();

    // Music
    client.subscriptions = new Discord.Collection();
    
    groups.forEach((g) => {
        if(client.groups.has(g)) return;

        client.groups.set(g, new Discord.Collection())
    })

    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`${cPath}/${folder}`).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`${cPath}/${folder}/${file}`);

            client.commands.set(command.name, command);

            if (client.groups.has(command.group)) {
                client.groups.get(command.group).set(command.name, command)
            } else {
                console.warn(`Commander (WARNING) >> Command Group Does Not Exist: ${command.group} (${command.name})`)
            }

            if (command.aliases) {
                command.aliases.forEach((alias) => client.aliases.set(alias, command.name))
            }
        }
    }

    for (const folder of moduleFolders) {
        const moduleFiles = fs.readdirSync(`${mPath}/${folder}`).filter(file => file.endsWith('.js'));

        for (const file of moduleFiles) {
            const module = require(`${mPath}/${folder}/${file}`);

            client.modules.set(module.name, module);

            try {
                module.run(client)
                console.log("Commander >> Loaded Module: " + module.name)
            } catch(error) {
                handleError(error);
            }
        }
    }

    console.log('>>> Commander Initialized');

    client.on('messageCreate', async msg => {
        if (!msg.content.startsWith(prefix) || msg.author.bot) return;

        const content = msg.content.slice(prefix.length).trim().split(/ +/);
        const commandText = content.shift().toLowerCase();
        const args = content.join(' ')
        const now = Date.now();
    
        const command = client.commands.get(commandText) || client.commands.get(client.aliases.get(commandText));
        if (!command || command.disabled || (command.users && !command.users.includes(msg.author.id))) return;

        if (command.guildOnly && msg.channel.type == 'DM') {
            let notGuild = failEmbed(client, 'This command can not be used in DMs!', msg.author);
            return msg.reply({embeds: [notGuild]});
        }

        if (command.cooldown) {
            let cooldown = command.cooldown * 1000;
            if (!client.cooldowns.has(msg.guildId)) client.cooldowns.set(msg.guildId, new Discord.Collection());

            let cooldowns = client.cooldowns.get(msg.guildId);
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
            return command.run(client, msg, args);
        } catch (error) {
            return handleError(error, msg, args);
        }
    });
}

async function handleError(err, msg, args = null) {
    let dev = 'Wookie#2907'
    let time = Date.now()
    let errorObject = {
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
        message: msg ? msg : "N/A",
        arguments: args ? msg : "N/A",
    }

    fs.appendFile('./error.log', `${time}: ${JSON.stringify(errorObject)}\n`, (err) => {
        if (err) throw err;

        if (msg) {
            let embed = new Discord.MessageEmbed()
            .setColor('#F04947')
            .setTitle('Uh Oh!')
            .setDescription(`A critical error in the internal code has occured! Please DM the error code provided below to \`${dev}\``)
            .addFields(
                { name: 'Error Code', value: `\`${time}\`` }
            )
            .setThumbnail('https://icon-library.com/images/image-error-icon/image-error-icon-17.jpg')
            .setFooter('NOTE: The bot will now shutdown until restarted by a developer! Thanks for your help!')
    
            msg.channel.send({embeds: [embed]}).then(() => {
                console.log('[Error] Command Error! Exiting process!');
                process.exit();
            })
        } else {
            console.log('[ERROR] Error! Logged to file!');
            process.exit()
        }
    })
} 