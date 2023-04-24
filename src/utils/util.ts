import { bot } from "../cache";
import { existsSync, lstatSync, readdirSync } from "fs";
import { join, sep } from "path";
import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { token } from "../../config.json";
import { log } from "./logger";

import { dim, grey, red, yellow } from "chalk";
import { ErrTag, LoadTag, SlashTag } from "../constants/constants";

export async function loadAll() {
    const targetFiles = readdirSync(join(__dirname, "../")).filter(f=>!f.endsWith(".ts"));

    const loadData = await loadDir(join(__dirname, "../"), f=>targetFiles.includes(f));

    bot.removeAllEvents();

    for(const data of loadData) {
        const parts = data.path.split(sep);
        const cmdIndex = parts.lastIndexOf("commands");
        const evtIndex = parts.lastIndexOf("events");

        if(cmdIndex !== -1 && cmdIndex < parts.length - 1)
            bot.addCommand(data.default, data.path);
        else if(evtIndex !== -1 && evtIndex < parts.length - 1)
            bot.addEvent(data.default, data.path);
    }
    
    bot.bindAllEvents();
}

export async function refreshGuildSlashes(guildId: string) {
    const commandFiles: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    bot.getCommands().forEach(command => {
        const cData = command.getData();
        const obj = cData.toJSON();

        obj.description += ` ⋆ ${command.getModule()}`;
        obj.options?.forEach(option => {
            option.description += ` ⋆ ${command.getModule()}`;
        })
        
        if(obj.name === "reload") {
            const folders = readdirSync(join(__dirname, "../")).filter(f=>!f.endsWith(".ts"));
            // @ts-ignore I can't figure out the correct typing it's no big deal.
            obj.options[obj.options.findIndex(o=>o.name==="folder")].options[0].choices = folders.map(f=>({name: f, value: f}));
        }

        commandFiles.push(obj);
    })

    if(!commandFiles.length) return;

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        const data = await rest.put(
            Routes.applicationGuildCommands(bot.user!.id, guildId),
            { body: commandFiles },
        ) as [];
        
        log(yellow(`Refreshed Commands ${dim(data.length)} ${dim(grey(guildId))}`), SlashTag);
    } catch (_error) {
        log(red("Refresh Failure! ") + dim(grey(guildId)), `${ErrTag}|${SlashTag}`);
    }
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function loadDir(dir: string, filter?: (file: string) => boolean) {
    if (!existsSync(dir)) throw new Error(`Directory ${dir} does not exist!`);
    if (!lstatSync(dir).isDirectory()) throw new Error(`${dir} is not a directory!`);
  
    const files = readdirSync(dir);
    const loaded = [];
  
    for (const file of files) {
      if (filter && !filter(file)) continue;
      const filePath = join(dir, file);
      if (lstatSync(filePath).isDirectory()) {
        const subDirFiles = await loadDir(filePath);
        loaded.push(...subDirFiles);
        continue;
      }
      if (!file.endsWith(".ts")) continue;
  
      try {
        const module = await import(filePath);
        module.path = filePath;
        loaded.push(module);
        delete require.cache[filePath];
        log(`${dim(filePath.slice(filePath.indexOf("src")))}`, LoadTag);
      } catch(err) {
        console.log(err);
        log(`${dim(filePath.slice(filePath.indexOf("src")))}`, `${ErrTag} ${LoadTag}`);
      }
    }
  
    return loaded;
  }
  
export function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function rad(deg: number): number {
    return deg * Math.PI / 180;
}