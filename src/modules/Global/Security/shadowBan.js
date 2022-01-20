const Discord = require('discord.js');
const banned = [
    '204308161732149248' // R
]

module.exports = {
    name: 'Shadow Ban',
    run(client) {
        client.joins = new Discord.Collection();

        client.on('guildMemberAdd', async member => {
            if (member.guild.id !== '912672204905385997') return;

            if (banned.includes(member.id)) {
                const channel = await client.channels.fetch('915896451484254218').catch(console.error);
                channel.permissionOverwrites.create(
                    member,
                    {
                        VIEW_CHANNEL: false
                    }
                ).catch(console.error)
            }
        });
    }
}