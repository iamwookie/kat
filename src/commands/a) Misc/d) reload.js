module.exports = {
    name: 'reload',
    hidden: true,
    description: 'Refresh Commander.',
    group: 'Misc',
    users: [
        '244662779745665026'
    ],
    run(client, msg) {
        if (!client.commander) return msg.reply('Commander not found!');

        client.commander.reload(msg);
        msg.reply('✅ Commander reloaded.')
    }
};