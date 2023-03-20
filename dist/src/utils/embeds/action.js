import { EmbedBuilder } from 'discord.js';
export class ActionEmbed extends EmbedBuilder {
    embedType;
    constructor(embedType) {
        super();
        this.embedType = embedType;
        this.embedType = embedType;
    }
    setUser(user) {
        return super.setAuthor({ name: user.tag, iconURL: user.avatarURL() ?? undefined });
    }
    setDesc(description) {
        switch (this.embedType) {
            case 'success':
                this.setColor('Green');
                super.setDescription(`✅ \u200b ${description}`);
                break;
            case 'fail':
                this.setColor('Red');
                super.setDescription(`🚫 \u200b ${description}`);
                break;
            default:
                this.setColor('White');
                super.setDescription(`${description}`);
        }
        return this;
    }
}
