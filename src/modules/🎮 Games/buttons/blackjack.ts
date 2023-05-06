import { ButtonBuilder, ButtonStyle } from "discord.js";

export function hitButton() {
    return new ButtonBuilder()
        .setCustomId("hit")
        .setLabel("Hit")
        .setStyle(ButtonStyle.Success)
        .setEmoji("🃏")
}

export function standButton() {
    return new ButtonBuilder()
        .setCustomId("stand")
        .setLabel("Stand")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🙅‍♂️")
}

export function doubleDownButton() {
    return new ButtonBuilder()
        .setCustomId("double")
        .setLabel("Double Down")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("💰")
}

export function splitButton() {
    return new ButtonBuilder()
        .setCustomId("split")
        .setLabel("Split")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("✂️")
}

export function insuranceButton() {
    return new ButtonBuilder()
        .setCustomId("insurance")
        .setLabel("Insurance")
        .setStyle(ButtonStyle.Success)
        .setEmoji("💸")
}

export function denyInsurance() {
    return new ButtonBuilder()
        .setCustomId("denyInsurance")
        .setLabel("No Insurance")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("✖️")
}

export function continueNoInsurance() {
    return new ButtonBuilder()
        .setCustomId("continueNoInsurance")
        .setLabel("Continue")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("▶️")
}

export function continueCheckDealerBJ() {
    return new ButtonBuilder()
        .setCustomId("continueCheckDealerBJ")
        .setLabel("Continue")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("▶️")
}

export function continueUserBJ() {
    return new ButtonBuilder()
        .setCustomId("continueUserBJ")
        .setLabel("Continue")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("▶️")
}

export function continueBust() {
    return new ButtonBuilder()
        .setCustomId("continueBust")
        .setLabel("Continue")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("▶️")
}