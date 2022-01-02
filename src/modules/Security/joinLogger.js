module.exports = {
    name: 'Join Logger',
    run(client) {
        client.joinCache = []

        client.on('guildMemberAdd', member => {
            if (client.joinCache >= 1000) { client.joinCache.shift(); }
            client.joinCache.push(member);
        });
    }
}