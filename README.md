# db-sys-final
Database Systems Final Project SQL Discord Bot

## Guide
- [Introduction](https://github.com/garbearrr/db-sys-final/blob/master/README.md#introduction)
- [ER Diagram](https://github.com/garbearrr/db-sys-final/blob/master/README.md#er-diagram)
- [ER Schema](https://github.com/garbearrr/db-sys-final/blob/master/README.md#er-schema)
- [Business Rules](https://github.com/garbearrr/db-sys-final/blob/master/README.md#business-rules)
- [Installation](https://github.com/garbearrr/db-sys-final/blob/master/README.md#installation)
  - [Node.js](https://github.com/garbearrr/db-sys-final/blob/master/README.md#nodejs)
  - [MySQL Server](https://github.com/garbearrr/db-sys-final/blob/master/README.md#mysql-server)
  - [Node Canvas](https://github.com/garbearrr/db-sys-final/blob/master/README.md#node-canvas)
  - [Remaining Dependencies](https://github.com/garbearrr/db-sys-final/blob/master/README.md#remaining-dependencies)
  - [TypeScript](https://github.com/garbearrr/db-sys-final/blob/master/README.md#typescript)
  - [Create a Discord Account](https://github.com/garbearrr/db-sys-final/blob/master/README.md#create-a-discord-account)
  - [Create a Discord Server](https://github.com/garbearrr/db-sys-final/blob/master/README.md#create-a-discord-server)
  - [Use Discord's Developer Portal to Create a Bot](https://github.com/garbearrr/db-sys-final/blob/master/README.md#use-discords-developer-portal-to-create-a-bot)
  - [config.json](https://github.com/garbearrr/db-sys-final/blob/master/README.md#configjson)
  - [Starting the Bot](https://github.com/garbearrr/db-sys-final/blob/master/README.md#starting-the-bot)
- [Documentation (for Developers)](https://github.com/garbearrr/db-sys-final/blob/master/README.md#documentation-for-developers)
  - [Adding a Module](https://github.com/garbearrr/db-sys-final/blob/master/README.md#adding-a-module)
  - [Adding a Command](https://github.com/garbearrr/db-sys-final/blob/master/README.md#adding-a-command)
  - [SQL](https://github.com/garbearrr/db-sys-final/blob/master/README.md#sql)
  - [Tables](https://github.com/garbearrr/db-sys-final/blob/master/README.md#tables)
  - [Bot Usage (for Developers)](https://github.com/garbearrr/db-sys-final/blob/master/README.md#bot-usage-for-developers)
- [SQL](https://github.com/garbearrr/db-sys-final/blob/master/README.md#sql-1)
  - ["DISCORD" Database](https://github.com/garbearrr/db-sys-final/blob/master/README.md#discord-database)
  - [Creating Tables](https://github.com/garbearrr/db-sys-final/blob/master/README.md#creating-tables)
  - [Current App Schemas](https://github.com/garbearrr/db-sys-final/blob/master/README.md#current-app-schemas)
  - [How to Test SQL Queries](https://github.com/garbearrr/db-sys-final/blob/master/README.md#how-to-test-sql-queries)
    - [Duration](https://github.com/garbearrr/db-sys-final/blob/master/README.md#duration)
    - [Nickname](https://github.com/garbearrr/db-sys-final/blob/master/README.md#nickname)
    - [Total](https://github.com/garbearrr/db-sys-final/blob/master/README.md#total)
    - [Instructions](https://github.com/garbearrr/db-sys-final/blob/master/README.md#instructions)
    - [Community](https://github.com/garbearrr/db-sys-final/blob/master/README.md#community)
  - [Economy](https://github.com/garbearrr/db-sys-final/blob/master/README.md#economy)
    - [Economy Management Commands](https://github.com/garbearrr/db-sys-final/blob/master/README.md#economy-management-commands)
    - [Balance Command](https://github.com/garbearrr/db-sys-final/blob/master/README.md#balance-command)
    - [Level Command](https://github.com/garbearrr/db-sys-final/blob/master/README.md#level-command)
    - [Blackjack](https://github.com/garbearrr/db-sys-final/blob/master/README.md#blackjack)
    - [SQL Notes](https://github.com/garbearrr/db-sys-final/blob/master/README.md#sql-notes)
  - [Contributions](https://github.com/garbearrr/db-sys-final/blob/master/README.md#contributions)
    - [Gia Walker](https://github.com/garbearrr/db-sys-final/blob/master/README.md#gia-walker)
    - [Garrett Weaver](https://github.com/garbearrr/db-sys-final/blob/master/README.md#garrett-weaver)

## Introduction
Our goal for this project was to create a Discord Bot that used SQL as it's database language of choice. Originally, we didn't have an exact idea of what function/purpose this Discord Bot should serve because of the concept's versatility. With that in mind, we set out bot up with a modular approach. While, we decided to many focus on an economic environment, our bot can create different tables and serve different purposes without changing the framework of the bot. We did not take any shortcuts when creating the boilerplate for our bot. Although you cannot technically see it when utilizing the bot, it comes with advanced framework features you would see in any actual production bot today. We implemented a command handler, event handler, our own schema framework, and much more. Our codebase is approching 3000 lines. We even chose to write out bot in TypeScript instead of JavaScript to streamline development with IntelliSense.

## ER Diagram

![diagram](https://user-images.githubusercontent.com/80983143/236587504-2668bfa0-ad0b-4583-8429-44c352884c5d.png)

## ER Schema

![newersc drawio](https://user-images.githubusercontent.com/80983143/236587576-b39f760b-b406-4556-9588-380529342dfe.png)

## Business Rules

1. Many users can be in many guilds.
2. Many guilds can have many users.
3. A guild can have many channels.
4. A channel must be in a guild.
5. Many users can send many messages in a channel.
6. Many channels can have many messages.
7. Many gamers can play many games.
8. A guild must have an economy.
9. Many users can take part in that economy.

## Installation

### Node.js
Node.js is the JS/TS runtime used for this project.
All platform installs: https://nodejs.org/en


### MySQL Server
The mysql service must be running while running the bot.

**Ubuntu**
```
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql.service

sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
exit

sudo mysql_secure_installation
```

**Windows & macOS**
https://dev.mysql.com/downloads/mysql/

### Node Canvas
**Ubuntu:**
`sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

**macOS:**
`brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman`

**Windows:**
https://github.com/Automattic/node-canvas/wiki/Installation:-Windows (Good luck)

### Remaining Dependencies
In the root of the project: `npm install`

### TypeScript
Do a global npm install for ts-node: `npm install -g ts-node`
This may need a shell restart.

### Create a Discord Account
https://support.discord.com/hc/en-us/articles/360033931551-Getting-Started

### Create a Discord Server
https://support.discord.com/hc/en-us/articles/204849977-How-do-I-create-a-server-

### Use Discord's Developer Portal to Create a Bot
https://discord.com/developers/applications

1. Click "New Application" and name your app. (Top Right)
2. Click the three bars in the top left.
3. Click on the bot tab.
4. Click "Add Bot".
5. Click "Reset Token" (if present) and copy your token to your clipboard to add to the config.json (instructions below).
6. Scroll down passed the header: "Priviledged Gateway Intents".
7. Switch all three to on (Presence Intent, Server Members Intent, and Message Content Intent).
8. Click on the three bars in the top left.
9. Click the "OAuth2" tab dropdown arrow to go to the URL Generator.
10. Under "scopes" check "bot" and "applications.commands".
11. Under "Bot Permissions" check "Administrator".
12. All the way at the bottom of the page, copy the "generated url".
13. This can be pasted in the search bar so your bot can be added to the server you made.

### config.json
In the root of your project, you should add a config.json file. The current structure of the config is as follows:
```
{
    "token": "Your bot token"
    "logging": boolean,
    "sqlconfig": {
        "host": "localhost",    (May be different)
        "user": "your username when setting up your sql server",
        "password": "your password"
    }
}
```

### Starting the Bot
When your bot is added to server, mysql running, and config.json filled in, you can start the bot with `ts-node mod.ts`.

## Documentation (for Developers)
To start the bot, run `ts-node mod.ts` in the root of the project.

### Adding a Module
To add a module, add a folder in /src/modules.

You must add a "commands" folder in the new module folder.

Other folders, such as an "events" folder is optional and should be added based on the function of each module.

### Adding a Command
To add a command, add a .ts file inside of a module's command folder.

The command template can be found in any exisiting command and can be copied and pasted.

The data and execution function can be manipulated or expanded on based on the function of the command.

### SQL
SQL functions are found in /src/structs/sql.ts

### Tables
SQL tables are represented as classes in this app. Each class in the SQL file that represents a table in SQL extend another class called "BaseTable". This base class handles automatic creation of tables such that they do not exist in the database yet.

These classes double as schemas for the tables with custom TypeScript types.

Here is an example with the Economy table:
```
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
```

This table has records with 5 fields: userID, guildID, balance, bank, and experience.

The fields that will be primary keys are followed by `_pk`.

Furthermore, each class should have a method called `checkAndAdd` that has arguments for each primary key. This method should be called before accessing the table for any reason. This method checks to see if a field exists with the specified key(s) and if it doesn't, it is added before the other operation is executed. Check out the economy class for reference.

These classes can then have unique classes related to the data in each table. The economy table, for example, has a method called `getBalance`.

Then, the class can be exported and imported in any file or command that needs access to that table and it's data methods.

## Bot Usage (for Developers)
The bot comes with a few default utility commands to help development.

### Reloading
The `/reload` command can be used to reload everything or a specific target so that a manual bot restart is not required. This is good when a change in a command is made, for example.

### Refreshing
When a new command is added, the `/reload commands` command can be used then `/refresh` command can be used to refresh guild slashes so the new command appears without needing to restart the bot.

## SQL

## "DISCORD" Database
Before any queries are executed, the app first executes: `CREATE DATABASE IF NOT EXISTS DISCORD` to set the environment for future queries.

### Creating Tables
All tables are created such that they do not already exist after the database is set on start up. We have a handler function that parses schema classes (seen later in the guide) into a query that creates a table with the given schema such that it doesn't exist.

```
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
```

### Current App Schemas
We created custom TypeScript types that represent common SQL types. We put these types into classes that represent a schema so that we can easily and dynmaically create tables based on these schemas, but also so we can import these classes and use helper functions to execute queries relevant to the table the schema represents. While I will not include all of the helper functions in this guide, all of the schema classes and helper functions are located in `src/structs/sql.ts`

Commonly, custom types have one to two arguments. First is the size of the data (if applicable) and second, whether it can be null or not.

#### USERS
```
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
```

#### GUILDS
```
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
```

#### CHANNELS
```
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
```

#### MESSAGES
```
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
```

#### GAMES
```
    private game_pk: SQL_VARCHAR;
    private gameInstructions: SQL_VARCHAR;
    private length: SQL_INT;

    constructor(sql: SQLInterface) {
        super(sql);
        this.game_pk =          new VARCHAR(100, false);
        this.gameInstructions = new VARCHAR(255, false);
        this.length =           new INT(false);
    }
```

#### GAMERS
```
    private did_pk: SQL_VARCHAR;
    private game_pk: SQL_VARCHAR;
    private hours: SQL_FLOAT;

    constructor(sql: SQLInterface) {
        super(sql);
        this.did_pk =           new VARCHAR(20, false);
        this.game_pk =          new VARCHAR(100, false);
        this.hours =            new FLOAT(2, false);
    }
```

#### ECONOMY
```
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
```

### How to Test SQL Queries
First, please execute `/populate-db` in any channel to get some sample data.

#### Duration

Command:
`/duration 10`

Query:
`SELECT game FROM GAMES WHERE length <= [len]`

Example:
![image](https://user-images.githubusercontent.com/80983143/236590078-ea1c95a1-8f41-48f0-b0df-7e745ad5a64d.png)


#### Nickname

Command:
`/nickname`

Query:
`SELECT nickname FROM USERS WHERE did = [discord id]`

Example:
![image](https://user-images.githubusercontent.com/80983143/236590084-a75bb8cd-993f-4459-bf40-02e516162775.png)


#### Total

Command:
`/total [your user]`

Query:
`SELECT u.did, u.nickname, sum(hours) AS total_h FROM USERS u LEFT OUTER JOIN GAMERS gr ON u.did = gr.did GROUP BY u.did, u.nickname HAVING u.did = ? ORDER BY u.did`

Example:
![image](https://user-images.githubusercontent.com/80983143/236590145-78442993-b823-4b29-be03-a4cb38a5b0c9.png)


#### Instructions

Command:
`/instructions Blackjack`

Query:
`SELECT gameInstructions FROM GAMES WHERE game = ?`

Example:
![image](https://user-images.githubusercontent.com/80983143/236590139-740fb12b-0439-49d5-8f43-cdc68e7f0d49.png)


#### Community

Command:
`Community Blackjack`

Query:
`SELECT DISTINCT gr.did, gr.hours FROM GAMERS gr WHERE gr.did IN (SELECT gr.did FROM GAMES g, GAMERS gr, USERS u WHERE g.game = ? AND g.game = gr.game) ORDER BY gr.hours desc`

Example:
![image](https://user-images.githubusercontent.com/80983143/236590152-b92dd6f4-ef62-4860-9fe3-364927dcb690.png)

### Economy
As previously mentioned, we had a strong focus on our economy module. While we wanted to diversify and use some of the more complex queries we've learned this semester (seen above), we also wanted to present a small portion that would resemble an actual production bot. This is best seen in our economy module. A lot of the commands and features in this module are presented with programmatically generated images made with node canvas. Since Discord is a text platform, we wanted to enhance user experience by presenting our stored data with something more complex and pleasing. 

#### Economy Managment Commands
Please feel free to use and check out our economy managment command family found under `/econ-manager`. These are simply query commands that allow you to add and take xp, coins, and many more economy-based commands. These do not feature programmatically generated images.

#### Balance Command
`/balance`

The balance command creates a canvas image showing user bank and wallet. It features the user's avatar and also generates a background color that represents the user's average avatar color (such that it isn't a default avatar).

`SELECT balance, bank FROM ECONOMY WHERE did = ? AND gid = ?`

#### Level Command
`/level`

Much like the balance command, except, this shows level progression via a leveling bar.

`SELECT xp FROM ECONOMY WHERE did = ? AND gid = ?`

#### Blackjack
Finally, we created a full scale blackjack game. We support hitting, standing, splitting (up to three times per hand), doubling down, and insurance. Also, everything you see during the game is all programmatically generated to look like a Discord embed. Not just the embed itself, but also, all of the cards are created from scratch with node canvas. We highly encourage you to play. This is the closest thing you will see to an actual production discord bot feature. This implements many different economic queries by adding/taking chips and generating xp based on game results.

#### SQL Notes
While the bot is running, we created a logger to track bot events during execution. At any time, check your standard output to read any `SQL` log tags to see the queries being executed live at any given moment.

### Contributions

#### Gia Walker
Gia wrote all other queries and most features outside of the economy module.
Also contibuted parts of the economy module.

#### Garrett Weaver
Garrett wrote most of the economy module + blackjack.
Also wrote the bot framework due to being more familiar with the process.
