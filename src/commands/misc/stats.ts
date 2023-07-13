import { KATClient as Client, Commander, Command } from '@structures/index.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { formatBytes, formatDuration } from '@utils/helpers.js';

export class StatsCommand extends Command {
    constructor(client: Client, commander: Commander) {
        super(client, commander, {
            name: 'stats',
            module: 'Misc',
            description: {
                content: 'Show app statistics.',
            },
            allowDM: true,
            users: [],
            hidden: true,
            disabled: true,
        });
    }

    async execute(int: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('Statistics')
            .addFields(
                { name: 'Uptime', value: `\`${formatDuration(this.client.uptime)}\``, inline: true },
                { name: 'WS Ping', value: `\`${this.client.ws.ping}\``, inline: true },
                { name: 'Memory Usage', value: `\`${formatBytes(process.memoryUsage().heapUsed)}\``, inline: true },
                { name: 'Guilds', value: `\`${this.client.guilds.cache.size}\``, inline: true },
                {
                    name: 'Users',
                    value: `\`${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}\``,
                    inline: true,
                },
                { name: 'Version', value: `\`${this.client.config.version}\``, inline: true },
                // Might use a flag for subscription size in the future
                { name: 'Active Queues', value: `\`${this.client.dispatcher.subscriptions.size}\``, inline: true }
            );

        const subscription = this.client.dispatcher.getSubscription(int.guild);
        if (subscription) embed.addFields({ name: 'Guild Node', value: `\`${subscription.node.name}\``, inline: true });

        int.editReply({ embeds: [embed] });
    }
}
