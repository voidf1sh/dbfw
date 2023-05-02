import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SQL, bot } from "../../../cache";
import { base } from "../canvas/base";
import { getLevel, numberWithCommas } from "../../../utils/util";


export default {
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Shows how much xp is needed to level up."),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const xp = await SQL.Economy.getXP(interaction.user.id, interaction.guildId);
        const level = getLevel(xp);
        const curLvl = Math.floor(level);
        const nextLevel = Math.ceil(level);
        
        let u = bot.users.cache.get(interaction.user.id);
        if(!u || !u.hexAccentColor) u = await bot.users.fetch(interaction.user.id, { force: true });
        if(!u) return await interaction.editReply({ content: "Fetch user not found."});

        const [canvCons, field] = await base(u, 350, 56.25, 17.5);

        const barSpace = .75;
        const totBarWidth = field.width * barSpace;
        const filledBar = totBarWidth * (level - curLvl);

        const barHeight = field.height * .05;

        const lvlPadX = 5;

        //Stroke the filled bar with color canvCons.color
        canvCons.ctx.fillStyle = canvCons.color;
        canvCons.ctx.fillRect(field.width / 2 - totBarWidth / 2, field.height / 2 - barHeight / 2, filledBar, barHeight);

        canvCons.ctx.font = `16px ${canvCons.fontFamily}`;

        const [clw, clh] = canvCons.measureText(curLvl.toString());
        const [nlw, nlh] = canvCons.measureText(nextLevel.toString());

        canvCons.text(curLvl.toString(), field.width / 2 - totBarWidth / 2 - clw - lvlPadX, field.height / 2 + clh / 2);
        canvCons.text(nextLevel.toString(), field.width / 2 + totBarWidth / 2 + nlw + lvlPadX, field.height / 2 + nlh / 2);

        //const xpString = `${numberWithCommas(xp.toFixed(2)).slice(0, -3)} / ${numberWithCommas(nextLevel.toFixed(2)).slice(0, -3)}`;
        
        canvCons.ctx.textAlign = "right";
        const xpString = `${numberWithCommas(xp)} - ${level.toFixed(2).slice(0 -2)}%`;
        const [xpw, xph] = canvCons.measureText(xpString);

        if(xpw > filledBar) canvCons.ctx.textAlign = "left";

        canvCons.text(xpString, filledBar + field.width / 2 - totBarWidth / 2, field.height / 2 + xph + 3);

        const buf = canvCons.canvas.toBuffer();

        const attachment = new AttachmentBuilder(buf, {name: "balance.png"});
        const embed = new EmbedBuilder().setImage("attachment://balance.png");
        await interaction.editReply({ /*embeds: [ embed ],*/ files: [ attachment ]});
    }
}