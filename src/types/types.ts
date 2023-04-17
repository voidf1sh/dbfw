import { Module } from "../enums/enums"
import { Client, ClientEvents, Collection, CommandInteraction, SlashCommandBuilder } from "discord.js"
import { Command, Event } from "../structs/structs";
import { Connection, FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface BotInterface extends Client<boolean> {
    addCommand: (data: CommandData, path: string) => void;
    addEvent: (data: EventData, path: string) => void;
    bindEvent: (name: string) => void;
    bindAllEvents: () => void;
    clearCommands: () => void;
    getCommand: (name: string) => Command | undefined;
    getCommands: () => Collection<string, Command>;
    getEvents: () => Collection<string, Event>;
    getHiddenEventField(): [object: null];
    getModules: () => Module[];
    removeEvent: (name: string) => void;
    removeAllEvents: () => void;
}

export interface CommandInterface {
    getData: () => SlashCommandBuilder;
    getModule: () => Module;
    getPath: () => string;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

export interface EventInterface {
    bind: () => void;
    execute: (...args: unknown[]) => Promise<void>;
    getEvent: () => keyof ClientEvents;
    getIndex: () => number;
    getName: () => string;
    getPath: () => string;
    isOnce: () => boolean;
}

export interface SQLInterface {
    getConnection: () => Connection;
    connect: () => Promise<void>;
    query: (q: string) => Promise<[RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]]>;
}

export type LoadData<T> = Collection<T, {success: string[], failed: string[]}>
export type CommandData = {data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>}
export type EventData = {name: string, event: keyof ClientEvents, once?: boolean, execute: (...args: unknown[]) => Promise<void>}
