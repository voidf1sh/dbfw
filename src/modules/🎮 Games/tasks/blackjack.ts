import { bot } from "../../../cache";
import { Task } from "../../../structs/structs";
import { games } from "../structs/blackjack";

bot.addTask(new Task({
    name: "bjTurn",
    interval: 1000 * 60 * 5,
    execute: async () => {
        for(const game of games.values()) {
            const time = Date.now() - game.lastUpdate;
            if (time > 1000 * 60 * 5) {
                game.end();
            }
        }
    }
}));