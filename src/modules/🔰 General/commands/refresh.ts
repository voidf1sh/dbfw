import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { refreshGuildSlashes } from "../../../utils/util";
import { bot } from "../../../cache";
import { refreshEmbed } from "../Embeds/generalEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("refresh")
        .setDescription("Refreshes slash commands for all guilds."),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        await bot.guilds.fetch();

        for(const [id, _guild] of bot.guilds.cache) {
            await refreshGuildSlashes(id);
        }

        await interaction.editReply({ embeds: [ refreshEmbed() ] });
    }
};