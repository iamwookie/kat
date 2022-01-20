const Discord = require('discord.js');

module.exports = {
    name: 'Join Logger',
    run(client) {
        client.joins = new Discord.Collection();

        client.on('guildMemberAdd', member => {
            if (member.user.bot) return;

            let cache = client.joins.get(member.guild.id) || [];
            if (cache.length == 1000) cache.shift();

            if (!cache.includes(member.id)) cache.push(member.id);

            client.joins.set(member.guild.id, cache)
        });
    }
}