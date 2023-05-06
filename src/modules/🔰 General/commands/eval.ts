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
        const ops = interaction.options;
        const code = ops.getString("code", true);

        if (code.includes("token")) return interaction.reply({ content: "No token for you." });

        const { bot, SQL } = await import("../../../cache");

        try {
            const res = eval(code);
            interaction.reply({ content: `\`\`\`ts\nCode:\n${code}\n\nOutput:\n${res || "None"}\n\`\`\`` });
        } catch(err) {
            interaction.reply({ content: `\`\`\`${err.message.slice(0, 1000)}\`\`\`` });
        }
    }
};