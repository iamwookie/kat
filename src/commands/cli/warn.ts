import { KATClient as Client, Commander, CLICommand } from "@structures/index.js";
import { ActionEmbed } from "@utils/embeds/action.js";

// In future, could try using beforeReload event on the process
export class WarnCommand implements CLICommand {
    public name = "warn";

    constructor(public client: Client, public commander: Commander) {}

    async execute() {
        if (!this.client.subscriptions.size) return console.log("No subscriptions found!");

        for (const subscription of this.client.subscriptions.values()) {
            if (!subscription.active) continue;

            const channel = subscription.textChannel;
            if (!channel) continue;

            try {
                await channel.send({ embeds: [new ActionEmbed("warn").setText("The bot is restarting, replay your track after a few seconds!")] });
                console.log(`-> Warned ${subscription.guild.name} (${subscription.guild.id})`);
            } catch (err) {
                console.error(`-> Failed to warn ${subscription.guild.name} (${subscription.guild.id}): ${err instanceof Error ? err.message : err}`);
            }
        }

        console.log("-> Done!!!");
    }
}
