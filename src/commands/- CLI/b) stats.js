module.exports = {
    name: 'stats',
    group: 'CLI',
    run(client) {
        console.log('----- APP STATS -----');
        console.log('Uptime: ' + formatTime(client.uptime));
        console.log('Total Guilds: ' + client.guilds.cache.size);
        console.log('Total Users: ' + client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));
    }
};

function formatTime(ms) {
    let seconds = ms / 1000;
    const hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    const minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    return(hours +':' + minutes + ':' + parseInt(seconds));
}