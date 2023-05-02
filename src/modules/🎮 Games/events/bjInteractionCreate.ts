import { ActionRowBuilder, AttachmentBuilder, ButtonInteraction, MessageActionRowComponentBuilder } from "discord.js";
import { Blackjack, games } from "../structs/blackjack";
import { board } from "../canvas/blackjack";
import { SQL } from "../../../cache";

export default {
    name: "bjInteractionCreate",
    event: "interactionCreate",
    once: false,
    execute: async (interaction: ButtonInteraction) => {
        if (!interaction.isButton()) return;

        const msgId = interaction.message.id;
        const game = games.get(msgId);

        if(!game) return;

        await interaction.deferUpdate();

        game.lastInteraction = interaction;

        let msg = "";

        switch(interaction.customId) {
            case "hit":
                hit(interaction, game);
                break;
            case "stand":
                await stand(interaction, game);
                break;
            case "double":
                msg = await double(interaction, game);
                break;
            case "split":
                msg = await split(interaction, game);
                break;
            case "insurance":
                msg = await insurance(interaction, game);
                break;
            case "denyInsurance":
                msg = await noInsurance(interaction, game);
                break;
            case "continueCheckDealerBJ":
                msg = await checkDealerBJ(interaction, game);
                break;
            case "continueUserBJ":
                await checkUserBJ(interaction, game);
                break;
            case "continueBust":
                await stand(interaction, game);
                break;
        }

        game.lastUpdate = Date.now();
        game.firstRoundIsOver = true;

        if(game.ended) return;

        const buf = await board(game.template, game, interaction.user, msg || game.footerText);
        const attachment = new AttachmentBuilder(buf, {name: "balance.png"});
        const buttons = await game.getButtons();
        const row = new ActionRowBuilder().addComponents(buttons) as ActionRowBuilder<MessageActionRowComponentBuilder>;
        await interaction.editReply({ files: [ attachment ], components: [ row ] });
    }
};

const hit = (interaction: ButtonInteraction, game: Blackjack) => {
    game.hit();
}

const stand = async (interaction: ButtonInteraction, game: Blackjack) => {
    await game.stand();
}

const double = async (interaction: ButtonInteraction, game: Blackjack) => {
    const canAfford = await game.canAffordDoubleDown();
    if(!canAfford) return "You can no longer afford to double down.";
    await game.doubleDown();
}

const split = async (interaction: ButtonInteraction, game: Blackjack) => {
    const canAfford = await game.canAffordDoubleDown();
    if(!canAfford) return "You can no longer afford to split."; //dd same as split bet
    await game.split();
}

const insurance = async (interaction: ButtonInteraction, game: Blackjack) => {
    const canAfford = await game.canAffordInsurance();
    if(!canAfford) return "You can no longer afford insurance.";
    await SQL.Economy.addBalance(interaction.user.id, interaction.guildId, -game.bet / 2);
    game.wasInsured = true;
    game.actions.push({action: "Insurance", amount: game.bet / 2});
    if(game.isBlackjack(game.dealer)) {
        await game.end(true);
        return;
    } 
    return "The dealer did not have blackjack!";
}

const noInsurance = async (interaction: ButtonInteraction, game: Blackjack) => {
    if(game.isBlackjack(game.dealer)) {
        await game.end();
        return;
    }
    return "The dealer did not have blackjack!";
}

const checkDealerBJ = async (interaction: ButtonInteraction, game: Blackjack) => {
    if(game.isBlackjack(game.dealer)) {
        await game.end();
        return;
    }
    return "The dealer did not have blackjack!";
}

const checkUserBJ = async (interaction: ButtonInteraction, game: Blackjack) => {
    if(game.hand.getNumOfSplits() !== game.focusedSplit + 1) await game.stand();
    else await game.end();
}