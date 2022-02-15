const { successEmbed, failEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'addab',
    group: 'Moderation',
    description: 'Add a user to Auto Ban.',
    hidden: true,
    guildOnly: true,

    // AUTHORIZATION
    guilds: ['912672204905385997'],
    users: ['244662779745665026'],
    
    async run(client, msg, args) {
        if (!args) {
            let noargs = failEmbed('You did not provided a user!', msg.author);
            return msg.reply({ embeds: [noargs] }).catch(() => msg.channel.send({ embeds: [noargs] }));
        }

        let user = await client.users.fetch(args).catch(() => { return });

        if (!user) {
            let nouser = failEmbed('The user provided is invalid!', msg.author);
            return msg.reply({ embeds: [nouser] }).catch(() => msg.channel.send({ embeds: [nouser] }));
        }

        if (msg.guild.members.cache.has(user.id)) {
            let exists = failEmbed('The user provided is already in the server!', msg.author);
            return msg.reply({ embeds: [exists] }).catch(() => msg.channel.send({ embeds: [exists] }));
        }

        let banned = await client.database.get(msg.guild.id, 'autobanned');
        if (!banned) banned = []

        if (banned.includes(user.id)) {
            let already = failEmbed('The user provided is already in the Auto Ban list!', msg.author);
            return msg.reply({ embeds: [already] }).catch(() => msg.channel.send({ embeds: [already] }));
        } else {
            banned.push(user.id);
            let set = await client.database.set(msg.guild.id, 'autobanned', banned);

            if (set) {
                let success = successEmbed('The user has been added to the Auto Ban list!', msg.author);
                return msg.reply({ embeds: [success] }).catch(() => msg.channel.send({ embeds: [success] }));
            } else {
                let fail = failEmbed('Failed to add the user to the Auto Ban list!', msg.author);
                return msg.reply({ embeds: [fail] }).catch(() => msg.channel.send({ embeds: [fail] }));
            }
        }
    }
};