module.exports = {
    name: 'stats',
    group: 'CLI',
    run(client) {
        console.log('----- APP STATS -----'.brightGreen);
        console.log(`Uptime: ${formatTime(client.uptime)}`.brightGreen);
        console.log(`RAM Usage (Process): ${formatBytes(process.memoryUsage().heapUsed)}`.brightGreen);
        console.log(`WS Ping: ${client.ws.ping}`.brightGreen);
        console.log(`Total Guilds: ${client.guilds.cache.size}`.brightGreen);
        console.log(`Total Users: ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`.brightGreen);
        console.log('---------------------'.brightGreen);
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

function formatBytes(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}