import { EmbedBuilder } from 'discord.js';
export class ActionEmbed extends EmbedBuilder {
    embedType;
    constructor(embedType) {
        super();
        this.embedType = embedType;
        this.embedType = embedType;
    }
    setText(content) {
        switch (this.embedType) {
            case 'success':
                super.setColor('Green');
                super.setDescription(content);
                break;
            case 'fail':
                super.setColor('Red');
                super.setDescription(content);
                break;
            case 'warn':
                super.setColor('Yellow');
                super.setDescription(content);
                break;
            default:
                super.setDescription(content);
        }
        return this;
    }
}
