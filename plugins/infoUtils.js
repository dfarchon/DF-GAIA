import { html } from "https://unpkg.com/htm@3/preact/standalone.module.js";

import {
    terminalPrint,
    terminalWhitePrintln
} from './interfactForTerminal';

// max info number in infoMsg list
const MAX_LOG_LENGTH = 1000;

export let infoMsg = [];

//add itemInfo as new info
//infoMsg just like a queue 
export function addToLog(itemInfo, setInfo) {
    infoMsg.push(itemInfo);
    infoMsg = infoMsg.slice(-MAX_LOG_LENGTH);
    setInfo([...infoMsg]);
}

// clear all info in infoMsg
export function clearInfo(setInfo) {
    infoMsg = [];
    setInfo([...infoMsg]);
}

// use itemInfo to replace the last info in infoMsg
export function refreshLast(itemInfo, setInfo) {
    let lastOne = infoMsg.pop();
    addToLog(itemInfo, setInfo);
}

// ========================================================================
// css 

export function getButtonStyle(width="100px",height="30px",color='white',backgroundColor=''){
    let res=  {
        border: "1px solid #ffffff",
        width: width,
        height: height,
        margin: "1px",
        color: color,
        backgroundColor:backgroundColor,
        textAlign: "center",
        borderRadius: "3px",
    };
    return res;
}
export const buttonStyle = {
    border: "1px solid #ffffff",
    width: "100px",
    height: "30px",
    margin: "1px",
    color: "white",
    textAlign: "center",
    borderRadius: "3px",
};

export const longButtonStyle = {
    border: "1px solid #ffffff",
    width: "180px",
    height: "30px",
    margin: "2px",
    color: "white",
    textAlign: "center",
    borderRadius: "3px",
};

export const divStyle = {
    textAlign: 'center',
    
    marginTop: "5px"
};


export let infoListStyle = {
    height: "555px",
    textAlign: "center",
    overflow: "scroll",
    background: 'rgb(0,60,0)'
};


export function getInfoListStyle (height){
    let resStyle =  {
        height: height,
        textAlign: "center",
        overflow: "scroll",
        background: 'rgb(0,60,0)'
    };
    return resStyle;
}
export let selectStyle = {
    background: "rgb(8,8,8)",
    width: "100px",
    padding: "3px 5px",
    border: "1px solid white",
    borderRadius: "3px",
};


export let checkbox = (value,setValue,text)=>{
    return html`<div onClick=${() => setValue(!value)}>
    <input type="checkbox" checked=${value} />
      ${' '+text} </div>`;
}


export let colorInfo = (text, color,terminalSign =true,textAlign ='left') => {
    if(terminalSign) terminalPrint(text,color);
  //  console.log(text);

    return html `<div style=${{ color: color ,textAlign:textAlign}}>${text}</div>`;
}

export let pinkInfo = (text) => {
    return colorInfo(text, 'pink');
}

export let greenInfo = (text) => {
    return colorInfo(text, '#00FF66');
}

export let normalInfo = (text) => {
    return colorInfo(text, '#AAC0CA');
}

export function colorInfoWithFunc(text, color, onClick,terminalSign =true,textAlign ='left') {
    if(terminalSign) terminalPrint(text,color,onClick);
  //  console.log(text);

    return html `<div 
        style=${{ color: color,textAlign:textAlign}}
        onClick=${() => { onClick()}}
        >${text}</div>`;
}

export function pinkInfoWithFunc(text, onClick) {
    return colorInfoWithFunc(text, 'pink', onClick);
}
//==============================================================================

export function formatNumber(number){
    return number.toLocaleString();
}


// import {
//     infoMsg,
//     addToLog,
//     clearInfo,
//     refreshLast
// } from './infoUtils';

// import {
    // getButtonStyle,
//     buttonStyle,
//     divStyle,
//     infoListStyle,
//     selectStyle
// } from './infoUtils';

// import {
//     colorInfo,
//     pinkInfo,
//     greenInfo,
//     normalInfo,
//     colorInfoWithFunc,
//     pinkInfoWithFunc
// } from './infoUtils';