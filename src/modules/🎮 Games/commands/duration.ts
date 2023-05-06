import { ChatInputCommandInteraction } from "discord.js";
import { SQL } from "../../../cache";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
    data: new SlashCommandBuilder()
        .setName("duration")
        .setDescription("Find games that are typically played within a certain duration of time.")
        .addStringOption(option => option.setName("time") .setDescription("What is the maximum time (in minutes) you want to play a game for?") .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const time = interaction.options.getString("time");
        const t = +time;
        const length_game = await SQL.Games.getLength(t);
        const len = length_game.join("\n");
        await interaction.editReply({ content: `Here are the games that are usually played under ${time} minutes: ${len}` });
    }
};