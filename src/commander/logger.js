const fs = require('fs');

const Sentry = require('@sentry/node');

const { EmbedBuilder } = require('discord.js');

class CommanderLogger {
    constructor(client) {
        this.client = client;

        console.log('>>> Logger Initialized!'.brightGreen.bold.underline);
    }

    async #notify(eventId) {
        try {
            const dev = await this.client.users.fetch(this.client.dev);

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Uh Oh!')
                .setDescription(`A error in the internal code has occured.`)
                .addFields([{ name: 'Event ID', value: `\`${eventId}\``, inline: true }]);

            await dev.send({ embeds: [embed] }).catch(() => { return; });
        } catch (err) {
            console.error('Logger (ERROR): Error Warning Dev!'.red);
            console.error(err);
        }
    }

    fatal(err) {
        const eventId = Sentry.captureException(err);

        console.error(`Logger (FATAL) (${eventId}): A Fatal Error Has Occured!`.red);
        console.error(err);

        this.#notify(eventId);

        process.exit();
    }

    error(err) {
        const eventId = Sentry.captureException(err);

        console.error(`Logger (ERROR) (${eventId}): An Error Has Occured!`.red);
        console.error(err);

        this.#notify(eventId);

        return eventId;
    }

    warn(msg) {
        console.warn('Logger (WARN): '.yellow + msg);
    }

    info(msg) {
        console.log('Logger (INFO): '.green + msg);
    }

    debug(msg) {
        console.log('Logger (DEBUG): '.blue + msg);
    }

    request(req, scope, error) {
        if (error) this.error(error);

        const time = Date.now();

        if (this.lastIp && this.lastIp == req.ip) return console.log('Logger (REQUEST): Received Duplicate Request'.red);

        this.lastIp = req.ip;

        fs.appendFile(`./${scope}.log`, `CODE: '${time}' IP: '${req.ip} ${error ? '\nERROR: ' + error.stack : ''}\n`, async (err) => {
            if (err) this.error(err);
            return console.log(`Logger (REQUEST): Logged Request >> SCOPE: ${scope} CODE: ${time}, IP: ${req.ip}`.yellow);
        });
    }
}

module.exports = CommanderLogger;