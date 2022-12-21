const { EmbedBuilder } = require('@discordjs/builders');

const Sentry = require('@sentry/node');
require('@sentry/tracing');

class CommanderLogger {
    constructor(client) {
        this.client = client;
        this.sentry = Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV,
            maxBreadcrumbs: 50
        });

        console.log('>>> Logger Initialized!'.brightGreen.bold.underline);
    }

    fatal(err) {
        const eventId = Sentry.captureException(err);

        console.error(`Logger (FATAL) (${eventId}): A Fatal Error Has Occured!`.red);
        console.error(err);

        this.warnDev(eventId);

        process.exit();
    }

    error(err) {
        const eventId = Sentry.captureException(err);

        console.error(`Logger (ERROR) (${eventId}): An Error Has Occured!`.red);
        console.error(err);

        this.warnDev(eventId);
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

    async warnDev(eventId) {
        try {
            const dev = await this.client.users.fetch(this.client.dev);

            const embed = new EmbedBuilder()
                .setColor('#F04947')
                .setTitle('Uh Oh!')
                .setDescription(`A error in the internal code has occured.`)
                .addFields([{ name: 'Event ID', value: `\`${eventId}\``, inline: true }])
                .setThumbnail('https://icon-library.com/images/image-error-icon/image-error-icon-17.jpg');

            await dev.send({ embeds: [embed] }).catch(() => { return; });
        } catch (err) {
            console.error('Logger (ERROR) >> Error Warning Dev!'.red);
            console.error(err);
        }
    }
}

module.exports = CommanderLogger;