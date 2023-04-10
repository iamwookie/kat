import { Event } from "../../../structures/index.js";
import chalk from "chalk";
export class NodeDisconnect extends Event {
    constructor(client, commander) {
        super(client, commander, "nodeDisconnect");
    }
    async execute(name) {
        console.error(chalk.red(`Music >> Node: ${name} has disconnected!`));
    }
}
