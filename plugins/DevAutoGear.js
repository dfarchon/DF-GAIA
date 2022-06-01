//
//  author: https://twitter.com/DfArchon
//
// df-gaia
//

import { html, render, useState, useLayoutEffect, useEffect }
    from "https://unpkg.com/htm/preact/standalone.module.js";



import {
    infoMsg,
    addToLog,
    clearInfo,
    buttonStyle,
    divStyle,
    infoListStyle,
    normalInfo,
    pinkInfo,
    pinkInfoWithFunc,
    colorInfo,
    getButtonStyle
} from './infoUtils';

import { sleep } from "./logicForBasic";


import {
    showCandidates,
    sectionAutoGearDraw,
    sectionAutoGearInViewportDraw,
    sectionAutoGear
} from './sectionAutoGear';



import{
    sectionAbandon,
    sectionAbandonDraw
}from './sectionAbandon';
import { getArrivalsToPlanet } from "./logicForMoveEnergy";
import { whereIsShipGear } from "./logicForArtifactState";

let autoGearLoopSign = true;

function dfGaia() {

    const [info, setInfo] = useState(infoMsg);
    const [infoDownSign, setInfoDownSign] = useState(true);

    //================用于让显示栏不停往下更新显示的=======================================
    function pageDown() {
        let el = document.getElementById('autogear');
        el.scrollTop = el.scrollHeight;
        // console.log('page down');
    }
    useLayoutEffect(() => {
        let interval;
        if (infoDownSign) {
            interval = setInterval(() => { pageDown(); }, 2000);
        } else {
            clearInterval(interval);
        }
        return () => {
            console.log('bye');
            clearInterval(interval);
        }
    }, [infoDownSign]);

    function changeInfoDownSign() {
        if (infoDownSign === true) setInfoDownSign(false);
        else setInfoDownSign(true);
    }
    //====================================================================================


    useEffect(() => {

        return () => {
            autoGearStopLoop();
            console.warn('df-eros end');
        }
    }, []);


    async function autoGear() {
        await sectionAutoGear(setInfo);
    }

    async function autoGearLoop() {
        autoGearLoopSign = true;
        while (true) {
            if (autoGearLoopSign === false) {
                break;
            }
            await autoGear();
            // 防止autoGear函数中没有等待机制
            await sleep(1000);
        }
    }

    function autoGearStopLoop() {
        autoGearLoopSign = false;
    }


    function centerGear(){
        let p = whereIsShipGear();
        if(p===undefined) return ;
        ui.centerLocationId(p.locationId);
    }

    let autoGearComponent = html`<div>
     <button style=${buttonStyle} onClick=${autoGear}> GearOnce </button>
     <button style=${getButtonStyle('150px')} onClick=${showCandidates}> show candidates </button>
     <button style=${getButtonStyle('150px')} onClick=${centerGear}> centerGear </button>
     <div> 
     <button style=${buttonStyle} onClick=${autoGearLoop}> GearLoop </button>
     <button style=${buttonStyle} onClick=${autoGearStopLoop}> GearStop </button>
     </div>
    
    </div>`;

   

    return html`<div style=${divStyle} >
    <h1>Dev Alpha</h1>
    <button style=${buttonStyle} onClick=${changeInfoDownSign}> changeDown </button>
    ${autoGearComponent}

    <div id=autogear style=${infoListStyle}> ${info}</div>
    </div>`;

}



class Plugin {
    constructor() {
        this.container = null;
    }
    async render(container) {
        this.container = container;
        container.style.width = "400px";
        container.style.height = "1000px";
        render(html`<${dfGaia}/>`, container);
    }

    draw(ctx) {
        sectionAutoGearDraw(ctx);
        sectionAutoGearInViewportDraw(ctx);
        sectionAbandonDraw(ctx);
        
    }

    destroy() {
        render(null, this.container);
    }
}

export default Plugin;



