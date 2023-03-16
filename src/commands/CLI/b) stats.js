const { formatTime, formatBytes } = require('@utils/formatters');

module.exports = {
    name: 'stats',
    group: 'CLI',
    aliases: ['botinfo', 'botstats', 'bot'],

    run(client) {
        console.log('----- APP STATS -----'.brightGreen);
        console.log(`Uptime: ${formatTime(client.uptime)}`.brightGreen);
        console.log(`RAM Usage (Process): ${formatBytes(process.memoryUsage().heapUsed)}`.brightGreen);
        console.log(`WS Ping: ${client.ws.ping}`.brightGreen);
        console.log(`Total Guilds: ${client.guilds.cache.size}`.brightGreen);
        console.log(`Total Users: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`.brightGreen);
        console.log('---------------------'.brightGreen);
    }
};