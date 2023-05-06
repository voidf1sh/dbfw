import { ActionRowBuilder, AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SQL } from "../../../cache";
import { notEnoughBJ } from "../embeds/gameEmbeds";
import { Blackjack } from "../structs/blackjack";
import { board, template } from "../canvas/blackjack";
import { MessageActionRowComponentBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("Get as close to 21 without going over.")
        .addIntegerOption(option => option
            .setName("bet")
            .setDescription("The amount of money you want to bet.")
            .setMinValue(1)
            .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const ops = interaction.options;
        const bet = ops.getInteger("bet");

        const [bal, _] = await SQL.Economy.getBalance(interaction.user.id, interaction.guildId);
        if(bet > bal) return await interaction.reply({ embeds: [ notEnoughBJ(bet, bal) ] });

        await interaction.deferReply();

        await SQL.Economy.addBalance(interaction.user.id, interaction.guildId, -bet);

        const game = new Blackjack(bet, interaction.user.id, interaction.guildId);

        const buttons = await game.getButtons();

        const temp = await template(interaction.user, interaction.guild);
        const buf = await board(temp, game, interaction.user, game.footerText);

        const attachment = new AttachmentBuilder(buf, {name: "balance.png"});
        const row = new ActionRowBuilder().addComponents(buttons) as ActionRowBuilder<MessageActionRowComponentBuilder>;
        const msg = await interaction.editReply({ files: [ attachment ], components: [ row ]});

        game.addGame(msg);
        game.setTemplate(temp);
    }
};