import { Event } from "../../../structures/index.js";
export class PlayerEnd extends Event {
    constructor(client, commander) {
        super(client, commander, "playerEnd");
    }
    async execute(subscription) {
        subscription.active?.onFinish();
        subscription.active = null;
        subscription.process();
        setTimeout(() => { if (!subscription.active || !subscription.queue.length)
            subscription.destroy(); }, 15000);
    }
}
