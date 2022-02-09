const config = require('@root/config');
const Discord = require('discord.js');
const Commander = require('@root/commander');
const axios = require('axios').default;
const { successEmbed, failEmbed } = require('@utils/other/embeds');

class NebulaLinkSession {
    static cache = new Discord.Collection();

    constructor(client, msg, id, expiry) {
        this.client = client;
        this.user = msg instanceof Discord.CommandInteraction ? msg.user : msg.author;
        this.msg = msg;
        this.id = id;
        this.status = 'pending';

        setTimeout(() => {
            if (this.status == 'complete') return;

            if (this.prompt) {
                let expired = failEmbed('Session has expired!', this.user);
                this.prompt.edit({ embeds: [expired] });
            }

            this.destroy();
            console.log(`NebulaLinkSession (EXPIRED) >> ID: ${this.id}`.yellow);
        }, expiry);
    }

    static async initialize(client, msg) {
        try {
            let author = msg instanceof Discord.CommandInteraction ? msg.user : msg.author;

            let res = await axios.post(`${config.nebula.host}/create`, {
                discord: { id: author.id }
            }, 
            { 
                headers: {
                    'Authorization': process.env.NEBULA_API_KEY
                }
            });

            let session = new NebulaLinkSession(client, msg, res.data, config.nebula.linkExpiry);
            NebulaLinkSession.cache.set(author.id, session);
            await session.createPrompt();
            await session.createPubSub();
            await session.listen();
            console.log(`NebulaLinkSession (CREATED) >> ID: ${res.data} | USER: ${author.id}`.brightGreen);
            return session;
        } catch (err) {
            Commander.handleError(client, err, false);
            console.log('NebulaLinkSession (ERROR) >> Error Creating Session'.red);
            console.error(err);

            let fail = failEmbed('Something went wrong. Try again later!', msg.author);
            msg instanceof Discord.CommandInteraction ? msg.editReply({ embeds: [fail] }) : msg.reply({ embeds: [fail] }).catch(() => msg.channel.send({ embeds: [fail] }));
            return false;
        }
    }

    destroy() {
        try {
            if (NebulaLinkSession.cache.has(this.user.id)) NebulaLinkSession.cache.delete(this.user.id);
            if (this.pubsub.isOpen) this.pubsub.quit();
            console.log(`NebulaLinkSession (DESTROYED) >> ID: ${this.id}`.yellow);
        } catch (err) {
            Commander.handleError(this.client, err, false, this.msg);
            console.log('NebulaLinkSession (ERROR) >> Error Destroying'.red);
            console.error(err);
        }
    }

    async createPrompt() {
        let prompt = new Discord.MessageEmbed()
        .setAuthor({ name: this.user.tag, iconURL: this.user.avatarURL({ dynamic: true }) })
        .setColor('#C167ED')
        .setTitle('Nebula Link')
        .setDescription(`[Click here to link your account!](https://link.nebularoleplay.com/${this.id})`)
        .setFooter({ text: 'NOTE: The verification link will expire in 5 minutes.' })
        .setThumbnail('https://nebularoleplay.com/media/logo-nobg.png');

        await this.user.send({ embeds: [prompt] }).then(msg => {
            this.prompt = msg;
            let success = successEmbed('A verification prompt has been sent to your DMs!', this.user);
            this.msg instanceof Discord.CommandInteraction ? this.msg.editReply({ embeds: [success] }) : this.msg.reply({ embeds: [success] }).catch(() => this.msg.channel.send({ embeds: [success] }));
        }).catch(() => {
            let fail = failEmbed('I could not send you a DM. Are you sure your DMs are open?', this.user);
            this.msg instanceof Discord.CommandInteraction ? this.msg.editReply({ embeds: [fail] }) : this.msg.reply({ embeds: [fail] }).catch(() => this.msg.channel.send({ embeds: [fail] }));
        });
    }

    async createPubSub() {
        if (this.pubsub && this.pubsub.isOpen) return;

        try {
            this.pubsub = this.client.redis.duplicate();
    
            this.pubsub.on('connect', () => console.log('[Redis] '.red + 'PubSub Connected'));
            this.pubsub.on('end', () => console.log('[Redis] '.red + 'PubSub Disconnected'));
            this.pubsub.on('error', (err) => console.log('PubSub Client Error', err));
    
            await this.pubsub.connect();
        } catch(err) {
            Commander.handleError(this.client, err, false, this.msg);
            console.log('NebulaLinkSession (ERROR) >> Error Listening'.red);
            console.error(err);
        }
    }

    async listen() {
        if (!this.pubsub) await this.createPubSub();

        try {
            this.pubsub.subscribe('nebula-link', (message) => {
                let data = JSON.parse(message);
                if (!data.id == this.id) return;
                
                this.status = 'complete';
                this.destroy();
    
                if (data.status == 'success') {
                    if (this.prompt) {
                        let success = new Discord.MessageEmbed()
                        .setAuthor({ name: this.user.tag, iconURL: this.user.avatarURL({ dynamic: true }) })
                        .setColor('#C167ED')
                        .setTitle('Nebula Link')
                        .setDescription(`:white_check_mark: \u200b Successfully linked!`)
                        .setThumbnail('https://nebularoleplay.com/media/logo-nobg.png');
    
                        this.prompt.edit({ embeds: [success] });
                    }
                    console.log(`NebulaLinkSession (COMPLETED) >> ID: ${this.id} | USER: ${this.user.id}`.brightGreen);
                }
            })
        } catch (err) {
            Commander.handleError(this.client, err, false, this.msg);
            console.log('NebulaLinkSession (ERROR) >> Error Listening'.red, err);
            console.error(err);
        }
    }
}

module.exports = NebulaLinkSession;