import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Restarts bot."),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({ content: "Yet to be implemented." });
    }
};