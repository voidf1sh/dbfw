import { blue, bold, cyan, green, magenta, red } from "chalk";

export const bullet = "•";
export const check = "✅";
export const cross = "❌";

export const CmdTag = bold(magenta("CMD"));
export const ErrTag = bold(red("ERROR"));
export const LoadTag = bold("LOAD");
export const ReadyTag = bold(green("READY"));
export const SlashTag = bold(blue("SLASH"));
export const SQLTag = bold(cyan("SQL"));
