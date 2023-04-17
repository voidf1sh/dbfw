import { refreshGuildSlashes } from "../utils/util"
import { bot } from "../cache";
import { log } from "../utils/logger";
import { green } from "chalk";
import { ReadyTag } from "../constants/constants";

export default {
    name: "globalReady",
    event: "ready",
    once: true,
    execute: async () => {
        await bot.guilds.fetch();

        //Although less performant, this will respect async rather than using forEach.
        for(const [id, _guild] of bot.guilds.cache) {
            await refreshGuildSlashes(id);
        }

        log(green("Client Ready!"), ReadyTag);
    }
};