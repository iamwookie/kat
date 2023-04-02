import { Route } from "../structures/Route.js";
import packageJson from "../../../package.json" assert { type: "json" };
export class IndexRoute extends Route {
    constructor(client) {
        super(client, "/");
    }
    register() {
        this.router.get("/", (_, res) => res.send(`${this.client.user?.username} - v${packageJson.version}`));
        return this.router;
    }
}
