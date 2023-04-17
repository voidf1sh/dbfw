import { GatewayIntentBits, Partials } from "discord.js";
import { Bot, SQLClass } from "./structs/structs";
import { sqlconfig } from "../config.json";

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