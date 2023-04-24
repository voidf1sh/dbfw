import { Canvas, CanvasRenderingContext2D, Image, createCanvas, loadImage } from "canvas";
import { rgbToHex } from "../utils/util";

export interface CanvasElement {
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
}

export class CanvasConstructor {
    canvas: Canvas;
    ctx: CanvasRenderingContext2D;
    fontFamily: string;

    constructor(width: number, height: number) {
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    addRoundRect(x: number, y: number, width: number, height: number, radius: number, clip=false): CanvasElement {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.arcTo(x + width, y, x + width, y + height, radius);
        this.ctx.arcTo(x + width, y + height, x, y + height, radius);
        this.ctx.arcTo(x, y + height, x, y, radius);
        this.ctx.arcTo(x, y, x + width, y, radius);
        this.ctx.closePath();
        if(clip) this.ctx.clip();
        return { x, y, width, height, radius };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    clip() {
        this.ctx.clip();
    }

    drawImage(img: Canvas | Image, x: number, y: number, width: number, height: number) {
        this.ctx.drawImage(img, x, y, width, height);
    }

    fill(style: string | CanvasGradient | CanvasPattern) {
        this.ctx.fillStyle = style;
        this.ctx.fill();
    }

    //Add a rounded rectangle on top of the entire canvas.
    fullRoundRect(radius: number, clip=false): CanvasElement {
        this.ctx.beginPath();
        this.ctx.moveTo(radius, 0);
        this.ctx.arcTo(this.canvas.width, 0, this.canvas.width, this.canvas.height, radius);
        this.ctx.arcTo(this.canvas.width, this.canvas.height, 0, this.canvas.height, radius);
        this.ctx.arcTo(0, this.canvas.height, 0, 0, radius);
        this.ctx.arcTo(0, 0, this.canvas.width, 0, radius);
        this.ctx.closePath();
        if(clip) this.ctx.clip();
        return { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height, radius };
    }

    async getAverageImageColor(img: string | Buffer, threshold: number = 0) {
        const image = await loadImage(img);

        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, image.width, image.height);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        
        let r = 0;
        let g = 0;
        let b = 0;
        for (let i = 0, l = data.length; i < l; i += 4) {
            r += data[i];
            g += data[i+1];
            b += data[i+2];
        }
    
        r = Math.floor(r / (data.length / 4));
        g = Math.floor(g / (data.length / 4));
        b = Math.floor(b / (data.length / 4));
        
        if (threshold > 0) {
            // Adjust the color values based on the threshold
            const maxDiff = threshold * 255;
            const diffR = Math.max(Math.min(r - 128, maxDiff), -maxDiff);
            const diffG = Math.max(Math.min(g - 128, maxDiff), -maxDiff);
            const diffB = Math.max(Math.min(b - 128, maxDiff), -maxDiff);
            r = Math.max(Math.min(r + diffR, 255), 0);
            g = Math.max(Math.min(g + diffG, 255), 0);
            b = Math.max(Math.min(b + diffB, 255), 0);
        }
    
        return rgbToHex(r, g, b);
    }

    measureText(text: string): [number, number] {
        const metrics = this.ctx.measureText(text);
        return [metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent];
    }

    restore() {
        this.ctx.restore();
    }

    save() {
        this.ctx.save();
    }

    setCurrentFontFamily(fontFamily: string) {
        this.fontFamily = fontFamily;
    }

    setFontHeight(height: number, text: string) {
        this.ctx.font = `1px ${this.fontFamily}`;
        let i = 1;
        let tHeight = this.measureText(text)[1];
        while(tHeight < height) {
            this.ctx.font = `${++i}px ${this.fontFamily}`;
            tHeight = this.measureText(text)[1];
        }

        return tHeight;
    }

    //Will draw a shape with specified values, but will complete the shape if the last point doesn't start at the first.
    strokeShape(points: { x: number, y: number }[], closePath=true, clip=false) {
        if(!points.length) return;

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        if(closePath) this.ctx.closePath();
        if(clip) this.ctx.clip();
    }

    strokeCircle(x: number, y: number, radius: number, startAngle = 0, endAngle = Math.PI*2, antiClockwise = false): CanvasElement {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, startAngle, endAngle, antiClockwise);
        this.ctx.closePath();
        this.ctx.clip();
        return { x, y, width: radius, height: radius, radius };
    }

    text(text: string, x: number, y: number, color="#ffffff", maxWidth?: number) {
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y, maxWidth);
    }
}