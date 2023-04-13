import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { loadAll, loadDir } from "../../../utils/util";
import { reloadEmbed } from "../Embeds/generalEmbeds";
import { CommandData, EventData } from "../../../types/types";
import { join, sep } from "path";
import bot from "../../../cache";

//The choices for this command are assigned in a special way, so you wont see them being assigned in this file.

export default {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reload sections of the bot without restarting it.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("all")
                .setDescription("Reloads everything.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("folder")
                .setDescription("Reloads a folder.")
                .addStringOption(option =>
                    option
                        .setName("folder")
                        .setDescription("The folder to reload.")
                        .setRequired(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const ops = interaction.options;
        const sub = ops.getSubcommand();
        interaction.options.getString("folder");

        await interaction.deferReply();

        if(sub === "all") {
            await loadAll();
            await interaction.editReply({ embeds: [reloadEmbed("Reloaded Everything!")] });
        } else if(sub === "folder") {
            const folder = ops.getString("folder");
            const path = join(__dirname, "../../../", folder);
            const loadData: {default: CommandData, path: string}[] | {default: EventData, path: string}[] = await loadDir(path) as unknown as {default: CommandData, path: string}[] | {default: EventData, path: string}[];

            if(folder === "events") {
                for(const data of loadData as {default: EventData, path: string}[]) {
                    bot.removeEvent(data.default.name);
                    bot.addEvent(data.default, data.path);
                    bot.bindEvent(data.default.name);
                }
            }

            if(folder === "modules") {
                for(const data of loadData as {default: CommandData, path: string}[] | {default: EventData, path: string}[]) {
                    const parts = data.path.split(sep);
                    const cmdIndex = parts.lastIndexOf("commands");
                    const evtIndex = parts.lastIndexOf("events");
            
                    if(cmdIndex !== -1 && cmdIndex < parts.length - 1)
                        bot.addCommand(data.default as CommandData, data.path);
                    else if(evtIndex !== -1 && evtIndex < parts.length - 1) {
                        bot.removeEvent((data.default as EventData).name);
                        bot.addEvent(data.default as EventData, data.path);
                        bot.bindEvent((data.default as EventData).name);
                    }
                }
            }

            await interaction.editReply({ embeds: [reloadEmbed(`Reloaded: \`${folder}\`!`)] });
        }
    }
}
