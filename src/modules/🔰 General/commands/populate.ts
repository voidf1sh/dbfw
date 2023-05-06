import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SQL } from "../../../cache";

export default {
    data: new SlashCommandBuilder()
        .setName("populate-db")
        .setDescription("Populates the database with values for testing."),
    async execute(interaction: ChatInputCommandInteraction) {

        await SQL.Users.addUser(interaction.user);
        await SQL.Gamers.addGamer("Blackjack", interaction.user.id);
        await SQL.Gamers.addGamer("Roulette", interaction.user.id);
        await SQL.Games.addGame("Blackjack");
        await SQL.Games.setInstructions("Blackjack", "Get as close to 21 without going over!");
        await SQL.Games.setLength("Blackjack", 5);
        await SQL.Games.addGame("Roulette");
        await SQL.Games.setInstructions("Roulette", "Bet on a number and spin the wheel!");
        await SQL.Games.setLength("Roulette", 5);

        await interaction.reply({ content: "Done!" });
    }
};