import { KATClient as Client } from "@structures/index.js";
import { Route } from "@api/structures/Route.js";
import { Request, Response } from "express";

import packageJson from "../../../package.json" assert { type: "json" };

export class IndexRoute extends Route {
    constructor(client: Client) {
        super(client, "/");
    }

    register() {
        this.router.get("/", (_: Request, res: Response) => res.send(`${this.client.user?.username} - v${packageJson.version}`));

        return this.router;
    }
}
