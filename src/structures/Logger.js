import Sentry from "@sentry/node";
import { ErrorEmbed } from "../utils/embeds/index.js";
import chalk from "chalk";
export class Logger {
    client;
    constructor(client) {
        this.client = client;
        this.client = client;
        console.log(chalk.greenBright.bold.underline(">>> Logger Initialized!"));
    }
    async notify(eventId) {
        try {
            const dev = this.client.users.cache.get(this.client.devId);
            const embed = new ErrorEmbed(eventId);
            await dev?.send({ embeds: [embed] });
        }
        catch (err) {
            console.error(chalk.red("Logger (ERROR): Error Warning Dev!"));
            console.error(err);
        }
    }
    fatal(err) {
        const eventId = Sentry.captureException(err);
        console.error(chalk.red(`Logger (FATAL) (${eventId}): A Fatal Error Has Occured!`));
        console.error(err);
        if (this.client.readyTimestamp)
            this.notify(eventId);
        process.exit();
    }
    error(err) {
        const eventId = Sentry.captureException(err);
        console.error(chalk.red(`Logger (ERROR) (${eventId}): An Error Has Occured!`));
        console.error(err);
        if (this.client.readyTimestamp)
            this.notify(eventId);
        return eventId;
    }
    warn(msg) {
        console.warn(chalk.yellow("Logger (WARN): " + msg));
    }
    info(msg) {
        console.log(chalk.green("Logger (INFO): " + msg));
    }
    debug(msg) {
        console.log(chalk.blue("Logger (DEBUG): " + msg));
    }
}
