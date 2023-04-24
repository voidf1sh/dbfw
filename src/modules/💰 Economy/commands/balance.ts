import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SQL, bot } from "../../../cache";
import { base } from "../canvas/base";
import { EmbedBuilder } from "@discordjs/builders";
import { loadImage } from "canvas";
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

        const desiredItemHeight = field.height * .3;

        const tempText = "12345678910kmbyqd Wallet: Bank:";
        const tHeight = canvCons.setFontHeight(desiredItemHeight, tempText);

        const icon = interaction.guild.iconURL({ extension: "png", size: 512 });

        if(icon) {
            canvCons.save();

            const guildIcon = await loadImage(icon);
            canvCons.strokeCircle(field.x + field.width * 0.15, field.y + (field.height / 2), desiredItemHeight);
            canvCons.drawImage(guildIcon, field.x + field.width * 0.15 - desiredItemHeight/2, field.y + (field.height / 2) - desiredItemHeight/2, desiredItemHeight, desiredItemHeight);

            canvCons.restore();
        }

        const text = `Wallet: ${bal} Bank: ${bank}`;
        canvCons.text(text, field.x + field.width * 0.35, field.y + (field.height / 2) + tHeight/2, "#FFFFFF", field.width*.5);

        const buf = canvCons.canvas.toBuffer();

        const attachment = new AttachmentBuilder(buf, {name: "balance.png"});
        const embed = new EmbedBuilder().setImage("attachment://balance.png");
        await interaction.editReply({ /*embeds: [ embed ],*/ files: [ attachment ]});
    }
};