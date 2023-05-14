import { Module } from '../structures/index.js';
import { Collection, EmbedBuilder } from 'discord.js';
export class AffiliateModule extends Module {
    invites = new Collection();
    channels = new Collection();
    constructor(client, commander) {
        super(client, commander, {
            name: 'Affiliate',
            guilds: ['1094860861505544314', '1023866029069320242', '858675408140369920'],
        });
        // In future, this will be handled by the db
        this.channels.set('1023866029069320242', ['1096530697876930560']);
        this.channels.set('1094860861505544314', ['1094861185310011412']);
        this.on('ready', this.onReady.bind(this));
        this.on('messageCreate', this.onMessageCreate.bind(this));
        this.on('inviteCreate', this.onInviteCreate.bind(this));
        this.on('guildCreate', this.onGuildCreate.bind(this));
        this.on('guildMemberAdd', this.onGuildMemberAdd.bind(this));
    }
    async onReady() {
        // make this async
        const guilds = this.client.guilds.cache.filter((guild) => this.guilds?.includes(guild.id));
        if (!guilds.size)
            return;
        for (const guild of guilds.values()) {
            const invites = await guild.invites.fetch();
            this.invites.set(guild.id, new Collection(invites.map((invite) => [invite.code, invite.uses ?? 0])));
        }
    }
    async onMessageCreate(message) {
        const channels = ['1095042493197844651', '1023921941364604969'];
        if (!message.channel || !channels.includes(message.id))
            return;
        try {
            await message.channel.send('<@&1095034387613089822>');
        }
        catch (err) {
            this.client.logger.error(err, 'Error Pinging Roles', `Module (${this.name})`);
        }
    }
    async onInviteCreate(invite) {
        if (!invite.guild || !this.guilds?.includes(invite.guild.id))
            return;
        this.invites.get(invite.guild?.id)?.set(invite.code, invite.uses ?? 0);
    }
    async onGuildCreate(guild) {
        if (!this.guilds?.includes(guild.id))
            return;
        const invites = await guild.invites.fetch();
        this.invites.set(guild.id, new Collection(invites.map((invite) => [invite.code, invite.uses ?? 0])));
    }
    async onGuildMemberAdd(member) {
        const newInvites = await member.guild.invites.fetch();
        const oldInvites = this.invites.get(member.guild.id);
        this.invites.set(member.guild.id, new Collection(newInvites.map((invite) => [invite.code, invite.uses ?? 0])));
        // Might be risky if invite does not exist
        const invite = newInvites.find((invite) => (oldInvites?.get(invite.code) ?? 0) < (invite.uses ?? 0));
        try {
            const res = await this.client.prisma.affiliate.findUnique({
                where: {
                    link: invite.url,
                },
            });
            if (!res)
                return;
            // @ts-ignore
            res = '123';
            const affiliate = await this.client.prisma.affiliate.update({
                where: {
                    link: invite.url,
                },
                data: {
                    total: invite.uses,
                },
            });
            if (!affiliate)
                return;
            this.client.logger.info(`Updated Affiliate Invite Link: ${affiliate.link} | Total: ${affiliate.total}`, `Module (${this.name})`);
            this.sendNotification(member, affiliate);
        }
        catch (err) {
            this.client.logger.error(err, 'Error Registering Invite', `Module (${this.name})`);
        }
    }
    async sendNotification(member, affiliate) {
        const channels = this.channels.get(member.guild.id);
        if (!channels)
            return;
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('🔗 Affiliate System')
            .setDescription(`A new user has joined!`)
            .setThumbnail(member.user.avatarURL() ?? null)
            .addFields({ name: 'User', value: member.user.toString(), inline: true }, { name: 'Inviter', value: `<@${affiliate.userId}>`, inline: true }, { name: 'Total Invites', value: `\`${affiliate.total}\``, inline: true });
        for (const channelId of channels) {
            const channel = member.guild.channels.cache.get(channelId);
            if (channel && channel.isTextBased())
                channel.send({ embeds: [embed] }).catch(() => { });
        }
    }
    async createAffiliate(guild, user) {
        const res = await this.client.prisma.affiliate.findFirst({
            where: {
                userId: user.id,
            },
        });
        if (res)
            return res;
        // Watch this, could be risky as channel may be undefined
        const channel = guild?.channels.cache.find((channel) => channel.isTextBased());
        const invite = await guild?.invites.create(channel?.id, { maxAge: 0, maxUses: 0, unique: true });
        const affiliate = await this.client.prisma.affiliate.create({
            data: {
                link: invite.url,
                guildId: guild.id,
                userId: user.id,
                total: 0,
            },
        });
        this.client.logger.info(`Created Affiliate Invite Link: ${affiliate.link} | Guild: ${affiliate.guildId} | User: ${affiliate.userId}`, `Module (${this.name})`);
        return affiliate;
    }
}
