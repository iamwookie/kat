import Sentry from '@sentry/node';
import { ErrorEmbed } from '../utils/embeds/index.js';
import chalk from 'chalk';
export class Logger {
    client;
    constructor(client) {
        this.client = client;
        console.log(chalk.greenBright.bold.underline('>>> Logger Initialized!'));
    }
    fatal(err) {
        const eventId = Sentry.captureException(err);
        console.error(chalk.redBright(`(FATAL) (${eventId}): A Fatal Error Has Occured!`));
        console.error(err);
        if (this.client.isReady())
            this.notify(eventId);
        process.exit();
    }
    uncaught(err) {
        const eventId = Sentry.captureException(err);
        console.error(chalk.redBright(`(UNCAUGHT) (${eventId}): An Uncaught Error Has Occured!`));
        console.error(err);
        if (this.client.isReady())
            this.notify(eventId);
        return eventId;
    }
    error(err, message, scope) {
        const eventId = Sentry.captureException(err);
        console.error(chalk.red(`(ERROR) (${eventId}): An Error Has Occured!`));
        if (message && scope)
            console.error(chalk.red(`${scope} (ERROR) >> ${message}`));
        console.error(err);
        if (this.client.isReady())
            this.notify(eventId);
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
    async notify(eventId) {
        try {
            const dev = this.client.users.cache.get(this.client.devId);
            const embed = new ErrorEmbed(eventId);
            await dev?.send({ embeds: [embed] });
        }
        catch (err) {
            console.error(chalk.red('Logger (ERROR): Error Warning Dev!'));
            console.error(err);
        }
    }
}
