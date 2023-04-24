import { dim, green, red } from "chalk";
import { FLOAT, SQLInterface, SQL_FLOAT, SQL_VARCHAR, VARCHAR } from "../types/types";
import { log } from "../utils/logger";
import { ErrTag, SQLTag } from "../constants/constants";
import { Connection, ConnectionOptions, createConnection } from "mysql2/promise";

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

