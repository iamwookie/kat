import { Route } from "../../structures/api/Route.js";
import { withLimiter } from "../middlewares/limiter.js";
import { fetchUser } from "../controllers/user.js";
export class UsersRoute extends Route {
    constructor(client) {
        super(client, "/users");
    }
    register() {
        this.router.get("/:id", withLimiter, fetchUser(this.client));
        return this.router;
    }
}
