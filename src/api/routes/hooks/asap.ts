import { KATClient as Client } from "@structures/index.js";
import { Route } from "@api/structures/Route.js";

import { sendUnbox, sendSuits, sendStaff } from "@api/hooks/asap.js";

export class AsapHook extends Route {
    constructor(client: Client) {
        super(client, "/hooks/asap");
    }

    register() {
        this.router.post("/unbox", sendUnbox(this.client));
        this.router.post("/suits", sendSuits(this.client));
        this.router.post("/staff", sendStaff(this.client));

        return this.router;
    }
}
