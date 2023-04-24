import { EmbedBuilder, Colors, User } from "discord.js";

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

export function removeUserMgr(user: User) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`Removed ${user} from the economy!`);
}