import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SQL } from "../../../cache";

export default {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Shows wallet and bank balances."),
    async execute(interaction: ChatInputCommandInteraction) {
        await SQL.Economy.getBalance(interaction.user.id, interaction.guildId);
        await interaction.reply({ content: "test" });
    }
};