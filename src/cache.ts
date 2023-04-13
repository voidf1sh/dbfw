import { GatewayIntentBits, Partials } from "discord.js";
import { Bot } from "./structs/structs";

const bot = new Bot({
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

export default bot;