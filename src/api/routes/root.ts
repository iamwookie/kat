import { KATClient as Client } from "@structures/index.js";
import { Route } from "@structures/api/Route.js";
import { Request, Response } from "express";

export class IndexRoute extends Route {
    constructor(client: Client) {
        super(client, "/");
    }

    register() {
        this.router.get("/", (_: Request, res: Response) => res.send(`${this.client.user?.username} - v${this.client.config.version}`));

        return this.router;
    }
}
