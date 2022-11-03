const ActionEmbed = require('@utils/embeds/action');

module.exports = {
    name: 'Auto Ban',
    guilds: ['912672204905385997'],
    run(client) {
        client.on('guildMemberAdd', async member => {
            if (!client.database) return;
            if (!this.guilds.includes(member.guild.id)) return;

            let banned = await client.database.get(member.guild.id, 'autobanned');
            if (!banned) return;

            if (banned.includes(member.id)) {
                const notallowed = new ActionEmbed('fail', `You have been auto banned from ${member.guild.name}. We do not want you here!`, member.user);
                await member.send({ embeds: [notallowed] }).catch(err => {
                    console.error(`Guild Modules (ERROR) (${this.guilds[0]}) >> Auto Ban: Failed To Send Banned DM`.red);
                    console.error(err);
                });
                member.ban({ reason: 'Shadow Ban (CAT)' }).catch(err => {
                    console.error(`Guild Modules (ERROR) (${this.guilds[0]}) >> Auto Ban: Failed To Ban User: ${member.id}`.red);
                    console.error(err);
                });
            }
        });
    }
};