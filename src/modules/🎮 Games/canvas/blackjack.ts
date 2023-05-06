import { Guild, User } from "discord.js";
import { CanvasConstructor } from "../../../structs/canvas";
import { Canvas, createCanvas, loadImage, registerFont } from "canvas";
import { join } from "path";
import { Blackjack } from "../structs/blackjack";

const ratio = 2;
const width = 650 * ratio;
const height = 437 * ratio;

const bgcolor = "#2b2d31";
const bgRadius = 10;

const stripeWidth = 5 * ratio;
const stripeHeight = height;
const stripeColor = "#FFFFFF";

const iconPadding = 20 * ratio;
const avatarRadius = 15 * ratio;
const iconRadius = 12.5 * ratio;

const titleSize = 17 * ratio;
const fontFamily = "ggsans";
registerFont(join(__dirname, "../assets/blackjack/fonts/ggsans-Medium.ttf"), { family: fontFamily });
registerFont(join(__dirname, "../assets/blackjack/fonts/ggsans-Bold.ttf"), { family: fontFamily, weight: "bold" });
registerFont(join(__dirname, "../assets/blackjack/fonts/ggsans-ExtraBold.ttf"), { family: fontFamily, weight: "extra-bold" });

const headFootPadding = 10 * ratio;

const descSize = 15 * ratio;
const footerText = "Blackjack";

const dealerText = "Dealer";
const dealerTextPaddingX = 20 * ratio;
const dealerTextPaddingY = 27 * ratio;

const cardPaddingY = 20;
const defCardDist = 10;
const cardScale = 0.40;

const squishCardsAfter = 5;
const squishPadding = 30;

export async function template(user: User, guild: Guild) {

    const template = new CanvasConstructor(width, height);
    template.ctx.imageSmoothingEnabled = false;

    template.save()

    template.drawRoundedRect(0, 0, width, height, bgRadius, true);
    template.fill(bgcolor);

    template.ctx.fillStyle = stripeColor;
    template.ctx.fillRect(0, 0, stripeWidth, stripeHeight);

    template.restore();

    template.save();

    template.strokeCircle(iconPadding + avatarRadius, iconPadding + avatarRadius, avatarRadius);

    const avatar = await loadImage(user.displayAvatarURL({ extension: "png", size: 1024 }));
    template.drawImage(avatar, iconPadding, iconPadding, avatarRadius*2, avatarRadius*2);

    template.restore();

    template.save();

    template.strokeCircle(iconPadding + iconRadius, height - iconPadding - iconRadius, iconRadius);

    const icon = await loadImage(guild.iconURL({ extension: "png", size: 1024 }));
    template.drawImage(icon, iconPadding, height - iconPadding - iconRadius * 2, iconRadius*2, iconRadius*2);

    template.restore();

    template.ctx.font = `bold ${titleSize}px ${fontFamily}`;
    const [uw, uh] = template.measureText(user.username);

    template.text(user.username, iconPadding + avatarRadius * 2 + headFootPadding, iconPadding + avatarRadius + uh/2);

    template.ctx.font = `${descSize}px ${fontFamily}`;
    const [gw, gh] = template.measureText(footerText);

    template.text(footerText, iconPadding + iconRadius * 2 + headFootPadding, height - iconPadding - iconRadius + gh/2);

    return template.canvas.toBuffer();
}

export async function board(template: Buffer, game: Blackjack, user: User, text="") {
    const board = new CanvasConstructor(width, height);

    const background = await loadImage(template);
    board.drawImage(background, 0, 0, width, height);

    board.ctx.textBaseline = 'bottom';
    board.ctx.font = `bold ${titleSize}px ${fontFamily}`;
    const dText = dealerText + " " + game.dealer.getScoreString();
    const [dw, dh] = board.measureText(dText);

    const dTextY = iconPadding + avatarRadius*2 + dealerTextPaddingY + dh/2;
    board.text(dText, dealerTextPaddingX, dTextY);

    const dealerCardPaths = game.dealer.getHandPaths();

    let accum = 0;
    let ch: number;

    for(const split of dealerCardPaths) {
        for(const card of split) {
            const cardImg = await loadImage(card);
            const cw = cardImg.width * cardScale;
            ch = cardImg.height * cardScale;
            const x = dealerTextPaddingX + cw * accum + defCardDist * accum;
            const y = dTextY + cardPaddingY;

            board.drawImage(cardImg, x, y, cw, ch);
            accum++;
        }
    }

    const ss = game.hand.getScoreString();
    const uText = user.username + " " + ss;
    const [uw, uh] = board.measureText(uText);
    const uTextY = dTextY + cardPaddingY + ch + dealerTextPaddingY + uh/2;

    if(ss.includes(" ")) {
        board.text(user.username + " ", dealerTextPaddingX, uTextY);
        const [w, _] = board.measureText(user.username + " ");
        let x = dealerTextPaddingX + w;
        const textSplits = ss.split(" ");
        for(let i = 0, l = textSplits.length; i < l; i++) {
            const focus = i === 0 ? textSplits[i] : " " + textSplits[i];
            if(i === game.focusedSplit) {
                board.ctx.font = `bold ${titleSize}px ${fontFamily}`;
                board.text(focus, x, uTextY);
                x += board.measureText(focus)[0];
            } else {
                board.ctx.font = `${titleSize}px ${fontFamily}`;
                board.text(focus, x, uTextY);
                x += board.measureText(focus)[0];
            }
        }
        board.ctx.font = `bold ${titleSize}px ${fontFamily}`
    } else 
        board.text(uText, dealerTextPaddingX, uTextY);

    const userCardPaths = game.hand.getHandPaths();

    accum = 0;
    let s = 0;

    const shouldSquish = userCardPaths.reduce((a, b) => a + b.length, 0) > squishCardsAfter;

    if(shouldSquish) {
        board.ctx.shadowColor = "#000000";
        board.ctx.shadowOffsetX = -4;
        board.ctx.shadowOffsetY = 0;
        board.ctx.shadowBlur = 5;
    }

    for(const split of userCardPaths) {
        for(const card of split) {
            const cardImg = await loadImage(card);
            const cw = cardImg.width * cardScale;
            ch = cardImg.height * cardScale;
            const x = shouldSquish
                ? dealerTextPaddingX + squishPadding * accum + defCardDist * 2 * s
                : dealerTextPaddingX + cw * accum + defCardDist * accum + defCardDist * 2 * s;
            const y = uTextY + cardPaddingY;

            board.drawImage(cardImg, x, y, cw, ch);
            accum++;
        }
        s++;
    }

    if(text) {
        board.ctx.textBaseline = 'alphabetic';
        board.ctx.font = `${descSize}px ${fontFamily}`;
        const [gw, gh] = board.measureText(footerText);
        board.text(" • " + text, iconPadding + iconRadius * 2 + headFootPadding + gw, height - iconPadding - iconRadius + gh/2);
    }

    return board.canvas.toBuffer();
}