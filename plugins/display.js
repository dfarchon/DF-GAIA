import { getPlayerColor } from "https://cdn.skypack.dev/@darkforest_eth/procedural";
import { calRange } from "./logicForPlanetState";



// draw circle around planet
export function drawRound(ctx, p, color, width, alpha = 1) {
    if (!p) return '(???,???)';
    const viewport = ui.getViewport();
    //ctx.strokeStyle = '#FFC0CB';
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    const { x, y } = viewport.worldToCanvasCoords(p.location.coords);

    const range = p.range * 0.01 * 20;
    //const range = calRange(p);
    const trueRange = viewport.worldToCanvasDist(range);
    ctx.beginPath();
    // ctx.setLineDash([10,10]);
    ctx.arc(x, y, trueRange, 0, 2 * Math.PI);
    ctx.stroke();
    return `(${p.location.coords.x},${p.location.coords.y})`;
}


//  draw circle around (tx,ty)
export function drawCenter(ctx, tx, ty, color = '#FFC0CB', width = 1, alpha = 1, deltaDis = 5000, maxRadius = df.worldRadius * 0.4) {
    const viewport = ui.getViewport();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    let coords = { x: tx, y: ty };
    const { x, y } = viewport.worldToCanvasCoords(coords);
    for (let i = 100; i <= maxRadius; i += deltaDis) {
        // const range = 12000;
        const trueRange = viewport.worldToCanvasDist(i);
        ctx.beginPath();
        // ctx.setLineDash([10,10]);
        ctx.arc(x, y, trueRange, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

// get random rgb color
export function randomColor() {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    let color = 'rgba(' + r + ',' + g + ',' + b + ',0.8)';
    return color;
}


// draw circle around unvierse' center
//dfdao round's last radius = 80k
export function drawRadius(ctx, radius = 80 * 1000, width = 5, alpha = 1) {
    let coords = { x: 0, y: 0 };
    // let p = df.getPlanetWithCoords(coords);
    const viewport = ui.getViewport();
    ctx.strokeStyle = '#FFC0CB';
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    const { x, y } = viewport.worldToCanvasCoords(coords);
    // let radius = df.initialWorldRadius*0.05;
    // let radius = df.worldRadius*0.05;   

    // console.log(radius);
    let range = radius;
    let trueRange = viewport.worldToCanvasDist(range);
    ctx.beginPath();
    // ctx.setLineDash([10,10]);
    ctx.arc(x, y, trueRange, 0, 2 * Math.PI);
    ctx.stroke();
    // //=================================================
    // range = 10000;
    // ctx.lineWidth = 1;
    // trueRange = viewport.worldToCanvasDist(range);
    // ctx.beginPath();
    // // ctx.setLineDash([10,10]);
    // ctx.arc(x, y, trueRange, 0, 2 * Math.PI);
    // ctx.stroke();
    // //===================================================
    return;
}

// draw line betwwn two planets
export function drawLineBetweenTwoPlanets(ctx, p1, p2, color, width = 2, alpha = 1, showRound = false) {
    if (!p1) return;
    if (!p2) return;
    if (!p1.location) return;
    if (!p2.location) return;

    const viewport = ui.getViewport();
    //ctx.strokeStyle = '#FFC0CB';
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    // console.log(width);
    // console.log(ctx.lineWidth);

    let p1Coords = viewport.worldToCanvasCoords(p1.location.coords);
    let p2Coords = viewport.worldToCanvasCoords(p2.location.coords);
    const p1range = p1.range * 0.01 * 20;
    const trueP1Range = viewport.worldToCanvasDist(p1range);
    const p2range = p2.range * 0.01 * 20;
    const trueP2Range = viewport.worldToCanvasDist(p2range);

    ctx.beginPath();
    // ctx.setLineDash([10,10]);
    ctx.moveTo(p1Coords.x, p1Coords.y);
    ctx.lineTo(p2Coords.x, p2Coords.y);
    ctx.stroke();

    if (showRound) {
        ctx.beginPath();
        ctx.arc(p1Coords.x, p1Coords.y, trueP1Range, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p2Coords.x, p2Coords.y, trueP2Range, 0, 2 * Math.PI);
        ctx.stroke();
    }
    return;
}

export function drawLineBetweenTwoCoords(ctx, x1, y1, x2, y2, color, width = 1, alpha = 1) {

    const viewport = ui.getViewport();
    //ctx.strokeStyle = '#FFC0CB';
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    // console.log(width);
    // console.log(ctx.lineWidth);


    let p1Coords = viewport.worldToCanvasCoords({ x: x1, y: y1 });
    let p2Coords = viewport.worldToCanvasCoords({ x: x2, y: y2 });

    ctx.beginPath();
    // ctx.setLineDash([10,10]);
    ctx.moveTo(p1Coords.x, p1Coords.y);
    ctx.lineTo(p2Coords.x, p2Coords.y);
    ctx.stroke();
    return;
}

export function drawClock(ctx) {
    let radius = df.worldRadius;
    for (let i = 0; i < 12; i++) {
        let x = radius * Math.sin(i * 2 * Math.PI / 12);
        let y = radius * Math.cos(i * 2 * Math.PI / 12);

        drawLineBetweenTwoCoords(ctx, 0, 0, x, y, 'pink');

    }






}


// import {
//     drawRound,
//     drawCenter,
//     randomColor,
//     drawRadius,
//     drawLine
// } from './display';