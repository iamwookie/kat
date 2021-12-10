const Discord = require('discord.js')
const { successEmbed, failEmbed } = require('@utils/embeds')

module.exports = {
    name: 'Mobile Verification',
    run(client) {
        client.on('guildMemberAdd', member => {
            if (member.presence.clientStatus.web) {
                let embed = successEmbed('Heya! \n \nWe noticed you are on a mobile device! In order to verify you on a mobile device, press the button below. By pressing the button below, you agree to having read the rules and abiding by them. \n \nEnjoy your stay!')
                let row = new Discord.MessageActionRow().addComponents(
                    new Discord.MessageButton()
                    .setCustomId('verify')
                    .setStyle('SUCCESS')
                    .setLabel('Verify')
                )

                member.send({embeds: [embed], components: [row]}).then(msg => {
                    msg.awaitMessageComponent({componentType: 'BUTTON'}).then(async i => {
                        if (member.roles.cache.has('912672204905385998')) {
                            await msg.edit({components: []});
                            let fail = failEmbed("You are already verified! Enjoy your stay!");
                            return i.reply({embeds: [fail]});
                        } else {
                            await member.roles.add('912672204905385998');
                            await msg.edit({components: []});
                            let success = successEmbed('Successfuly verified! Enjoy your stay!');
                            return i.reply({embeds: [success]})
                        }
                    }).catch(console.error)
                }).catch(() => { console.log('[ERROR] Mobile Verification: DMS Are Closed For User: ' + member.user.tag) })
            }
        })
    }
}