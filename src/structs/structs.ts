import { 
    Client,
    ClientEvents,
    ClientOptions, 
    Collection, 
    CommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import { Module } from "../enums/enums";
import { BotInterface, CommandData, CommandInterface, EventData, EventInterface } from "../types/types";
import { basename, join } from "path";
import bot from "../cache";


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