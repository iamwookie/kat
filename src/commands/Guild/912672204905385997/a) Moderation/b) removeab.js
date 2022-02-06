const { successEmbed, failEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'removeab',
    group: 'Moderation',
    description: 'Remove a user from Auto Ban.',
    hidden: true,

    // AUTHORIZATION
    guilds: ['912672204905385997'],
    users: ['244662779745665026'],
    
    async run(client, msg, args) {
        if (!args) {
            const noargs = failEmbed('You did not provided a user!', msg.author);
            return msg.reply({ embeds: [noargs] }).catch(() => msg.channel.send({ embeds: [noargs] }));
        }

        let user = await client.users.fetch(args).catch(() => { return });

        if (!user) {
            const nouser = failEmbed('The user provided is invalid!', msg.author);
            return msg.reply({ embeds: [nouser] }).catch(() => msg.channel.send({ embeds: [nouser] }));
        }

        let banned = await client.database.get(msg.guild.id, 'autobanned');
        if (!banned) banned = []

        if (!banned.includes(user.id)) {
            const notfound = failEmbed('The user provided is not in the Auto Ban list!', msg.author);
            return msg.reply({ embeds: [notfound] }).catch(() => msg.channel.send({ embeds: [notfound] }));
        } else {
            banned.splice(banned.indexOf(user.id), 1);

            if (banned.length) {
                set = await client.database.set(msg.guild.id, 'autobanned', banned);
            } else {
                set = await client.database.delete(msg.guild.id, 'autobanned');
            }

            if (set) {
                const success = successEmbed('The user has been removed from the Auto Ban list!', msg.author);
                return msg.reply({ embeds: [success] }).catch(() => msg.channel.send({ embeds: [success] }));
            } else {
                const fail = failEmbed('Failed to remove the user from the Auto Ban list!', msg.author);
                return msg.reply({ embeds: [fail] }).catch(() => msg.channel.send({ embeds: [fail] }));
            }
        }
    }
};