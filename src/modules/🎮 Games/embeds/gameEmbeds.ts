import { Colors, EmbedBuilder } from "discord.js";


export function notEnoughBJ(bet: number, bal: number) {
    return new EmbedBuilder()
        .setColor(Colors.Red)
        .setDescription(`You don't have enough money in your wallet to bet \`${bet}\`. You have \`${bal}\` coins in your wallet.`);
}

export function playingBJ() {
    return new EmbedBuilder()
        .setColor(Colors.Red)
        .setDescription(`You are already playing a game of blackjack.`);
}