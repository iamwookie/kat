const Discord = require('discord.js');

module.exports = {
    name: 'help',
    group: 'Misc',
    description: 'Stop it. Get some help.',
    async run(client, msg) {
        let replyEmbed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setTitle('**Help Menu**')
        .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL({dynamic: true}) });

        let prefix = client.prefix;

        if (msg.guild) prefix = await client.database.get(msg.guildId, 'prefix') || client.prefix;

        // We build the reply here.
        client.groups.forEach((group, key) => {
            if (key == 'CLI') return;

            let reply = '';
            group.forEach(async x => {
                if (x.hidden || x.disabled || (x.guilds && (!msg.guild || !x.guilds.includes(msg.guild.id)))) return;

                if (x.aliases) {
                    // If command has aliases, it builds reply like this for every command that has alias.
                    var aliasmsg = "";
                    x.aliases.forEach(alias => {
                        aliasmsg += `, ${prefix}${alias}`
                    })
                    reply += `\`\`${prefix}${x.name}${aliasmsg}${x.format ? ` ${x.format.replace('[prefix]', prefix).replace('[aliases]', aliasmsg)}` : ''}\`\` → ${x.description}\n`
                } else {
                    // // If command has no aliases, it builds reply like this for every command that has no aliases.
                    reply += `\`\`${prefix}${x.name}${x.format ? ` ${x.format.replace('[prefix]', prefix).replace('[aliases]', aliasmsg)}` : ''}\`\` → ${x.description}\n`
                }
            })
            if (reply) replyEmbed.addField(key + ' Commands', reply);
        });
        
        msg.reply({ embeds: [replyEmbed] }).catch(() => msg.channel.send({ embeds: [replyEmbed] }));
    }
};