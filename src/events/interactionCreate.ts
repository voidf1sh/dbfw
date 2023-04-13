import { CommandInteraction } from "discord.js";
import bot from "../cache";
import { log } from "../utils/logger";
import { cyan, dim, grey, red } from "chalk";
import { CmdTag, ErrTag } from "../constants/constants";


export default {
    name: "globalInteractionCreate",
    event: "interactionCreate",
    once: false,
    execute: async (interaction: CommandInteraction) => {
        //For right now, global cmd handler only deals with slash command interactions.
        if (!interaction.isChatInputCommand()) return;
        
        const command = bot.getCommand(interaction.commandName);

        if(!command) return;

        try {
            await command.execute(interaction);
            log(cyan(`/${interaction.commandName} ${interaction.user.tag} `) + dim(grey(`[${interaction.user.id}] ${interaction.guild?.id}`)), CmdTag);
        } catch (error) {
            console.error(error);
            if(interaction.deferred) await interaction.editReply({content: "There was an error running this command."});
            else await interaction.reply({content: "There was an error running this command."});
            log(red(`/${interaction.commandName} ${interaction.user.tag} `) + dim(grey(`[${interaction.user.id}] ${interaction.guild?.id}`)), `${ErrTag} ${CmdTag}`);
        }
    }
}