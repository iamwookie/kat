import { KATClient as Client } from "@structures/index.js";
import { Route } from "@api/structures/Route.js";

import chalk from "chalk";
// ------------------------------------
import { AsapHook } from "./asap.js";
const hooks = [AsapHook];
// ------------------------------------

// Move into server structure at some point
export class HookRoute extends Route {
    constructor(client: Client) {
        super(client, "/hooks");
    }

    register() {
        if (!hooks.length) return this.router;

        for (const Hook of hooks) {
            try {
                const hook = new Hook(this.client);
                this.router.use(hook.path, hook.register());
            } catch (err) {
                this.client.logger.error(err);
                console.error(chalk.red("Server (ERROR) >> Error Registering Hook: " + Hook.name));
                console.error(err);
            }
        }

        this.client.logger.info(`Server >> Successfully Registered ${hooks.length} Hook(s)`);

        return this.router;
    }
}
