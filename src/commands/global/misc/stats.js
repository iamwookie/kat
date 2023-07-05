!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="10d486f9-6597-5b5b-9575-766667640c8b")}catch(e){}}();
import { Command } from '../../../structures/index.js';
import { EmbedBuilder } from 'discord.js';
import { formatBytes, formatDuration } from '../../../utils/helpers.js';
export class StatsCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'stats',
            module: 'Misc',
            legacy: true,
            description: {
                content: 'Show app statistics.',
            },
            allowDM: true,
            users: [],
            hidden: true,
        });
    }
    async execute(int) {
        const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('Statistics')
            .addFields({ name: 'Uptime', value: `\`${formatDuration(this.client.uptime)}\``, inline: true }, { name: 'WS Ping', value: `\`${this.client.ws.ping}\``, inline: true }, { name: 'Memory Usage', value: `\`${formatBytes(process.memoryUsage().heapUsed)}\``, inline: true }, { name: 'Guilds', value: `\`${this.client.guilds.cache.size}\``, inline: true }, {
            name: 'Users',
            value: `\`${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}\``,
            inline: true,
        }, { name: 'Version', value: `\`${this.client.config.version}\``, inline: true }, 
        // Might use a flag for subscription size in the future
        { name: 'Active Queues', value: `\`${this.client.dispatcher.subscriptions.size}\``, inline: true });
        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (subscription)
            embed.addFields({ name: 'Guild Node', value: `\`${subscription.node.name}\``, inline: true });
        this.commander.reply(int, { embeds: [embed] });
    }
}
//# debugId=10d486f9-6597-5b5b-9575-766667640c8b
//# sourceMappingURL=stats.js.map
