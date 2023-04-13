import { EmbedBuilder } from "@discordjs/builders";
import { Colors } from "discord.js";
import bot from "../../../cache";
import { bullet } from "../../../constants/constants";

export function reloadEmbed(msg: string) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(msg);
}

export function pingEmbed() {
    return new EmbedBuilder()
        .setColor(Colors.White)
        .setAuthor({ name: `🏓 Pong ${bullet} ${bot.ws.ping}ms`});
}

export function refreshEmbed() {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription("Refreshed slash commands for all guilds.");
}