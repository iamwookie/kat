module.exports = {
    name: 'reload',
    group: 'Misc',
    description: 'Refresh Commander.',
    hidden: true,
    users: ['244662779745665026'],
    run(client, msg) {
        if (!client.commander) return msg.reply('Commander not found!');

        client.commander.reload(msg);
        msg.reply('✅ Commander reloaded.')
    }
};