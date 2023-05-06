import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SQL, bot } from "../../../cache";
import { EmbedBuilder } from "@discordjs/builders";


export default {
    data: new SlashCommandBuilder()
        .setName("nickname")
        .setDescription("Shows your nickname and discord_id."),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const name = await SQL.Users.getNickname(interaction.user);

        let text = `Nickname: ${name} (AKA ${interaction.user.id})`;
        await interaction.editReply(text);
    }
};