import { ChatInputCommandInteraction } from "discord.js";
import { SQL, bot } from "../../../cache";
import { SlashCommandBuilder } from "@discordjs/builders";
import { lbEmbed } from "../embeds/econEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Shows ranking for money and xp.")
        .addStringOption(option => 
            option
                .setName("type")
                .setDescription("The type of leaderboard to show.")
                .setRequired(true)
                .addChoices({name: "money", value: "money"}, {name: "xp", value: "xp"})
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const ops = interaction.options;
        const type = ops.getString("type") as "money" | "xp";

        const top = type === "money" 
            ? await SQL.Economy.getTopBalances(interaction.guild.id, 10)
            : await SQL.Economy.getTopXP(interaction.guild.id, 10);

        const embed = await lbEmbed(type, top, interaction);

        await interaction.reply({ embeds: [embed] });
    }
};