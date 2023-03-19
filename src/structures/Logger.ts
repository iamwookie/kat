import { KATClient } from "./index.js";

import fs from "fs";
import Sentry from "@sentry/node";
import chalk from "chalk";

import { ErrorEmbed } from "@utils/embeds/index.js";

export class Logger {
    private lastIp?: string;

    constructor(
        private client: KATClient
    ) {
        this.client = client;
        console.log(chalk.greenBright.bold.underline(">>> Logger Initialized!"));
    }

    private async notify(eventId: string) {
        try {
            const dev = await this.client.users.fetch(this.client.devId);
            const embed = new ErrorEmbed(eventId);

            await dev.send({ embeds: [embed] });
        } catch (err) {
            console.error(chalk.red("Logger (ERROR): Error Warning Dev!"));
            console.error(err);
        }
    }

    fatal(err: Error | unknown): void {
        const eventId = Sentry.captureException(err);

        console.error(chalk.red(`Logger (FATAL) (${eventId}): A Fatal Error Has Occured!`));
        console.error(err);

        this.notify(eventId);

        process.exit();
    }

    error(err: Error | unknown): string {
        const eventId = Sentry.captureException(err);

        console.error(chalk.red(`Logger (ERROR) (${eventId}): An Error Has Occured!`));
        console.error(err);

        this.notify(eventId);

        return eventId;
    }

    warn(msg: string): void {
        console.warn(chalk.yellow("Logger (WARN): " + msg));
    }

    info(msg: string): void {
        console.log(chalk.green("Logger (INFO): " + msg));
    }

    debug(msg: string): void {
        console.log(chalk.blue("Logger (DEBUG): " + msg));
    }

    

    request(req: any, scope: 'access' | 'error', err?: Error | unknown): void {
        if (err) this.error(err);

        const time = Date.now();

        if (this.lastIp && this.lastIp == req.ip) return console.log(chalk.red("Logger (REQUEST): Received Duplicate Request"));
        this.lastIp = req.ip;

        fs.appendFile(`./${scope}.log`, `CODE: "${time}" IP: "${req.ip} ${err ? "\nERROR: " + (err as Error).stack : ""}\n`, async e => {
            if (e) this.error(e);

            return console.log(chalk.yellow(`Logger (REQUEST): Logged Request >> SCOPE: ${scope} CODE: ${time}, IP: ${req.ip}`));
        });
    }
}