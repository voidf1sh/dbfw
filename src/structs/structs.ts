import { 
    Client,
    ClientEvents,
    ClientOptions, 
    Collection, 
    CommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import { Module } from "../enums/enums";
import { BotInterface, CommandData, CommandInterface, EventData, EventInterface, FLOAT, SQLInterface, SQL_FLOAT, SQL_VARCHAR, VARCHAR } from "../types/types";
import { basename, join } from "path";
import { Connection, ConnectionOptions, createConnection } from "mysql2/promise";
import { bot } from "../cache";
import { log } from "../utils/logger";
import { ErrTag, SQLTag } from "../constants/constants";
import { green, dim, red } from "chalk";


export class Bot extends Client<boolean> implements BotInterface {
    private commands: Collection<string, Command>;
    private events: Collection<string, Event>;
    private _events: [object: null];

    constructor(ClientOptions: ClientOptions) {
        super(ClientOptions)
        this.commands = new Collection<string, Command>();
        this.events = new Collection<string, Event>();
    }

    bindAllEvents(): void {
        this.events.forEach(event => event.bind());
    }

    bindEvent(name: string): void {
        this.events.get(name)?.bind();
    }

    clearCommands(): void {
        this.commands.clear();
    }

    getCommand(cmd: string): Command | undefined {
        return this.commands.get(cmd);
    }

    getCommands(): Collection<string, Command> {
        return Object.freeze(new Collection<string, Command>(this.commands));
    }

    getEvents(): Collection<string, Event> {
        return Object.freeze(new Collection<string, Event>(this.events));
    }

    getHiddenEventField(): [object: null] {
        return this._events;
    }

    getModules(): Module[] {
        return [...new Set(this.commands.map(command => command.getModule()))];
    }

    addCommand(data: CommandData, path: string):  void {
            this.commands.set(data.data.name, new Command(data, path));
    }

    addEvent(data: EventData, path: string): void {
            this.events.set(data.name, new Event(data, path));
    }

    removeEvent(name: string) {
        const event = this.events.get(name);
        if(!event) return;

        if(event.getIndex() === -1) {
            this.events.delete(name);
            return;
        }

        if(event.getIndex() === 0 && this._events[event.getEvent()].length < 2) delete this._events[event.getEvent()];
        else this._events[event.getEvent()].splice(event.getIndex(), 1);

        this.events.delete(name);
    }

    removeAllEvents(): void {
        this.events.forEach(event => this.removeEvent(event.getName()));
    }
}

export class Command implements CommandInterface {
    private data: SlashCommandBuilder;
    private module: Module;
    private path: string;

    execute: (interaction: CommandInteraction) => Promise<void>;

    constructor({data, execute}: CommandData, path: string) {
        this.data = data;
        this.execute = execute;
        this.path = path;
        this.module = basename(join(path, "../../")) as Module;
    }

    getData(): SlashCommandBuilder {
        return this.data;
    }

    getModule(): Module {
        return this.module;
    }

    getPath(): string {
        return this.path;
    }
}

export class Event implements EventInterface {
    private event: keyof ClientEvents;
    private index: number;
    private name: string;
    private once?: boolean;
    private path: string;
    execute: (...args: unknown[]) => Promise<void>;

    constructor({name, event, once = false, execute}: EventData, path: string) {
        this.name = name;
        this.event = event;
        this.once = once;
        this.execute = execute;
        this.path = path;
        this.index = -1;
    }

    bind = () => {
        this.once
        ? bot.on(this.event, (...args) => {
            try { this.execute(...args) }
            catch(_) {/**/}
            bot.removeEvent(this.name);
        })
        : bot.on(this.event, (...args) => {
            try { this.execute(...args) }
            catch(_) {/**/}
        });

        const length = bot.getHiddenEventField()[this.event].length;
        length === 0 ? this.index = 0 : this.index = length-1;
    }

    getEvent(): keyof ClientEvents {
        return this.event;
    }

    getIndex(): number {
        return this.index;
    }

    getName(): string {
        return this.name;
    }

    getPath(): string {
        return this.path;
    }

    isOnce(): boolean {
        return this.once;
    }
}

class BaseTable {
    protected _sql: SQLInterface;

    constructor(sql: SQLInterface) {
        this._sql = sql;
    }

    createTableQuery(): string {
        const tblname = this.constructor.name.toUpperCase();

        const schema = Object
            .entries(this)
            .filter(([key, value]) => typeof value !== "function" && !key.startsWith("_"))
            .map(([key, value]) => {
                if(key.endsWith("_pk")) return `${key.slice(0, -3)} ${value.toString()}`
                return `${key} ${value.toString()}`
            })
            .join(", ");
    
        const query = `CREATE TABLE IF NOT EXISTS ${tblname}(${schema})`;
    
        return query;
    }

    genInsertQuery(): string {
        const tblname = this.constructor.name.toUpperCase();

        const keys = Object
            .entries(this)
            .filter(([key, value]) => typeof value !== "function" && !key.startsWith("_"))
            .map(([key, _value]) => {
                if(key.endsWith("_pk")) return key.slice(0, -3);
                return key;
            });

        const primKeys = Object
            .entries(this)
            .filter(([key, value]) => typeof value !== "function" && !key.startsWith("_") && key.endsWith("_pk"))
            .map(([key, _value]) => key.slice(0, -3));
    
        //Create a variable that maps the arugment values following the example:
        const vars = new Array(keys.length).fill("?").join(", ");
    
        const query = `INSERT INTO ${tblname} (${keys.join(", ")}) `
            + `SELECT ${vars} `
            + `WHERE NOT EXISTS (SELECT * FROM ${tblname} WHERE ${primKeys.map(key => `${key} = ?`).join(" AND ")})`;

        return query;
    }
}

class Economy extends BaseTable {
    private uid_pk: SQL_VARCHAR;
    private gid_pk: SQL_VARCHAR;
    private balance: SQL_FLOAT;
    private bank: SQL_FLOAT;
    private xp: SQL_FLOAT;
    
    constructor(sql: SQLInterface) {
        super(sql);
        this.uid_pk =      new VARCHAR(20, false);
        this.gid_pk =      new VARCHAR(20, false);
        this.balance =  new FLOAT(2, false);
        this.bank =     new FLOAT(2, false);
        this.xp =       new FLOAT(2, false);
    }

    private checkAndadd(uid: string, gid: string) {
        if(uid.length > 20 || gid.length > 20)
            return log(red(`Invalid UID or GID Length: ${dim(uid)} ${dim(gid)}`), `${ErrTag}|${SQLTag}`);

        const query = this.genInsertQuery();
        //The first 5 entries are for each of the fields in the table, the final two are for the prim keys used for determining if the record already exists.
        const values = [uid, gid, 500, 0, 0, uid, gid];
        console.log(values);
        this._sql.exec(query, values);
    }

    async getBalance(uid: string, gid: string): Promise<[number, number]> {
        this.checkAndadd(uid, gid);
        const query = `SELECT balance, bank FROM ECONOMY WHERE uid = ? AND gid = ?`;
        const [rows] = await this._sql.exec(query, [uid, gid]);
        return [rows[0].balance, rows[0].bank];
    }
}

export class SQLClass implements SQLInterface {
    private config: ConnectionOptions
    private connection: Connection;

    Economy: Economy;

    constructor(config: ConnectionOptions) {
        this.config = config;
        this.init();
    }

    private async init() {
        this.connection = await createConnection(this.config);
        log(green("Connected to SQL database!"), SQLTag);

        await this.query("CREATE DATABASE IF NOT EXISTS DISCORD");
        await this.connection.changeUser({database: "DISCORD"});

        this.Economy = new Economy(this);
        await this.query(this.Economy.createTableQuery());
    }

    async exec(query: string, values?: unknown[]) {
        return await this.connection.execute(query, values);
    }

    getConnection(): Connection {
        return this.connection;
    } 

    async query(query: string) {
        log(dim(query), SQLTag);
        return await this.connection.execute(query);
    }
}