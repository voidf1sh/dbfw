import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { SQL } from "../../../cache";
import { addCurrencyMgr, addXPMgr, removeCurrencyMgr, removeUserMgr, setCurrencyMgr, userNotFoundEconMgr } from "../embeds/econEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("econ-manager")
        .setDescription("Manage your guild's economy.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("add-currency")
                .setDescription("Add currency to a user.")
                .addStringOption(option => 
                    option
                        .setName("where")
                        .setDescription("Where to add currency.")
                        .setRequired(true)
                        .addChoices({name: "wallet", value: "wallet"}, {name: "bank", value: "bank"})
                )
                .addUserOption(option =>
                    option
                        .setName("to")
                        .setDescription("The user to add currency to.")
                        .setRequired(true)
                )
                .addNumberOption(option =>
                    option
                        .setName("amount")
                        .setDescription("The amount of currency to add.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove-currency")
                .setDescription("Remove currency from a user.")
                .addStringOption(option => 
                    option
                        .setName("where")
                        .setDescription("Where to remove currency.")
                        .setRequired(true)
                        .addChoices({name: "wallet", value: "wallet"}, {name: "bank", value: "bank"})
                )
                .addUserOption(option =>
                    option
                        .setName("from")
                        .setDescription("The user to remove currency from.")
                        .setRequired(true)
                )
                .addNumberOption(option =>
                    option
                        .setName("amount")
                        .setDescription("The amount of currency to remove.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("set-currency")
                .setDescription("Set currency to a user.")
                .addStringOption(option => 
                    option
                        .setName("where")
                        .setDescription("Where to set currency.")
                        .setRequired(true)
                        .addChoices({name: "wallet", value: "wallet"}, {name: "bank", value: "bank"})
                )
                .addUserOption(option =>
                    option
                        .setName("to")
                        .setDescription("The user to set currency to.")
                        .setRequired(true)
                )
                .addNumberOption(option =>
                    option
                        .setName("amount")
                        .setDescription("The amount of currency to set.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("add-xp")
                .setDescription("Add xp to a user.")
                .addUserOption(option =>
                    option
                        .setName("to")
                        .setDescription("The user to add xp to.")
                        .setRequired(true)
                )
                .addNumberOption(option =>
                    option
                        .setName("amount")
                        .setDescription("The amount of xp to add.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("delete-user")
                .setDescription("Remove user record from econ database.")
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription("The user to remove from the database.")
                        .setRequired(true)
                )
        )
        ,
    async execute(interaction: ChatInputCommandInteraction) {
        const ops = interaction.options;
        const sub = ops.getSubcommand();

        if(sub === "add-currency") {
            const destination = ops.getString("where");
            const user = ops.getUser("to");
            const amount = ops.getNumber("amount");

            if(!user) return await interaction.reply({ embeds: [ userNotFoundEconMgr() ] });

            destination === "wallet" 
            ? SQL.Economy.addBalance(user.id, interaction.guildId, amount) 
            : SQL.Economy.addBank(user.id, interaction.guildId, amount);

            await interaction.reply({ embeds: [ addCurrencyMgr(destination, amount, user) ] });
        } else if(sub === "remove-currency") {
            const destination = ops.getString("where");
            const user = ops.getUser("from");
            const amount = ops.getNumber("amount");

            if(!user) return await interaction.reply({ embeds: [ userNotFoundEconMgr() ] });

            destination === "wallet" 
            ? SQL.Economy.addBalance(user.id, interaction.guildId, -amount) 
            : SQL.Economy.addBank(user.id, interaction.guildId, -amount);

            await interaction.reply({ embeds: [ removeCurrencyMgr(destination, amount, user) ] });
        } else if(sub === "set-currency") {
            const destination = ops.getString("where");
            const user = ops.getUser("to");
            const amount = ops.getNumber("amount");

            if(!user) return await interaction.reply({ embeds: [ userNotFoundEconMgr() ] });

            destination === "wallet" 
            ? SQL.Economy.setBalance(user.id, interaction.guildId, amount) 
            : SQL.Economy.setBank(user.id, interaction.guildId, amount);

            await interaction.reply({ embeds: [ setCurrencyMgr(destination, amount, user) ] });
        } else if(sub === "add-xp") {
            const user = ops.getUser("to");
            const amount = ops.getNumber("amount");

            if(!user) return await interaction.reply({ embeds: [ userNotFoundEconMgr() ] });

            SQL.Economy.addXP(user.id, interaction.guildId, amount);

            await interaction.reply({ embeds: [ addXPMgr(amount, user) ] });
        } else if(sub === "delete-user") {
            const user = ops.getUser("user");

            if(!user) return await interaction.reply({ embeds: [ userNotFoundEconMgr() ] });

            SQL.Economy.removeRecord(user.id, interaction.guildId);

            await interaction.reply({ embeds: [ removeUserMgr(user) ] });
        }
    }
};