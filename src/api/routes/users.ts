import { KATClient as Client } from "@structures/index.js";
import { Route } from "@structures/api/Route.js";

import { withLimiter } from "@api/middlewares/limiter.js";
import { fetchUser } from "@api/controllers/user.js";

export class UsersRoute extends Route {
    constructor(client: Client) {
        super(client, "/users");
    }

    register() {
        this.router.get("/:id", withLimiter, fetchUser(this.client));

        return this.router;
    }
}
