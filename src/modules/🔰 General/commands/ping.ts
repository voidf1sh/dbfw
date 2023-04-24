import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { pingEmbed } from "../embeds/generalEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows bot latency and replies with pong."),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({ embeds: [ pingEmbed() ] });
    }
};