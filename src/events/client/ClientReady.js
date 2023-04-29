import { Event } from '../../structures/index.js';
import { Events } from 'discord.js';
import { ActionEmbed } from '../../utils/embeds/action.js';
import { MusicPrompts } from '../../../enums.js';
import chalk from 'chalk';
export class ClientReady extends Event {
    constructor(client, commander) {
        super(client, commander, Events.ClientReady);
    }
    async execute(client) {
        for (const module of this.commander.modules.values())
            module.onReady(client);
        await this.client.server.initialize();
        console.log(chalk.greenBright.bold.underline(`>>> Server Initialized (Port: ${this.client.server.port})`));
        // Move to a method in the future (maybe :/)
        const res = await this.client.prisma.queue.findMany({
            where: {
                active: true,
            },
        });
        if (res.length) {
            this.client.logger.info(`Warning ${res.length} Queue(s)`, 'Music');
            for (const queue of res) {
                if (!queue.active || !queue.textId)
                    continue;
                const channel = client.channels.cache.get(queue.textId);
                if (!channel)
                    continue;
                try {
                    await channel.send({
                        embeds: [new ActionEmbed('warn').setText(MusicPrompts.Restarted)],
                    });
                    this.client.logger.info(`Warning Sent To: ${channel.guild.name} (${channel.guild.id})`, 'Music');
                }
                catch {
                    this.client.logger.warn(`Failed To Send Warning To: ${channel.guild.name} (${channel.guild.id})`, 'Music');
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
            this.client.logger.info(`Queue(s) Set To Inactive`, 'Music');
        }
        // ----------------------------
        console.log(chalk.magenta.bold.underline(`\n---- >>> App Online, Client: ${client.user?.tag} (${client.user?.id}) [Version: ${this.client.config.version}] [Guilds: ${client.guilds.cache.size}]`));
        console.log(chalk.magenta.bold.underline(`---- >>> App Loaded In: ${Date.now() - this.client.startTime}ms`));
    }
}
