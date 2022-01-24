const { failEmbed } = require('@utils/other/embeds');
// -----------------------------------
const banned = [
    // '204308161732149248', // R
    '263601154242379777', // E
]

module.exports = {
    name: 'Shadow Ban',
    guilds: ['912672204905385997'],
    run(client) {
        client.on('guildMemberAdd', async member => {
            if (!this.guilds.includes(member.guild.id)) return;

            if (banned.includes(member.id)) {
                const notallowed = failEmbed(`You have been auto banned from ${member.guild.name}. We do not want you here!`, member.user);
                await member.send({ embeds: [notallowed] }).catch(err => { console.log(`Guild Modules (ERROR) (${this.guilds[0]}) >> Shadow Ban: Failed To Send Banned DM`.red); console.log(err); });
                member.ban({ reason: 'Shadow Ban (CAT)'}).catch(err => { console.log(`Guild Modules (ERROR) (${this.guilds[0]}) >> Shadow Ban: Failed To Ban User: ${member.id}`.red); console.log(err); });
            }
        });
    }
}