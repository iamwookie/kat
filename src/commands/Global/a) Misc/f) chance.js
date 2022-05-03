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
    group: 'Misc',
    description: 'Chances at getting someone.',
    format: '<?user>',
    guildOnly: true,

    // SLASH
    data() {
        return (
            new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addMentionableOption(option => {
                option.setName('user');
                option.setDescription('The user to analyze.');
                return option;
            })
        )
    },
    

    async run(client, int) {
        // usageCount.inc();
        // ------------
        let calculation = Math.round(Math.random() * 100);
        let reply = new Discord.MessageEmbed()
        .setTitle(`:smirk: \u200b ${int.user.username}\'s Chances`)
        .setDescription(`${calculation}%`)
        .setColor('RANDOM')
        .setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL({ dynamic: true }) });

        let mention = int.options.getMentionable('user');

        if (mention) {
            if(mention instanceof Discord.GuildMember) {
                reply.setTitle(`:smirk: \u200b ${mention.user.username}\'s Chances`);
                if (mention.user.id == client.user.id) {
                    let res = ':no_entry: ERROR: The measurement values are invalid.'
                    return int.editReply(res);
                }
            } else {
                let noMention = failEmbed('You have not mentioned a valid user!', int.user);
                return int.editReply({ embeds: [noMention] });
            }
        }

        int.editReply({ embeds: [reply] });
    }
};