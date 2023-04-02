import { KATClient as Client } from "@structures/index.js";
import { Route } from "@api/structures/Route.js";

import { fetchStats } from "src/api/controllers/bot.js";

export class StatsRoute extends Route {
    constructor(client: Client) {
        super(client, "/stats");
    }

    register() {
        this.router.get("/", fetchStats(this.client));

        return this.router;
    }
}
