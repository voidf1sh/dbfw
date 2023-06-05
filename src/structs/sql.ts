import { dim, green, red } from "chalk";
import { BIGINT, FLOAT, INT, SQLInterface, SQL_FLOAT, SQL_INT, SQL_VARCHAR, VARCHAR } from "../types/types";
import { log } from "../utils/logger";
import { ErrTag, SQLTag } from "../constants/constants";
import { Connection, ConnectionOptions, RowDataPacket, createConnection } from "mysql2/promise";
import { Channel, Message, User } from "discord.js";

//311282416176070658

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
        return await await this._sql.exec(query, values);
    }
}

class Users extends BaseTable {
    private did_pk: SQL_VARCHAR;
    private username: SQL_VARCHAR;
    private avatar_url: SQL_VARCHAR;
    private record_created: SQL_INT;
    private nickname: SQL_VARCHAR;
    private nicknameCount : SQL_INT;

    constructor(sql: SQLInterface) {
        super(sql);
        this.did_pk =           new VARCHAR(20, false);
        this.username =         new VARCHAR(32, false);
        this.avatar_url =       new VARCHAR(128, false);
        this.record_created =   new BIGINT(false);
        this.nickname =         new VARCHAR(200, false);
        this.nicknameCount =    new INT(false);
    }

    private async checkAndAdd(did: string, username: string, avatar_url: string, record_created: number, nickname: string, nicknameCount = 0) {
        const query = this.genInsertQuery();
        const values = [did, username, avatar_url, record_created, nickname, nicknameCount, did];
        return await this._sql.exec(query, values);
    }

    async addUser(user: User) {
        return await this.checkAndAdd(user.id, user.username, user.avatarURL(), Date.now(), user.username);
    }

    async getNickname(user: User): Promise<[string]> {
        await this.checkAndAdd(user.id, user.username, user.avatarURL(), Date.now(), user.username);
        const query = `SELECT nickname FROM USERS WHERE did = ?`;
        const [rows] = await this._sql.exec(query, [user.id]);
        return [rows[0].nickname];
    }

    async hasNickname(nickname: string): Promise<string[]> {
        const query = `Select DISTINCT u.did from USERS u, GAMERS gr where u.nickname = ? AND u.did=gr.did`;
        const [rows] = await this._sql.exec(query, [nickname]) as RowDataPacket[]; 
        return rows.map(r => r.did);
    }

    async setNickname(user: User, nickname: string): Promise<[string]> {
        await this.checkAndAdd(user.id, user.username, user.avatarURL(), Date.now(), user.username);
        const query = `UPDATE USER SET nickname = ? WHERE did = ?`;
        await this._sql.exec(query, [nickname, user.id]);
        return await this.getNickname(user);
    }

    async addNicknameCount(user: User): Promise<[string]> {
        await this.checkAndAdd(user.id, user.username, user.avatarURL(), Date.now(), user.username);
        const query = `UPDATE USER SET nicknameCount = nicknameCount + 1 WHERE did = ?`;
        await this._sql.exec(query, [user.id]);
        return await this.getNickname(user);
    }

    async removeRecord(did: string) {
        const query = `DELETE FROM USERS WHERE did = ?`;
        await this._sql.exec(query, [did]);
    }
}

class Guilds extends BaseTable {
    private gid_pk: SQL_VARCHAR;
    private guild_name: SQL_VARCHAR;
    private icon_url: SQL_VARCHAR;
    private record_created: SQL_INT;

    constructor(sql: SQLInterface) {
        super(sql);
        this.gid_pk =           new VARCHAR(20, false);
        this.guild_name =       new VARCHAR(100, false);
        this.icon_url =         new VARCHAR(128, false);
        this.record_created =   new BIGINT(false);
    }
}

class User_Guild extends BaseTable {
    private user_guild_id_pk: SQL_INT;
    private did: SQL_VARCHAR;
    private gid: SQL_VARCHAR;

    constructor(sql: SQLInterface) {
        super(sql);
        this.user_guild_id_pk = new INT(false);
        this.did =              new VARCHAR(20, false);
        this.gid =              new VARCHAR(20, false);
    }
}

class Channels extends BaseTable {
    private channel_id_pk: SQL_VARCHAR;
    private gid: SQL_VARCHAR;
    private channel_type: SQL_VARCHAR;
    private record_created: SQL_INT;

    constructor(sql: SQLInterface) {
        super(sql);
        this.channel_id_pk =    new VARCHAR(20, false);
        this.gid =              new VARCHAR(20, false);
        this.channel_type =     new VARCHAR(20, false);
        this.record_created =   new BIGINT(false);
    }

    private async checkAndAdd(cid: string, gid: string, type: string, time: number) {
        const query = this.genInsertQuery();
        const values = [cid, gid, type, time, cid];
        await this._sql.exec(query, values);
    }

    async addChannel(channel: Channel, gid: string) {
        await this.checkAndAdd(channel.id, gid, channel.type.toString(), Date.now());
    }
}

class Messages extends BaseTable {
    private message_id_pk: SQL_VARCHAR;
    private channel_id: SQL_VARCHAR;
    private discord_id: SQL_VARCHAR;
    private content: SQL_VARCHAR;
    private time_sent: SQL_INT;

    constructor(sql: SQLInterface) {
        super(sql);
        this.message_id_pk =    new VARCHAR(20, false);
        this.channel_id =       new VARCHAR(20, false);
        this.discord_id =       new VARCHAR(20, false);
        this.content =          new VARCHAR(6000, false);
        this.time_sent =        new BIGINT(false);
    }

    private async checkAndAdd(mid: string, cid: string, did: string, content: string, time: number) {
        const query = this.genInsertQuery();
        const values = [mid, cid, did, content, time, mid];
        await this._sql.exec(query, values);
    }

    async addMsg(msg: Message) {
        await this.checkAndAdd(msg.id, msg.channel.id, msg.author.id, msg.content, msg.createdTimestamp);
    }
}

class Games extends BaseTable {
    private game_pk: SQL_VARCHAR;
    private gameInstructions: SQL_VARCHAR;
    private length: SQL_INT;

    constructor(sql: SQLInterface) {
        super(sql);
        this.game_pk =          new VARCHAR(100, false);
        this.gameInstructions = new VARCHAR(255, false);
        this.length =           new INT(false);
    }

    private async checkAndAdd(game: string) {
        if(game.length > 30)
            return log(red(`Invalid Game Length: ${dim(game)}`), `${ErrTag}|${SQLTag}`);

        const query = this.genInsertQuery();
        const values = [game, 'None', 0, game];
        await this._sql.exec(query, values);
    }

    async getGame(game: string): Promise<[string]> {
        await this.checkAndAdd(game);
        const query = `SELECT game FROM GAMES WHERE game = ?`;
        const [rows] = await this._sql.exec(query, [game]);
        return [rows[0].game];
    }
    async getInstructions(game: string): Promise<[string]> {
        await this.checkAndAdd(game);
        const query = `SELECT gameInstructions FROM GAMES WHERE game = ?`;
        const [rows] = await this._sql.exec(query, [game]);
        return [rows[0].gameInstructions];
    }

    async addGame(game: string): Promise<void> {
        await this.checkAndAdd(game);
    }

    async setInstructions(game: string, instructions: string): Promise<[string]> {
        await this.checkAndAdd(game);
        const query = `UPDATE GAMES SET gameInstructions = ? WHERE game = ?`;
        await this._sql.exec(query, [instructions, game]);
        return await this.getGame(game);
    }

    async setLength(game: string, length: number): Promise<[string]> {
        await this.checkAndAdd(game);
        const query = `UPDATE GAMES SET length = ? WHERE game = ?`;
        await this._sql.exec(query, [length, game]);
        return await this.getGame(game);
    }

    async getLength(maxlength: number): Promise<[string]> {
        const query = `SELECT game FROM GAMES WHERE length <= ?`;
        const [rows] = await this._sql.exec(query, [maxlength]) as RowDataPacket[]; 
        return rows.map(r => r.game);
    }

    async removeRecord(game: string) {
        const query = `DELETE FROM GAME WHERE game = ?`;
        await this._sql.exec(query, [game]);
    }
}

class Gamers extends BaseTable {
    private did_pk: SQL_VARCHAR;
    private game_pk: SQL_VARCHAR;
    private hours: SQL_FLOAT;

    constructor(sql: SQLInterface) {
        super(sql);
        this.did_pk =           new VARCHAR(20, false);
        this.game_pk =          new VARCHAR(100, false);
        this.hours =            new FLOAT(2, false);
    }

    private async checkAndAdd(game: string, did: string) {
        if(game.length > 30 || did.length > 20)
            return log(red(`Invalid Game or discord id Length: ${dim(game)} ${dim(did)}`), `${ErrTag}|${SQLTag}`);

        const query = this.genInsertQuery();
        const values = [did, game, 5, game, did];
        await this._sql.exec(query, values);
    }

    async addGamer(game: string, did: string): Promise<void> {
        await this.checkAndAdd(game, did);
    }

    async getGamer(game: string, did: string): Promise<[string]> {
        await this.checkAndAdd(game, did);
        const query = `SELECT did FROM GAMERS WHERE game = ? and did = ?`;
        const [rows] = await this._sql.exec(query, [game, did]);
        return [rows[0].did];
    }

    async getGamersOfGame(game: string): Promise<string[]> {
        const query = `SELECT DISTINCT gr.did, gr.hours from GAMERS gr where gr.did in (SELECT gr.did FROM GAMES g, GAMERS gr, USERS u WHERE g.game = ? AND g.game = gr.game) ORDER BY gr.hours desc`;
        const [rows] = await this._sql.exec(query, [game]) as RowDataPacket[]; 
        return rows.map(r => r.did);
    }

    async getGamersTotalHours(did: string): Promise<string[]> {
        const query = `select u.did, u.nickname, sum(hours) as total_h from USERS u left outer join GAMERS gr on u.did = gr.did group by u.did, u.nickname having u.did = ? order by u.did`;
        const [rows] = await this._sql.exec(query, [did]) as RowDataPacket[]; 
        return rows.map(r => r.total_h);
    }


    async addHoursPlayed(game: string, did: string, addTime: number): Promise<[string]>{
        await this.checkAndAdd(game, did);
        const query = `UPDATE GAMERS SET hours = hours + ? WHERE did = ? AND game = ?`;
        await this._sql.exec(query, [addTime, game, did]);
        return await this.getGamer(game, did);
    }

    async removeRecord(game: string, did: string) {
        const query = `DELETE FROM GAMERS WHERE game = ? and did = ?`;
        await this._sql.exec(query, [game, did]);
    }
}

class Economy extends BaseTable {
    private did_pk: SQL_VARCHAR;
    private gid_pk: SQL_VARCHAR;
    private balance: SQL_FLOAT;
    private bank: SQL_FLOAT;
    private xp: SQL_FLOAT;
    
    constructor(sql: SQLInterface) {
        super(sql);
        this.did_pk =      new VARCHAR(20, false);
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
    private async checkAndAdd(did: string, gid: string) {
        if(did.length > 20 || gid.length > 20)
            return log(red(`Invalid did or GID Length: ${dim(did)} ${dim(gid)}`), `${ErrTag}|${SQLTag}`);

        const query = this.genInsertQuery();
        //The first 5 entries are for each of the fields in the table, the final two are for the prim keys used for determining if the record already exists.
        const values = [did, gid, 500, 0, 0, did, gid];
        this.exec(query, values);
    }

    async getBalance(did: string, gid: string): Promise<[number, number]> {
        await this.checkAndAdd(did, gid);
        const query = `SELECT balance, bank FROM ECONOMY WHERE did = ? AND gid = ?`;
        const [rows] = await this.exec(query, [did, gid]);
        return [rows[0].balance, rows[0].bank];
    }

    async addBalance(did: string, gid: string, amount: number): Promise<[number, number]> {
        await this.checkAndAdd(did, gid);
        const query = `UPDATE ECONOMY SET balance = balance + ? WHERE did = ? AND gid = ?`;
        await this.exec(query, [amount, did, gid]);
        return await this.getBalance(did, gid);
    }

    async setBalance(did: string, gid: string, amount: number): Promise<[number, number]> {
        await this.checkAndAdd(did, gid);
        const query = `UPDATE ECONOMY SET balance = ? WHERE did = ? AND gid = ?`;
        await this.exec(query, [amount, did, gid]);
        return await this.getBalance(did, gid);
    }

    async addBank(did: string, gid: string, amount: number): Promise<[number, number]> {
        await this.checkAndAdd(did, gid);
        const query = `UPDATE ECONOMY SET bank = bank + ? WHERE did = ? AND gid = ?`;
        await this.exec(query, [amount, did, gid]);
        return await this.getBalance(did, gid);
    }

    async setBank(did: string, gid: string, amount: number): Promise<[number, number]> {
        await this.checkAndAdd(did, gid);
        const query = `UPDATE ECONOMY SET bank = ? WHERE did = ? AND gid = ?`;
        await this.exec(query, [amount, did, gid]);
        return await this.getBalance(did, gid);
    }

    async addXP(did: string, gid: string, amount: number): Promise<number> {
        await this.checkAndAdd(did, gid);
        const query = `UPDATE ECONOMY SET xp = xp + ? WHERE did = ? AND gid = ?`;
        await this.exec(query, [amount, did, gid]);
        return await this.getXP(did, gid);
    }

    async setXP(did: string, gid: string, amount: number): Promise<number> {
        await this.checkAndAdd(did, gid);
        const query = `UPDATE ECONOMY SET xp = ? WHERE did = ? AND gid = ?`;
        await this.exec(query, [amount, did, gid]);
        return await this.getXP(did, gid);
    }

    async getXP(did: string, gid: string): Promise<number> {
        await this.checkAndAdd(did, gid);
        const query = `SELECT xp FROM ECONOMY WHERE did = ? AND gid = ?`;
        const [rows] = await this.exec(query, [did, gid]);
        return rows[0].xp;
    }

    async getTopBalances(gid: string, limit: number): Promise<[string, number][]> {
        const query = `SELECT did, balance, bank, (balance + bank) as total_amount FROM ECONOMY WHERE gid = ? ORDER BY total_amount DESC, balance DESC`;
        const [rows] = await this.exec(query, [gid]) as RowDataPacket[];
        return rows.slice(0, limit).map(row => [row.did, row.total_amount]);
    }        
    
    async getTopXP(gid: string, limit: number): Promise<[string, number][]> {
        const query = `SELECT did, xp FROM ECONOMY WHERE gid = ? ORDER BY xp DESC`;
        const [rows] = await this.exec(query, [gid]) as RowDataPacket[];
        return rows.slice(0, limit).map(row => [row.did, row.xp]);
    }

    async removeRecord(did: string, gid: string) {
        const query = `DELETE FROM ECONOMY WHERE did = ? AND gid = ?`;
        await this.exec(query, [did, gid]);
    }
}

export class SQLClass implements SQLInterface {
    private config: ConnectionOptions
    private connection: Connection;

    Economy: Economy;
    Users: Users;
    Guilds: Guilds;
    Channels: Channels;
    User_Guild: User_Guild;
    Messages: Messages;
    Games: Games;
    Gamers: Gamers;

    constructor(config: ConnectionOptions) {
        this.config = config;
        this.init();
    }

    private async init() {
        this.connection = await createConnection(this.config);
        log(green("Connected to SQL database!"), SQLTag);

        await this.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DBNAME}`);
        await this.connection.changeUser({database: process.env.DBNAME});

        this.Economy = new Economy(this);
        await this.query(this.Economy.createTableQuery());

        this.Users = new Users(this);
        await this.query(this.Users.createTableQuery());

        this.Guilds = new Guilds(this);
        await this.query(this.Guilds.createTableQuery());

        this.Channels = new Channels(this);
        await this.query(this.Channels.createTableQuery());

        this.User_Guild = new User_Guild(this);
        await this.query(this.User_Guild.createTableQuery());

        this.Messages = new Messages(this);
        await this.query(this.Messages.createTableQuery());

        this.Games = new Games(this);
        await this.query(this.Games.createTableQuery());

        this.Gamers = new Gamers(this);
        await this.query(this.Gamers.createTableQuery());
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

