import { Route } from "../../structures/api/Route.js";
export class IndexRoute extends Route {
    constructor(client) {
        super(client, "/");
    }
    register() {
        this.router.get("/", (_, res) => res.send(`${this.client.user?.username} - v${this.client.config.version}`));
        return this.router;
    }
}
