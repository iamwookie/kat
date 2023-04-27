import { Event, KATClient as Client, Commander } from '@structures/index.js';
import { Events, Client as DiscordClient, TextChannel } from 'discord.js';
import { ActionEmbed } from '@utils/embeds/action.js';

import chalk from 'chalk';

export class ClientReady extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.ClientReady);
    }

    async execute(client: DiscordClient) {
        for (const module of this.commander.modules.values()) module.onReady(client);

        await this.client.server.initialize();
        console.log(chalk.greenBright.bold.underline(`>>> Server Initialized (Port: ${this.client.server.port})`));

        // Move to a method in the future
        const res = await this.client.prisma.queue.findMany({});

        if (res.length) {
            this.client.logger.info(`Warning ${res.length} Subscriptions`, 'Music');

            for (const queue of res) {
                if (!queue.active || !queue.textId) continue;

                const channel = client.channels.cache.get(queue.textId) as TextChannel;
                if (!channel) continue;

                try {
                    await channel.send({
                        embeds: [new ActionEmbed('warn').setText('The bot has restarted, please replay your track.')],
                    });
                    this.client.logger.info(`Music >> Warning Sent To: ${channel.guild.name} (${channel.guild.id})`);
                } catch {
                    this.client.logger.warn(
                        `Music >> Failed To Send Warning To: ${channel.guild.name} (${channel.guild.id})`
                    );
                }
            }

            await this.client.prisma.queue.updateMany({
                where: {
                    active: true,
                },
                data: {
                    active: false,
                },
            });

            this.client.logger.info(`Queues Set To Inactive`, 'Music');
        }
        // ----------------------------

        console.log(
            chalk.magenta.bold.underline(
                `\n---- >>> App Online, Client: ${client.user?.tag} (${client.user?.id}) [Version: ${this.client.config.version}] [Guilds: ${client.guilds.cache.size}]`
            )
        );
        console.log(chalk.magenta.bold.underline(`---- >>> App Loaded In: ${Date.now() - this.client.startTime}ms`));
    }
}
