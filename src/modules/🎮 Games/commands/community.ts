import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SQL, bot } from "../../../cache";
import { EmbedBuilder } from "@discordjs/builders";


export default {
    data: new SlashCommandBuilder()
        .setName("community")
        .setDescription("Shows users who play a specific game.")
        .addStringOption(option => option.setName("game") .setDescription("What game do you want to find players for?") .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const game = interaction.options.getString("game");
        const players = await SQL.Gamers.getGamersOfGame(game);
        const str = `\n<@${players.join(">\n<@")}>`;
        await interaction.editReply({ content: `Here are the users that play ${game}: ${str}` });
    }
};