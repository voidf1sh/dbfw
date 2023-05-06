import { EmbedBuilder, Colors, User, ChatInputCommandInteraction } from "discord.js";
import { bot } from "../../../cache";
import { numberWithCommas } from "../../../utils/util";

export function userNotFoundEconMgr() {
    return new EmbedBuilder()
        .setColor(Colors.Red)
        .setDescription("User not found!");
}

export function addCurrencyMgr(dest: string, amount: number, user: User) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`Added ${amount} to ${user}'s ${dest}!`);
}

export function removeCurrencyMgr(dest: string, amount: number, user: User) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`Removed ${amount} from ${user}'s ${dest}!`);
}

export function setCurrencyMgr(dest: string, amount: number, user: User) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`Set ${user}'s ${dest} to ${amount}!`);
}

export function addXPMgr(amount: number, user: User) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`Added ${amount} XP to ${user}!`);
}

export function removeUserMgr(user: User) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`Removed ${user} from the economy!`);
}

const width = 45;

export async function lbEmbed(type: "money" | "xp", top: [string, number][], interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setAuthor({name: `${type === "money" ? "Money" : "XP"} Leaderboard`, iconURL: interaction.guild.iconURL()})
        .setColor(Colors.White)

    let desc = "";

    for (const [i, [id, amount]] of top.entries()) {
        const user = await bot.users.fetch(id);
        const name = user ? user.username : "Unknown User";
        const pos = `${i + 1}.`.padEnd(3, " ");
        const amo = numberWithCommas(amount);
        const middle = " ".repeat(width - pos.length - name.length - amo.length);
        desc += `${pos}${name}${middle}${amo}\n`;
    }

    desc.trim();
    embed.setDescription(`\`${desc}\``);
    embed.setTimestamp();

    return embed;
}