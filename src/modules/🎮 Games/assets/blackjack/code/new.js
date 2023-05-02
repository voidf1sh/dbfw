const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");

const ratio = 0.714285714;
const height = 600;
const width = height * ratio;

const numPaddingX = 40;
const numPaddingY = 70;
const fontSize = 50;

const suitPadding = 90;
const smallSuitSize = 17;

const cards = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "K", "Q", "A"];
const suits = ["spades", "clubs", "hearts", "diamonds"];

const family = "Min-Mono";
registerFont(`./Minimal-Mono-Bold.otf`, { family });

async function main() {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    for(const suit of suits) {
        for(const card of cards) {

            drawRoundedRect(ctx, 0, 0, width, height, 10, false, false);
            ctx.fillStyle = "#FFFFFF";
            ctx.fill();
    
            ctx.lineWidth = 5;
            ctx.textBaseline = "center";
            ctx.textAlign = "center";
            ctx.font = `${fontSize}px ${family}`;
            ctx.lineWidth = 5;

            let targetFunc;

            switch(suit) {
                case "spades":
                    targetFunc = drawSpade;
                    ctx.strokeStyle = "#000000";
                    ctx.fillStyle = "#000000";
                    break;
                case "clubs":
                    targetFunc = drawClub;
                    ctx.strokeStyle = "#000000";
                    ctx.fillStyle = "#000000";
                    break;
                case "hearts":
                    targetFunc = drawHeart;
                    ctx.strokeStyle = "#800000";
                    ctx.fillStyle = "#800000"
                    break;
                case "diamonds":
                    targetFunc = drawDiamond;
                    ctx.strokeStyle = "#800000";
                    ctx.fillStyle = "#800000"
                    break;
            }

            ctx.fillText(card, numPaddingX, numPaddingY);
            targetFunc(ctx, numPaddingX - 4.5, suitPadding, smallSuitSize, 0);

            ctx.save();
            ctx.rotate(Math.PI);
            ctx.translate(-width, -height);
            ctx.fillText(card, numPaddingX, numPaddingY);
            targetFunc(ctx, numPaddingX - 4.5, suitPadding, smallSuitSize, 0);
            ctx.restore();

            targetFunc(ctx, width/2, height/2, 100, 4);

            fs.writeFileSync(`./cards/${suit.split("").shift()}${card}.png`, canvas.toBuffer("image/png"));
        }
    }
}

function drawRoundedRect(ctx, x, y, width, height, radius, stroke=false, clip=false) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if(stroke) ctx.stroke();

    if(clip) ctx.clip();
}

//From center point
function drawDiamond(ctx, x, y, height) {
    ctx.beginPath();
    ctx.moveTo(x, y - height / 2);
    ctx.lineTo(x + height / 2, y);
    ctx.lineTo(x, y + height / 2);
    ctx.lineTo(x - height / 2, y);
    ctx.closePath();
    ctx.stroke();
}

function drawSpade(ctx, x, y, height) {
    const sideLength = height / (Math.sqrt(3) / 2);
  
    // Draw the triangle
    ctx.beginPath();
    ctx.moveTo(x, y - height / 2);
    ctx.lineTo(x - sideLength / 2, y + height / 2);
    ctx.lineTo(x + sideLength / 2, y + height / 2);
    ctx.closePath();
    ctx.stroke();
}

function drawHeart(ctx, x, y, height) {
    const sideLength = height / (Math.sqrt(3) / 2);
  
    // Draw the triangle
    ctx.beginPath();
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + sideLength / 2, y - height / 2);
    ctx.lineTo(x - sideLength / 2, y - height / 2);
    ctx.closePath();
    ctx.stroke();
}

function drawClub(ctx, x, y, height, offset) {
    const radius = height / 4;
    ctx.beginPath();
    ctx.arc(x, y - radius, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x - radius - offset, y + radius, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + radius + offset, y + radius, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
}

async function back() {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    drawRoundedRect(ctx, 0, 0, width, height, 10, false, false);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    //y = 100
    //y = 200
    //y = 300
    //y = 400
    //s, d, c, h

    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";

    drawSpade(ctx, width/2, 150, 50);

    ctx.strokeStyle = "#800000";
    ctx.fillStyle = "#800000";

    drawDiamond(ctx, width/2, 250, 50);

    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";

    drawClub(ctx, width/2, 350, 50, 2);

    ctx.strokeStyle = "#800000";
    ctx.fillStyle = "#800000";

    drawHeart(ctx, width/2, 450, 50);

    fs.writeFileSync(`./back.png`, canvas.toBuffer("image/png"));
}

back();