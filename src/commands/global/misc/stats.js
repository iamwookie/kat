import { Command } from "../../../structures/index.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { formatBytes, formatDuration } from "../../../utils/helpers.js";
export class StatsCommand extends Command {
    constructor(client, commander) {
        super(client, commander, {
            name: "stats",
            group: "Misc",
            legacy: true,
            description: {
                content: "Show app statistics.",
            },
            hidden: true,
            users: [],
        });
    }
    data() {
        return new SlashCommandBuilder();
    }
    async execute(int) {
        const embed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Statistics")
            .addFields({ name: "Uptime", value: `\`${formatDuration(this.client.uptime)}\``, inline: true }, { name: "WS Ping", value: `\`${this.client.ws.ping}\``, inline: true }, { name: "Memory Usage", value: `\`${formatBytes(process.memoryUsage().heapUsed)}\``, inline: true }, { name: "Guilds", value: `\`${this.client.guilds.cache.size}\``, inline: true }, { name: "Users", value: `\`${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}\``, inline: true }, { name: "Version", value: `\`${this.client.config.version}\``, inline: true });
        const subscription = this.client.subscriptions.get(int.guild?.id);
        if (subscription)
            embed.addFields({ name: "Node", value: `\`${subscription.node.name}\``, inline: true });
        this.reply(int, { embeds: [embed] });
    }
}
