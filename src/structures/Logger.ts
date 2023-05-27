import { KATClient as Client } from './Client.js';
import Sentry from '@sentry/node';
import { APIEmbed, JSONEncodable } from 'discord.js';
import { ErrorEmbed } from '@utils/embeds/index.js';

import chalk from 'chalk';

export class Logger {
    constructor(private client: Client) {
        console.log(chalk.greenBright.bold.underline('>>> Logger Initialized!'));
    }

    fatal(err: any, message?: string, scope?: string): void {
        const eventId = Sentry.captureException(err);

        console.error(chalk.red(`(FATAL) (${eventId}): An Error Has Occured!`));
        if (message && scope) console.error(chalk.red(`${scope} (FATAL) >> ${message}`));
        console.error(err);

        if (this.client.isReady()) this.notify(new ErrorEmbed(eventId));

        process.exit();
    }

    uncaught(err: any): string {
        const eventId = Sentry.captureException(err);

        console.error(chalk.redBright(`(UNCAUGHT) (${eventId}): An Uncaught Error Has Occured!`));
        console.error(err);

        if (this.client.isReady()) this.notify(new ErrorEmbed(eventId));

        return eventId;
    }

    error(err: any, message?: string, scope?: string): string {
        const eventId = Sentry.captureException(err);

        console.error(chalk.red(`(ERROR) (${eventId}): An Error Has Occured!`));
        if (message && scope) console.error(chalk.red(`${scope} (ERROR) >> ${message}`));
        console.error(err);

        if (this.client.isReady()) this.notify(new ErrorEmbed(eventId));

        return eventId;
    }

    warn(message: string, scope?: string): void {
        console.log(chalk.yellow('(WARN): ' + (scope ? scope + ' >> ' : '') + message));
    }

    info(message: string, scope?: string): void {
        console.log(chalk.green('(INFO): ' + (scope ? scope + ' >> ' : '') + message));
    }

    debug(message: string): void {
        console.log(chalk.blue('(DEBUG): ' + message));
    }

    async notify(embed: APIEmbed | JSONEncodable<APIEmbed>) {
        for (const devId of this.client.config.devs) {
            try {
                const dev = await this.client.users.fetch(devId);
                await dev.send({ embeds: [embed] });
            } catch (err) {
                console.error(chalk.red('(ERROR): Error Warning Dev!'));
                console.error(err);
            }
        }
    }
}
