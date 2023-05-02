import { dim, green, red } from "chalk";
import { FLOAT, SQLInterface, SQL_FLOAT, SQL_VARCHAR, VARCHAR } from "../types/types";
import { log } from "../utils/logger";
import { ErrTag, SQLTag } from "../constants/constants";
import { Connection, ConnectionOptions, RowDataPacket, createConnection } from "mysql2/promise";

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

    async exec(query: string, values?: unknown[]) {
        log(dim(query), SQLTag);
        return await this._sql.exec(query, values);
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

    //This method should be included in all features that use SQL.
    //This method can be run before any kind of getting or setting that is done in the DB.
    //It will check if the record exists, and if it doesn't it will create it.
    //It must be modified to fit the needs of the feature.
    //This, for example, adds a record (userID, guildID, balance, bank, xp).
    //And sets them to the default values that we've determined.
    private checkAndadd(uid: string, gid: string) {
        if(uid.length > 20 || gid.length > 20)
            return log(red(`Invalid UID or GID Length: ${dim(uid)} ${dim(gid)}`), `${ErrTag}|${SQLTag}`);

        const query = this.genInsertQuery();
        //The first 5 entries are for each of the fields in the table, the final two are for the prim keys used for determining if the record already exists.
        const values = [uid, gid, 500, 0, 0, uid, gid];
        this.exec(query, values);
    }

    async getBalance(uid: string, gid: string): Promise<[number, number]> {
        this.checkAndadd(uid, gid);
        const query = `SELECT balance, bank FROM ECONOMY WHERE uid = ? AND gid = ?`;
        const [rows] = await this.exec(query, [uid, gid]);
        return [rows[0].balance, rows[0].bank];
    }

    async addBalance(uid: string, gid: string, amount: number): Promise<[number, number]> {
        this.checkAndadd(uid, gid);
        const query = `UPDATE ECONOMY SET balance = balance + ? WHERE uid = ? AND gid = ?`;
        await this.exec(query, [amount, uid, gid]);
        return await this.getBalance(uid, gid);
    }

    async setBalance(uid: string, gid: string, amount: number): Promise<[number, number]> {
        this.checkAndadd(uid, gid);
        const query = `UPDATE ECONOMY SET balance = ? WHERE uid = ? AND gid = ?`;
        await this.exec(query, [amount, uid, gid]);
        return await this.getBalance(uid, gid);
    }

    async addBank(uid: string, gid: string, amount: number): Promise<[number, number]> {
        this.checkAndadd(uid, gid);
        const query = `UPDATE ECONOMY SET bank = bank + ? WHERE uid = ? AND gid = ?`;
        await this.exec(query, [amount, uid, gid]);
        return await this.getBalance(uid, gid);
    }

    async setBank(uid: string, gid: string, amount: number): Promise<[number, number]> {
        this.checkAndadd(uid, gid);
        const query = `UPDATE ECONOMY SET bank = ? WHERE uid = ? AND gid = ?`;
        await this.exec(query, [amount, uid, gid]);
        return await this.getBalance(uid, gid);
    }

    async addXP(uid: string, gid: string, amount: number): Promise<number> {
        this.checkAndadd(uid, gid);
        const query = `UPDATE ECONOMY SET xp = xp + ? WHERE uid = ? AND gid = ?`;
        await this.exec(query, [amount, uid, gid]);
        return await this.getXP(uid, gid);
    }

    async setXP(uid: string, gid: string, amount: number): Promise<number> {
        this.checkAndadd(uid, gid);
        const query = `UPDATE ECONOMY SET xp = ? WHERE uid = ? AND gid = ?`;
        await this.exec(query, [amount, uid, gid]);
        return await this.getXP(uid, gid);
    }

    async getXP(uid: string, gid: string): Promise<number> {
        this.checkAndadd(uid, gid);
        const query = `SELECT xp FROM ECONOMY WHERE uid = ? AND gid = ?`;
        const [rows] = await this.exec(query, [uid, gid]);
        return rows[0].xp;
    }

    async getTopBalances(gid: string, limit: number): Promise<[string, number][]> {
        const query = `SELECT uid, balance, bank, (balance + bank) as total_amount FROM ECONOMY WHERE gid = ? ORDER BY total_amount DESC, balance DESC`;
        const [rows] = await this.exec(query, [gid]) as RowDataPacket[];
        return rows.slice(0, limit).map(row => [row.uid, row.total_amount]);
    }        
    
    async getTopXP(gid: string, limit: number): Promise<[string, number][]> {
        const query = `SELECT uid, xp FROM ECONOMY WHERE gid = ? ORDER BY xp DESC`;
        const [rows] = await this.exec(query, [gid]) as RowDataPacket[];
        return rows.slice(0, limit).map(row => [row.uid, row.xp]);
    }

    async removeRecord(uid: string, gid: string) {
        const query = `DELETE FROM ECONOMY WHERE uid = ? AND gid = ?`;
        await this.exec(query, [uid, gid]);
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

