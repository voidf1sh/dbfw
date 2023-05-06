import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import { SQL, bot } from "../../../cache";
import { SlashCommandBuilder } from "@discordjs/builders";
import { SQLClass } from "../../../structs/sql";

export default {
    data: new SlashCommandBuilder()
        .setName("instructions")
        .setDescription("Get instructions.")
        .addStringOption(option => option.setName("game") .setDescription("What game do you want to learn?") .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const game = interaction.options.getString("game");
        const instructions = await SQL.Games.getInstructions(game);

        const text = `Instructions for: ${game}: ${instructions}`;
        await interaction.editReply(text);
    }

};