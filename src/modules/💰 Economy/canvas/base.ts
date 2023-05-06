import { registerFont, loadImage } from "canvas";
import { User } from "discord.js";
import { join } from "path";
import { CanvasConstructor, CanvasElement } from "../../../structs/canvas";
import { rad } from "../../../utils/util";

const family = "Akrobat";

registerFont(join(__dirname, "../../../fonts/Akrobat-Bold.otf"), { family: family });

const defWidth = 640;
const defHeight = 120;
const defRadius = 30;

const avatarSize = 1024;

const textColor = "#ffffff";

//This is the number in degrees the 180 degree angle will be rotated to make the background edge angle separator.
const bgEdgeAngle = 50;
const bgRightPercent = .25;
const bgLeftPercent = 0;

const bgColor = "#0a0a0a";

//This is the percentage of the height of the canvas the avatar will be.
//This will be the avatar's radius.
const avatarHeightPercent = .85;
//This is the percentage of how much bigger the radius of the boarder will be that the avatar.
const avatarBoarderRadiusPercent = .05;

export async function base(user: User, width = defWidth, height = defHeight, radius = defRadius): Promise<[CanvasConstructor, CanvasElement]> {
    
    const avatarURL = user.displayAvatarURL({ extension: "png", size: avatarSize });

    const baseCanvas = new CanvasConstructor(width, height);

    let color = (user.hexAccentColor as string) || await baseCanvas.getAverageImageColor(avatarURL);
    if(color === "#000000") color = "#5865F2";

    baseCanvas.color = color;
    

    //First, there will be a rounded rectangle as the background.
    baseCanvas.fullRoundRect(radius);

    //Then we are going to be filling it with a color.
    //If the user has an accent color, we are going to use that.
    //Otherwise, we are going to use the average color of their avatar.
    baseCanvas.fill(color);

    //Next, we want to stroke a shape on top of the background.
    //The first point will at the top and width*(1-bgRightPercent) length of the background.
    //The second point will be at the bottom where a 180 degree line will pass through this and the last point such that it is rotated bgEdgeAngle degrees about the previous point.
    //The third point will be at the bottom and width*bgLeftPercent length of the background.
    //The fourth point will be at the top where a 180 degree line will pass through this and the last point such that it is rotated bgEdgeAngle degrees about the previous point.
    //The shape will then be closed.
    baseCanvas.save();

    baseCanvas.clip();

    baseCanvas.strokeShape([
        {x: width*(1-bgRightPercent), y: 0},
        {x: width*(1-bgRightPercent) + height * Math.tan(rad(bgEdgeAngle)), y: height},
        {x: width*bgLeftPercent, y: height},
        {x: width*bgLeftPercent - height * Math.tan(rad(bgEdgeAngle)), y: 0}
    ], true, true);

    //I want to save the shape's data so things can be accurately be placed on top of it later.
    const field: CanvasElement = {
        x: width*bgLeftPercent,
        y: 0,
        width: width*(1-bgRightPercent) - width*bgLeftPercent,
        height: height
    }

    baseCanvas.fill(bgColor);

    baseCanvas.restore();

    //Next, we are going to draw the avatar's boarder because it is bigger than the avatar.
    //The boarder is slightly bigger than the avatar, so it will appear like a boarder.
    //We want this to be seated directly in the middle of the right side background clipping.
    const rightClippingMid = (width - width*(1-bgRightPercent)) / 2;

    baseCanvas.save();
    
    const border = baseCanvas.strokeCircle(width - rightClippingMid, height/2, height*avatarHeightPercent/2 + height*avatarHeightPercent*avatarBoarderRadiusPercent/2);

    baseCanvas.fill(bgColor);

    baseCanvas.restore();

    //Next, we are going to draw the avatar directly in the middle of the boarder circle.
    //Since the avatar is a square, we need to clip it into a circle.
    baseCanvas.save();

    const avatar = await loadImage(avatarURL);

    //Stroke the avatar in the middle of the boarder circle
    baseCanvas.strokeCircle(border.x, border.y, height*avatarHeightPercent/2);

    baseCanvas.drawImage(avatar, border.x-height*avatarHeightPercent/2, border.y-height*avatarHeightPercent/2, height*avatarHeightPercent, height*avatarHeightPercent);

    baseCanvas.restore();

    baseCanvas.setCurrentFontFamily(family);

    return [baseCanvas, field];
}
