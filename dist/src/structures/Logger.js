import fs from "fs";
import Sentry from "@sentry/node";
import chalk from "chalk";
import { ErrorEmbed } from "../utils/embeds/index.js";
export class Logger {
    client;
    lastIp;
    constructor(client) {
        this.client = client;
        this.client = client;
        console.log(chalk.greenBright.bold.underline(">>> Logger Initialized!"));
    }
    async notify(eventId) {
        try {
            const dev = await this.client.users.fetch(this.client.devId);
            const embed = new ErrorEmbed(eventId);
            await dev.send({ embeds: [embed] });
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
        this.notify(eventId);
        process.exit();
    }
    error(err) {
        const eventId = Sentry.captureException(err);
        console.error(chalk.red(`Logger (ERROR) (${eventId}): An Error Has Occured!`));
        console.error(err);
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
    request(req, scope, err) {
        if (err)
            this.error(err);
        const time = Date.now();
        if (this.lastIp && this.lastIp == req.ip)
            return console.log(chalk.red("Logger (REQUEST): Received Duplicate Request"));
        this.lastIp = req.ip;
        fs.appendFile(`./${scope}.log`, `CODE: "${time}" IP: "${req.ip} ${err ? "\nERROR: " + err.stack : ""}\n`, async (e) => {
            if (e)
                this.error(e);
            return console.log(chalk.yellow(`Logger (REQUEST): Logged Request >> SCOPE: ${scope} CODE: ${time}, IP: ${req.ip}`));
        });
    }
}
