const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { successEmbed, failEmbed } = require('@utils/other/embeds');

module.exports = {
    name: 'prefix',
    group: 'Misc',
    description: 'Change the bot prefix. [Admin Only]',
    format: '<new prefix>',
    cooldown: 5,
    guildOnly: true,

    // SLASH
    data() {
        let data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option => {
            option.setName('prefix');
            option.setDescription('The prefix to set.');
            option.setRequired(true);
            return option;
        });
        return data;
    },

    async run(client, msg, args) {
        let author = msg instanceof Discord.CommandInteraction? msg.user : msg.author;

        if (!msg.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) && msg.member.id !== client.dev) {
            const noperms = failEmbed('You do not have permission for that!', author);
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [noperms] }) : msg.reply({ embeds: [noperms] }).catch(() => msg.channel.send({ embeds: [noperms] }));
        }

        if (!args && !msg instanceof Discord.CommandInteraction) {
            const noargs = failEmbed('You did not provide a prefix!', author);
            return msg.reply({ embeds: [noargs] }).catch(() => msg.channel.send({ embeds: [noargs] }));
        }

        let prefix = msg instanceof Discord.CommandInteraction? msg.options.getString('prefix').split(' ')[0] : args.split(' ')[0];
        let set = false;
        
        if (prefix == client.prefix) {
            set = await client.database.delete(msg.guildId, 'prefix');
        } else {
            set = await client.database.set(msg.guildId, 'prefix', prefix);
        }

        if (set) {
            let success = successEmbed(`The prefix has been updated to: \`${prefix}\``, author);
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [success] }) : msg.reply({ embeds: [success] }).catch(() => msg.channel.send({ embeds: [success] }));
        } else {
            console.error('Global Commands (ERROR) >> prefix: Error Setting Prefix');
            let fail = failEmbed(`Something went wrong when trying to set the prefix. Try later!`, author);
            return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [fail] }) : msg.reply({ embeds: [fail] }).catch(() => msg.channel.send({ embeds: [fail] }));
        }
    }
};