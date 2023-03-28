import { Event } from "../../../structures/index.js";
export class PlayerEnd extends Event {
    constructor(client, commander) {
        super(client, commander, "nodeDisconnect");
    }
    async execute(subscription) {
        subscription.active?.onFinish();
        subscription.active = null;
        subscription.process();
    }
}
