import { KATClient as Client } from "@structures/index.js";
import { Route } from "@api/structures/Route.js";
import { Request, Response } from "express";
import { EmbedBuilder, ColorResolvable } from "discord.js";

import { withAuth } from "@api/middlewares/auth.js";

import chalk from "chalk";

interface StaffData {
    ban: "banned" | "unbanned";
    banLength: string;
    banReason: string;
    adminUser: string;
    adminSid: string;
    banUser: string;
    banUserSid: string;
    banUserProfile: string;
    banUserAvatar: string;
};

interface UnboxData {
    name: string;
    steamId: string;
    itemName: string;
    itemIcon: string;
    itemColor: ColorResolvable;
    crateName: string;
};

interface SuitData extends UnboxData {
    killerName: string;
};

export class AsapHook extends Route {
    public config = this.client.config.server.hooks.asap;

    constructor(client: Client) {
        super(client, "/asap");
    }

    register() {
        this.router.post("/staff", withAuth, this.sendStaff);
        this.router.post("/unbox", withAuth, this.sendUnbox);
        this.router.post("/suits", withAuth, this.sendSuits);
        
        return this.router;
    }
    
    private sendStaff = async (req: Request, res: Response) => {
        try {
            const body: StaffData = req.body;
            if (!body) return res.status(400).send("Bad Request");

            const { ban, banLength, banReason, adminUser, adminSid, banUser, banUserSid, banUserProfile, banUserAvatar } = body;
            if (!adminUser || !adminSid || !banUser || !banUserSid || !banUserProfile || !banUserAvatar) return res.status(400).send("Bad Request");

            const embed = new EmbedBuilder()
                .setTitle("ASAP Admin")
                .setDescription(`**${banUser}** has been ${ban}!`)
                .setThumbnail(banUserAvatar)
                .setColor(ban == "banned" ? "#ff0000" : "#00ff00")
                .addFields([
                    { name: "Player", value: `[${banUser} (${banUserSid})](${banUserProfile})` },
                    { name: "Admin", value: `${adminUser} (${adminSid})` },
                ]);

            if (ban == "banned") {
                embed.addFields([
                    { name: "Ban Length", value: `\`${banLength}\`` },
                    { name: "Ban Reason", value: `\`${banReason}\`` },
                ]);
            }

            for (const c of this.config.staff) {
                const channel = this.client.channels.cache.get(c);
                if (!channel || !channel.isTextBased()) return res.status(500).send("Internal Server Error");
                await channel.send({
                    content: `\`${adminUser} (${adminSid})\` has ${ban} \`${banUser} (${banUserSid})\`!`,
                    embeds: [embed],
                });
            }

            return res.status(200).send("OK");
        } catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("ASAP Controller (ERROR) >> Error Creating Staff Log"));
            console.error(err);

            return res.status(500).send("Internal Server Error");
        }
    }

    private sendUnbox = async (req: Request, res: Response) => {
        try {
            const body: UnboxData = req.body;
            if (!body) return res.status(400).send("Bad Request");

            const { name, steamId, itemName, itemIcon, itemColor, crateName } = body;
            if (!name || !steamId || !itemName || !itemIcon || !itemColor || !crateName) return res.status(400).send("Bad Request");

            const embed = new EmbedBuilder()
                .setTitle("ASAP Unbox")
                .setDescription(`**${name}** has received **${itemName}** from **${crateName}** 🎁!`)
                .setThumbnail(`https://i.imgur.com/${itemIcon}.png`)
                .setColor(itemColor)
                .addFields([
                    { name: "Player", value: `[${name}](https://steamcommunity.com/profiles/${steamId})`, inline: true },
                    { name: "Item", value: `\`${itemName}\``, inline: true },
                    { name: "Crate", value: `\`${crateName}\``, inline: true },
                ]);

            for (const c of this.config.unbox) {
                const channel = this.client.channels.cache.get(c);
                if (!channel || !channel.isTextBased()) return res.status(500).send("Internal Server Error");
                await channel.send({ embeds: [embed] });
            }

            return res.status(200).send("OK");
        } catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("ASAP Controller (ERROR) >> Error Creating Unbox Log"));
            console.error(err);

            return res.status(500).send("Internal Server Error");
        }
    }

    private sendSuits = async (req: Request, res: Response) => {
        try {
            const body: SuitData = req.body;
            if (!body) return res.status(400).send("Bad Request");

            const { name, steamId, itemName, itemIcon, itemColor, killerName } = body;
            if (!name || !steamId || !itemName || !itemIcon || !itemColor || !killerName) return res.status(400).send("Bad Request");

            const embed = new EmbedBuilder()
                .setTitle("ASAP Suit Rips")
                .setDescription(`**${name}** has lost **${itemName}** to **${killerName}** 💀!`)
                .setThumbnail(`https://i.imgur.com/${itemIcon}.png`)
                .setColor(itemColor as ColorResolvable)
                .addFields([
                    { name: "Player", value: `[${name}](https://steamcommunity.com/profiles/${steamId})`, inline: true },
                    { name: "Suit Lost", value: `\`${itemName}\``, inline: true },
                    { name: "Killer", value: `\`${killerName}\``, inline: true },
                ]);

            for (const c of this.config.suits) {
                const channel = await this.client.channels.cache.get(c);
                if (!channel || !channel.isTextBased()) return res.status(500).send("Internal Server Error");
                await channel.send({ embeds: [embed] });
            }

            return res.status(200).send("OK");
        } catch (err) {
            this.client.logger.error(err);
            console.error(chalk.red("ASAP Controller (ERROR) >> Error Creating Suit Rip Log"));
            console.error(err);

            return res.status(500).send("Internal Server Error");
        }
    }
}
