module.exports = {
    name: 'reload',
    group: 'CLI',
    run(client) {
        if (!client.commander) return console.log('❌ Commander not found.\n');

        client.commander.reload();
        console.log('✅ Commander reloaded.\n');
    }
};