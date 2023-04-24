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
    exec: (query: string, values?: unknown[]) => Promise<[RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]]>;
    getConnection: () => Connection;
    query: (query: string) => Promise<[RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader, FieldPacket[]]>;
}

export type LoadData<T> = Collection<T, {success: string[], failed: string[]}>;
export type CommandData = {data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>};
export type EventData = {name: string, event: keyof ClientEvents, once?: boolean, execute: (...args: unknown[]) => Promise<void>};

export type SQL_VARCHAR = {size: number, type: string, null: boolean};
export type SQL_FLOAT = {size: number, type: number, null: boolean};
export type SQL_INT = {type: "INT", null?: boolean};

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

export type IntRage<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

export type SQLTypes = SQL_INT | SQL_FLOAT | SQL_VARCHAR;

export class VARCHAR implements SQL_VARCHAR {
    size: number;
    type: string;
    null: boolean;

    constructor(size: number, isNull: boolean = true) {
        this.size = size;
        this.null = isNull;
    }

    toString(): string {
        return `VARCHAR(${this.size})${this.null ? " NULL" : " NOT NULL"}`;
    }
}

export class FLOAT implements SQL_FLOAT {
    size: number;
    type: number;
    null: boolean;

    constructor(size: number, isNull: boolean = true) {
        this.size = size;
        this.null = isNull;
    }

    toString(): string {
        return `FLOAT(${this.size})${this.null ? " NULL" : " NOT NULL"}`;
    }
}
