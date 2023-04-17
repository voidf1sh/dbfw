import { bot, SQL } from "./cache";
import { loadAll } from "./utils/util";
import { token } from "../config.json";

export const setup = async () => {
    await loadAll();

    await SQL.connect();
    //await SQL.query("CREATE TABLE user(id VARCHAR(18) NOT NULL) IF NOT EXISTS user");
    //await SQL.query("DROP TABLE user");
    //console.log(await SQL.query("SELECT * FROM user"));

    bot.login(token);
}

setup();