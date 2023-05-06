import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import { SQL, bot } from "../../../cache";
import { SlashCommandBuilder } from "@discordjs/builders";
import { SQLClass } from "../../../structs/sql";

export default {
    data: new SlashCommandBuilder()
        .setName("total")
        .setDescription("Adds up the hours of users")
        .addUserOption(option => option.setName("user") .setDescription("What gamer do you want to look up?") .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user");
        const total = await SQL.Gamers.getGamersTotalHours(user.id);
        await interaction.editReply({ content: `User ${user} has a total of: ${total} hours` });

    }
};