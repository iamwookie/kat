!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3c36e378-1be8-5691-9b4f-47612814e8af")}catch(e){}}();
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
//# debugId=3c36e378-1be8-5691-9b4f-47612814e8af
//# sourceMappingURL=action.js.map
