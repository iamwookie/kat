import { Route } from "../../structures/Route.js";
import { sendUnbox, sendSuits, sendStaff } from "../../hooks/asap.js";
export class AsapHook extends Route {
    constructor(client) {
        super(client, "/hooks/asap");
    }
    register() {
        this.router.post("/unbox", sendUnbox(this.client));
        this.router.post("/suits", sendSuits(this.client));
        this.router.post("/staff", sendStaff(this.client));
        return this.router;
    }
}
