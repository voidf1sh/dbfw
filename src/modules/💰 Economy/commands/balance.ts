import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SQL, bot } from "../../../cache";
import { base } from "../canvas/base";
import { EmbedBuilder } from "@discordjs/builders";

export default {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Shows wallet and bank balances."),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const [bal, bank] = await SQL.Economy.getBalance(interaction.user.id, interaction.guildId);
        
        let u = bot.users.cache.get(interaction.user.id);
        if(!u || !u.hexAccentColor) u = await bot.users.fetch(interaction.user.id, { force: true });
        if(!u) return await interaction.editReply({ content: "Fetch user not found."});

        const [canvCons, field] = await base(u, 250, 56.25, 17.5);

        canvCons.ctx.font = `20px ${canvCons.fontFamily}`;

        const text = `Wallet: ${bal} Bank: ${bank}`;
        const [tw, th] = canvCons.measureText(text);

        canvCons.text(text, field.x + field.width/2 - tw/2, field.y + field.height/2 + th/2);

        const buf = canvCons.canvas.toBuffer();

        const attachment = new AttachmentBuilder(buf, {name: "balance.png"});
        const embed = new EmbedBuilder().setImage("attachment://balance.png");
        await interaction.editReply({ /*embeds: [ embed ],*/ files: [ attachment ]});
    }
};