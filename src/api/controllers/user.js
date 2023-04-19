import { formatUser } from "../../utils/helpers.js";
import chalk from "chalk";
export function fetchUser(client) {
    return async (req, res) => {
        try {
            const id = req.params.id;
            if (!id)
                return res.status(400).send("Bad Request");
            const user = await client.users.fetch(id, { force: true });
            if (!user)
                return res.status(404).send("Not Found");
            return res.json(formatUser(user));
        }
        catch (err) {
            console.error(chalk.red("User Controller (ERROR) >> Error Getting User"));
            console.error(err);
            // Don't log error as missing user can trigger error
            return res.status(500).send("Internal Server Error");
        }
    };
}
// Extras