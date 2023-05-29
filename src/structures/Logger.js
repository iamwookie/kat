import Sentry from '@sentry/node';
import { ErrorEmbed } from '../utils/embeds/index.js';
import chalk from 'chalk';
export class Logger {
    client;
    constructor(client) {
        this.client = client;
        console.log(chalk.greenBright.bold.underline('>>> Logger Initialized!'));
    }
    fatal(err, message, scope) {
        const eventId = Sentry.captureException(err);
        console.error(chalk.red(`${scope ? `${scope} ` : ''}(FATAL) (${eventId}): ${message ?? 'An Error Has Occurred!'}`));
        console.error(err);
        if (this.client.isReady())
            this.notify(new ErrorEmbed(eventId));
        process.exit();
    }
    uncaught(err) {
        const eventId = Sentry.captureException(err);
        console.error(chalk.redBright(`(UNCAUGHT) (${eventId}): An Uncaught Error Has Occured!`));
        console.error(err);
        if (this.client.isReady())
            this.notify(new ErrorEmbed(eventId));
        return eventId;
    }
    error(err, message, scope) {
        const eventId = Sentry.captureException(err);
        console.error(chalk.red(`${scope ? `${scope} ` : ''}(ERROR) (${eventId}): ${message ?? 'An Error Has Occurred!'}`));
        console.error(err);
        if (this.client.isReady())
            this.notify(new ErrorEmbed(eventId));
        return eventId;
    }
    warn(message, scope) {
        console.log(chalk.yellow('(WARN): ' + (scope ? scope + ' >> ' : '') + message));
    }
    info(message, scope) {
        console.log(chalk.green('(INFO): ' + (scope ? scope + ' >> ' : '') + message));
    }
    debug(message) {
        console.log(chalk.blue('(DEBUG): ' + message));
    }
    async notify(embed) {
        for (const devId of this.client.config.devs) {
            try {
                const dev = await this.client.users.fetch(devId);
                await dev.send({ embeds: [embed] });
            }
            catch (err) {
                console.error(chalk.red('(ERROR): Error Warning Dev!'));
                console.error(err);
            }
        }
    }
}
