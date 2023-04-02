import { Route } from "../structures/Route.js";
import { fetchStats } from "../../../src/api/controllers/bot.js";
export class StatsRoute extends Route {
    constructor(client) {
        super(client, "/stats");
    }
    register() {
        this.router.get("/", fetchStats(this.client));
        return this.router;
    }
}
