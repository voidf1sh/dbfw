# db-sys-final
Database Systems Final Project Discord Bot

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
Good luck

### Remaining Dependencies
In the root of the project: `npm install`

## Documentation
To start the bot, run `ts-node mod.ts` in the root of the project.

### Adding a Module
To add a module, add a folder in /src/modules.

You must add a "commands" folder in the new module folder.

Other folders, such as an "events" folder is optional and should be added based on the function of each module.

### Adding a Command
To add a command, add a .ts file inside of a module's command folder.

The command template can be found in any exisiting command and can be copied and pasted.

The data and execution function can be manipulated or expanded on based on the function of the command.

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

## SQL
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

## Bot Usage
The bot comes with a few default utility commands to help development.

### Reloading
The `/reload` command can be used to reload everything or a specific target so that a manual bot restart is not required. This is good when a change in a command is made, for example.

### Refreshing
When a new command is added, the `/reload commands` command can be used then `/refresh` command can be used to refresh guild slashes so the new command appears without needing to restart the bot.