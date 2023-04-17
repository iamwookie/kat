import { KATClient as Client } from "./Client.js";
import Sentry from "@sentry/node";
import { ErrorEmbed } from "@utils/embeds/index.js";

import chalk from "chalk";

export class Logger {
    constructor(
        private client: Client
    ) {
        console.log(chalk.greenBright.bold.underline(">>> Logger Initialized!"));
    }

    private async notify(eventId: string) {
        try {
            const dev = this.client.users.cache.get(this.client.devId);
            const embed = new ErrorEmbed(eventId);
            
            await dev?.send({ embeds: [embed] });
        } catch (err) {
            console.error(chalk.red("Logger (ERROR): Error Warning Dev!"));
            console.error(err);
        }
    }

    fatal(err: any): void {
        const eventId = Sentry.captureException(err);

        console.error(chalk.redBright(`Logger (FATAL) (${eventId}): A Fatal Error Has Occured!`));
        console.error(err);

        if (this.client.isReady()) this.notify(eventId);

        process.exit();
    }

    uncaught(err: any): string {
        const eventId = Sentry.captureException(err);

        console.error(chalk.redBright(`Logger (UNCAUGHT) (${eventId}): An Uncaught Error Has Occured!`));
        console.error(err);

        if (this.client.isReady()) this.notify(eventId);

        return eventId;
    }

    error(err: any): string {
        const eventId = Sentry.captureException(err);

        console.error(chalk.red(`Logger (ERROR) (${eventId}): An Error Has Occured!`));
        console.error(err);

        if (this.client.isReady()) this.notify(eventId);

        return eventId;
    }

    warn(msg: string): void {
        console.log(chalk.yellow("Logger (WARN): " + msg));
    }

    info(msg: string): void {
        console.log(chalk.green("Logger (INFO): " + msg));
    }

    debug(msg: string): void {
        console.log(chalk.blue("Logger (DEBUG): " + msg));
    }
}