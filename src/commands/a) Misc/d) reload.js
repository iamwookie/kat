module.exports = {
    name: 'reload',
    group: 'Misc',
    description: 'Refresh Commander.',
    hidden: true,
    users: ['244662779745665026'],
    async run(client, msg) {
        if (!client.commander) return msg.reply('Commander not found!').catch(() => msg.channel.send('Commander not found!'));

        await client.commander.reload(msg);
        
        msg.reply('✅ Commander reloaded.').catch(() => msg.channel.send('✅ Commander reloaded.'));
    }
};