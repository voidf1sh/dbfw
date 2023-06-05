import { GatewayIntentBits, Partials } from "discord.js";
import { Bot } from "./structs/structs";
import { SQLClass } from "./structs/sql";
const sqlconfig = {
    "host": process.env.DBHOST,
    "user": process.env.DBUSER,
    "password": process.env.DBPASS
};

export const bot = new Bot({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageReactions
    ],
    //Equiv of disable @everyone
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
    partials: [Partials.Message, Partials.Reaction] 
});

export const SQL = new SQLClass(sqlconfig);