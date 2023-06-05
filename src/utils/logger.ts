import { bold, dim } from "chalk";
const logging = process.env.LOGGING;

function _time() {
    const date = new Date();
    let hours:   number | string = date.getHours();
    let minutes: number | string = date.getMinutes();
    let seconds: number | string = date.getSeconds();

    //If the hours minutes or seconds are less than 10, add a 0 to the front.
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
  
    return `${hours}:${minutes}:${seconds}`;
}

export function log(message: string, tag?: string) {
    if(!logging || !message) return;
    
    const data = new Error().stack.split("at ");
    const target = data[data.findIndex(d => d.startsWith("Generator.next")) - 1];
    const filename = target?.split("\\").pop().slice(0, target?.split("\\").pop().indexOf(":"));

    let line = "Unknown";
    let column = "Unknown";

    try {
        [line, column] = target?.split(":").slice(-2);
    } catch(_) { /***/ }
    
  
    if(tag)
        console.log(`[${bold(_time())}] ${tag} ${message} (${dim(filename + ":" + line.trim() + ":" + column.trim())})`);
    else
        console.log(`[${bold(_time())}] ${message} (${dim(filename + ":" + line.trim() + ":" + column.trim())})`);
}