import { Command } from '../../../structures/index.js';
import { SlashCommandBuilder } from 'discord.js';
import { ActionEmbed, MusicEmbed } from '../../../utils/embeds/index.js';
export class SkipCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: 'skip',
            module: 'Music',
            legacy: true,
            description: {
                content: 'Skip the track.',
            },
            cooldown: 5,
        });
    }
    data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description?.content)
            .setDMPermission(false);
    }
    async execute(int) {
        const author = this.getAuthor(int);
        const subscription = this.client.subscriptions.get(int.guildId);
        if (!subscription || !subscription.active || subscription.paused)
            return this.reply(int, { embeds: [new ActionEmbed('fail').setText('The queue is empty or does not exist!')] });
        if (subscription.queue.length == 0)
            return this.reply(int, { embeds: [new ActionEmbed('fail').setText('This is the last track in the queue!')] });
        this.applyCooldown(author);
        const next = subscription.queue[0];
        const embed = new MusicEmbed(subscription).setUser(author).setPlaying(next).setSkipped(subscription.active);
        subscription.stop();
        this.reply(int, { embeds: [embed] });
    }
}
