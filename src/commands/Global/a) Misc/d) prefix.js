const Discord = require('discord.js');
const { successEmbed, failEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'prefix',
    group: 'Misc',
    description: 'Change the bot prefix.',
    format: '<new prefix>',
    cooldown: 5,
    guildOnly: true,
    async run(client, msg, args) {
        if (!msg.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
            const noperms = failEmbed('You do not have permission for that!', msg.author);
            return msg.reply({ embeds: [noperms] }).catch(() => msg.channel.send({ embeds: [noperms] }));
        }

        if (!args) {
            const noargs = failEmbed('You did not provide a prefix!', msg.author);
            return msg.reply({ embeds: [noargs] }).catch(() => msg.channel.send({ embeds: [noargs] }));
        }

        let prefix = args.split(' ')[0];
        
        const set = await client.database.set(msg.guildId, 'prefix', prefix);

        if (set) {
            let success = successEmbed(`The prefix has been updated to: \`${prefix}\``, msg.author);
            return msg.reply({ embeds: [success] }).catch(() => msg.channel.send({ embeds: [success] }));
        } else {
            console.log('Global Commands (ERROR) >> prefix: Error Setting Prefix');
            let fail = failEmbed(`Something went wrong when trying to set the prefix. Try later!`, msg.author);
            return msg.reply({ embeds: [fail] }).catch(() => msg.channel.send({ embeds: [fail] }));
        }
    }
};