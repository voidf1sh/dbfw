const dotenv = require("dotenv");
dotenv.config();
import { bot } from "./cache";
import { loadAll } from "./utils/util";
const { TOKEN } = process.env;

export const setup = async () => {
    await loadAll();

    bot.login(TOKEN);
}

setup();