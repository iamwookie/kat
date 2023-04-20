import { Event, KATClient as Client, Commander } from "@structures/index.js";
import { Events, Client as DiscordClient, TextBasedChannel, TextChannel } from "discord.js";
import { ActionEmbed } from "@utils/embeds/action.js";

import chalk from "chalk";

export class ClientReady extends Event {
    constructor(client: Client, commander: Commander) {
        super(client, commander, Events.ClientReady);
    }

    async execute(client: DiscordClient) {
        this.commander.modules.forEach((module) => module.onReady(client));

        await this.client.server.initialize();
        console.log(chalk.greenBright.bold.underline(`>>> Server Initialized (Port: ${this.client.server.port})`));

        // Move to a method in the future
        const res = await this.client.prisma.subscription.findMany();

        if (res.length) {
            this.client.logger.info(`Music >> Warning ${res.length} Subscriptions`);

            for (const subscription of res) {
                if (!subscription.textId) continue;

                const channel = client.channels.cache.get(subscription.textId) as TextChannel;
                if (!channel) continue;

                try {
                    await channel.send({ embeds: [new ActionEmbed("warn").setText("The bot has restarted, please replay your track.")] });
                    this.client.logger.info(`Music >> Warning Sent To: ${channel.guild.name} (${channel.guild.id})`);
                } catch {
                    this.client.logger.warn(`Music >> Failed To Send Warning To: ${channel.guild.name} (${channel.guild.id})`);
                }
            }

            this.client.logger.info(`Music >> Warnings Sent`);
            await this.client.prisma.subscription.deleteMany();
            this.client.logger.info(`Music >> Subscriptions Cleared`);
        }
        // ----------------------------

        console.log(chalk.magenta.bold.underline(`\n---- >>> App Online, Client: ${client.user?.tag} (${client.user?.id}) [Guilds: ${client.guilds.cache.size}]`));
        console.log(chalk.magenta.bold.underline(`---- >>> App Loaded In: ${Date.now() - this.client.startTime}ms`));
    }
}
