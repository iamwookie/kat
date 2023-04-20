import { CLICommand } from "../../structures/index.js";
import { ActionEmbed } from "../../utils/embeds/action.js";
export class WarnCommand extends CLICommand {
    constructor(client, commander) {
        super(client, commander, "warn");
    }
    async execute() {
        if (!this.client.subscriptions.size)
            return console.log("No subscriptions found!");
        for (const subscription of this.client.subscriptions.values()) {
            const channel = subscription.textChannel;
            if (!channel)
                continue;
            try {
                await channel.send({ embeds: [new ActionEmbed("warn").setDesc("The bot is restarting, please replay your track.")] });
                console.log(`Warned ${subscription.guild.name} (${subscription.guild.id})`);
            }
            catch (err) {
                console.log(`Failed to warn ${subscription.guild.name} (${subscription.guild.id})`);
                console.log(err);
            }
        }
        console.log("Done!!!");
    }
}
