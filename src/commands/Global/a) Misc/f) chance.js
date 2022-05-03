const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { failEmbed } = require('@utils/other/embeds');

/*
const io = require('@pm2/io');
const usageCount = io.counter({
    name: 'PPs Measured',
    id: 'usage/commands/pp'
});
*/

module.exports = {
    name: 'chance',
    aliases: { 'chances': false },
    group: 'Misc',
    description: 'Chances at getting someone.',
    format: '<?user>',
    guildOnly: true,

    // SLASH
    data() {
        let data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addMentionableOption(option => {
            option.setName('user');
            option.setDescription('The user to analyze.');
            return option;
        });
        return data;
    },
    

    async run(client, msg, args) {
        // usageCount.inc();
        // ------------
        let author = msg instanceof Discord.CommandInteraction? msg.user : msg.author;
        let calculation = Math.round(Math.random() * 100);
        let reply = new Discord.MessageEmbed()
        .setTitle(`:smirk: \u200b ${author.username}\'s Chances`)
        .setDescription(`${calculation}%`)
        .setColor('RANDOM')
        .setAuthor({ name: author.tag, iconURL: author.avatarURL({ dynamic: true }) });

        if (msg instanceof Discord.CommandInteraction? msg.options.getMentionable('user') : args) {
            let mention = msg instanceof Discord.CommandInteraction? msg.options.getMentionable('user') : msg.mentions.members.first();
            if(mention instanceof Discord.GuildMember) {
                reply.setTitle(`:smirk: \u200b ${mention.user.username}\'s Chances`);
                if (mention.user.id == client.user.id) {
                    let res = ':no_entry: ERROR: The measurement values are invalid.'
                    return msg instanceof Discord.CommandInteraction? msg.editReply(res) : msg.reply(res).catch(() => msg.channel.send(res));
                }
            } else {
                let noMention = failEmbed('You have not mentioned a valid user!', author);
                return msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [noMention] }) : msg.reply({ embeds: [noMention] }).catch(() => msg.channel.send({ embeds: [noMention] }));
            }
        }

        msg instanceof Discord.CommandInteraction? msg.editReply({ embeds: [reply] }) : msg.reply({ embeds: [reply] }).catch(() => msg.channel.send({ embeds: [reply] }));
    }
};