// Blue
// Green
// Invisible
// Mythic
// Red
// Sub
// Subber
// Text
// Underline
// White

// • Blue = 6
// • Green = 0
// • Invisible = 7
// • Mythic = 9
// • Red = 5
// • Sub = 1
// • Subber = 2
// • Text = 3
// • Underline = 8
// • White = 4
import React from "https://unpkg.com/es-react@latest/dev/react.js";


export function terminalClear() {
    let tmn = ui.getTerminal();
    tmn.clear();
}

export function terminalGreenPrintln(str) {
    let tmn = ui.getTerminal();
    tmn.println(str, 0);
}

export function terminalWhitePrintln(str) {
    let tmn = ui.getTerminal();
    tmn.println(str, 0);
}

export function terminalBluePrintln(str) {
    let tmn = ui.getTerminal();
    tmn.println(str, 6);
}

export function terminalPrint(str,color,onClick=undefined) {
    let tmn = ui.getTerminal();
    let config = { 
        style: { color: color },
        onClick: ()=>{if(onClick!==undefined) onClick();}
    };
let element = React.createElement("div", config, str);
tmn.printElement(element);
}