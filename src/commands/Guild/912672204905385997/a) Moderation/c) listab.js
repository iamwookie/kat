const { successEmbed, failEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'listab',
    group: 'Moderation',
    description: 'List the Auto Ban list.',
    guildOnly: true,

    // AUTHORIZATION
    guilds: ['912672204905385997'],
    users: ['244662779745665026'],
    
    async run(client, msg) {
        let banned = await client.database.get(msg.guild.id, 'autobanned');

        if (!banned || !banned.length) {
            let nolist = failEmbed('The Auto Ban list is empty!', msg.author);
            return msg.reply({ embeds: [nolist] }).catch(() => msg.channel.send({ embeds: [nolist] }));
        }

        let listEmbed = successEmbed('Auto Ban List', msg.author);
        listEmbed.setDescription(banned.map((id, index) => `${index + 1}) <@${id}>`).join('\n'));
        listEmbed.setFooter({ text: msg.guild.name, iconURL: msg.guild.iconURL({ dynamic: true }) });

        return msg.reply({ embeds: [listEmbed] }).catch(() => msg.channel.send({ embeds: [listEmbed] }));
    }
};