import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";


export default {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Execute TS Code.")
        .addStringOption(option => option
            .setName("code")
            .setDescription("Code to execute.")
            .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({ content: "Not implemented yet...", ephemeral: true });
    }
};