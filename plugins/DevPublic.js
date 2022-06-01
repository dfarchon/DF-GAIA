//
//  author: https://twitter.com/DfArchon
//
// df-gaia
//

import {
    html,
    render,
    useState,
    useLayoutEffect,
    useEffect
} from "https://unpkg.com/htm@3/preact/standalone.module.js";

import {
    infoMsg,
    buttonStyle,
    longButtonStyle,
    divStyle,
    infoListStyle,
    getButtonStyle,
    colorInfo,
    pinkInfo,
    addToLog,
    refreshLast,
    clearInfo,
    pinkInfoWithFunc,
    normalInfo
} from './infoUtils';


import {
    sectionUpgrade,
    sectionUpgradeDraw
} from './sectionUpgrade';

import {
    sectionWithdrawSilver,
    sectionWithdrawSilverDraw
} from './sectionWithdrawSilver';

import {
    sectionInvade,
    sectionInvadeDraw
} from './sectionInvade';
import {
    sectionCapture,
    sectionCaptureDraw
} from './sectionCapture';



import {
    sectionMoveSilver,
    sectionMoveSilverDraw
} from './sectionMoveSilver';

import {
    sectionAbandon,
    sectionAbandonDraw
} from './sectionAbandon';

import {
    selectOneToCatchYellow,
    sectionCatchYellow,
    sectionCatchYellowDraw
} from './sectionCatchYellow';

import {
    getCatchInvadedPreCandidates,
    selectOneToCatchInvaded,
    sectionCatchInvaded,
    sectionCatchInvadedDraw
} from './sectionCatchInvaded';

import {
    selectedToCenterEnergyAndSilver,
    sectionCenterEnergyAndSilver,
    sectionCenterEnergyAndSilverDraw
} from './sectionCenterEnergyAndSilver';

import {
    sectionCollect,
    sectionCollectDraw
} from './sectionCollect';

import {
    clearChooseCenters,
    addChooseCenters,
    clearOneOfChooseCenters,
    sectionChooseCentersDraw,
    sectionGossip,
    sectionGossipSelected,
    sectionGossipDraw
} from './sectionGossip';
import { getArrivalsToPlanet, getMyEnergyMoveToPlanet, getOtherEnergyMoveToPlanet } from "./logicForMoveEnergy";
import { artifactFilter } from "./logicForArtifactState";
import { drawCenter, drawRound } from "./display";
import { colorForInfo, colorForWarn } from "./cfgForColor";
import { endSection, getPlanetName } from "./logicForBasic";
import { sectionCenterView } from "./sectionCenterView";
import { sectionClusterDraw, showClusterMs } from "./sectionCluster.js";
import { getTrueSilverInTheFuture } from "./logicForMoveSilver";
import { getMinDistToYellowCircle } from "./logicForInvadeAndCapture";
import { calRange } from "./logicForPlanetState";



function dfGaia() {
    const [info, setInfo] = useState(infoMsg);
    const [infoDownSign, setInfoDownSign] = useState(true);

    //=======================================================
    function pageDown() {
        let el = document.getElementById('public');
        el.scrollTop = el.scrollHeight;
    }
    useLayoutEffect(() => {
        let interval;
        if (infoDownSign) {
            interval = setInterval(() => { pageDown(); }, 2000);
        } else {
            clearInterval(interval);
        }
        return () => {
            clearInterval(interval);
        }
    }, [infoDownSign]);


    function changeInfoDownSign() {
        if (infoDownSign === true) setInfoDownSign(false);
        else setInfoDownSign(true);
        console.warn('XXX CHANGE_INFO_DOWN END XXX');
    }
    //====================================================================================

    useEffect(() => {
        return () => {
            // notice: to put all stop function here

    
            console.warn('XXX DF-GAIA END XXX');
        }
    }, []);

    async function getPlanetInfo() {
        let p = ui.getSelectedPlanet();
        
        let content,itemInfo;
        

        if (p === undefined) {
            content = '[PI] [WARN] no select planet';
            itemInfo = colorInfo(content,colorForWarn);
            addToLog(itemInfo, setInfo);
            return;
        }

        clearInfo(setInfo);

        content = '[PI] invader:';
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);

        content = p.invader;
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);

        content = '[PI] capturer:';
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);

        content = p.capturer;
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);

        let coords = p.location.coords;
        content = '(' + coords.x + ',' + coords.y + ')';
        itemInfo = pinkInfo(content, setInfo);
        addToLog(itemInfo, setInfo);

        let owner= p.owner;
        content = '[PI] owener:';
        itemInfo = normalInfo(content);
        addToLog(itemInfo,setInfo);
        content = owner;
        itemInfo = normalInfo(content);
        addToLog(itemInfo,setInfo);

        return;
    }

    async function refreshPlanet() {

        let p = ui.getSelectedPlanet();
        let content, itemInfo;
        if (p === undefined) {
            content = '[RP] [WARN] no select planet';
            itemInfo = colorInfo(content,colorForWarn);
            addToLog(itemInfo, setInfo);
            return;
        }

        content = '[RP] refresh planet begin';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        try {
            await df.hardRefreshPlanet(p.locationId);
            await df.softRefreshPlanet(p.locationId);
        } catch (e) {
            content = '[RP] [ERROR] refresh revert';
            itemInfo = colorInfo(content, colorForError);
            addToLog(itemInfo, setInfo);
            console.log(e);
        }


        content = '[RP] refresh planet end';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
    }

    async function centerView() {
        clearInfo(setInfo);
        await sectionCenterView(setInfo);
    }

    async function upgrade() {
        await sectionUpgrade(setInfo,false,6);

    }

    async function withdrawSilver() {
        await sectionWithdrawSilver(setInfo,false,6);
    }

    async function invade() {
        await sectionInvade(setInfo);

    }

    async function capture() {
        await sectionCapture(setInfo);
    }

    async function moveSilver() {
        await sectionMoveSilver(setInfo);
    }

    async function showCluster() {
        await showClusterMs(setInfo);
    }

    async function moveSilverToBlackhole() {
        await sectionMoveSilver(setInfo);
    }

    async function abandon50() {

        await sectionAbandon(setInfo, 50, 4, 0.7, [], [], false);

    }

    
    async function catchYellowSeleted() {
        await selectOneToCatchYellow(setInfo);
    }


    function showCatchInvadedCandidates(){
        getCatchInvadedPreCandidates(setInfo);
    }
    async function catchInvadedSelcted() {
        await selectOneToCatchInvaded(setInfo);

    }
   
    async function centerEnergyAndSilverSelected() {
        await selectedToCenterEnergyAndSilver(setInfo);
    }

    async function collect6() {
        await sectionCollect(setInfo, undefined, [], 6);
    }



    async function gossip() {
        await sectionGossip(setInfo, undefined, [], 6);
    }


    return html`<div style=${divStyle} > 

    <button style=${getButtonStyle('100px')} onClick=${getPlanetInfo}> planet info</button>
    <button style=${getButtonStyle('100px')} onClick=${refreshPlanet}> hard fresh</button>
    <button style=${getButtonStyle('100px')} onClick=${centerView}> center view</button>
    <button style=${getButtonStyle('100px')} onClick=${moveSilver}> move Silver</button>
    <button style=${getButtonStyle('200px')} onClick=${showCluster}> show cluster </button>
    <button style=${getButtonStyle('300px')} onClick=${moveSilverToBlackhole}> move Silver to blackhole</button>
    <button style=${getButtonStyle('150px')} onClick=${withdrawSilver}> withdraw silver</button>
    <button style=${getButtonStyle('100px')} onClick=${upgrade}> upgrade</button>
  
    <button style=${buttonStyle} onClick=${invade}> invade</button>
    <button style=${buttonStyle} onClick=${capture}> capture</button>
   
    <button style=${getButtonStyle('100px')} onClick=${abandon50}> abandon50</button>
    <button style=${getButtonStyle('200px')} onClick=${catchYellowSeleted}> catch yellow selected</button>
    <button style=${getButtonStyle('250px')} onClick=${ showCatchInvadedCandidates}> catch invaded candidates</button>
    <button style=${getButtonStyle('200px')} onClick=${catchInvadedSelcted}> catch invaded selected</button>


    <button style=${getButtonStyle('250px')} onClick=${centerEnergyAndSilverSelected}> center energy&silver selected</button>
    <button style=${getButtonStyle('100px')} onClick=${collect6}> collect 6</button>
    

    <div>gossip</div>
    <button style=${buttonStyle} onClick=${addChooseCenters}> add 1 </button>
    <button style=${buttonStyle} onClick=${clearOneOfChooseCenters}> clear 1 </button>
    <button style=${buttonStyle} onClick=${clearChooseCenters}> clear all </button>

    <button style=${buttonStyle} onClick=${gossip}> gossip </button>
 
  
    <button style=${buttonStyle} onClick=${changeInfoDownSign}> changeDown </button>
    <div id=public style=${infoListStyle}>${info}</div>
    </div>`;

}

class Plugin {
    constructor() {
        this.container = null;
    }

    async render(container) {
        this.container = container;
        container.style.width = "400px";
        container.style.height = "700px";
        render(html`<${dfGaia}/>`, container);
    }

    draw(ctx) {
        sectionUpgradeDraw(ctx);
        sectionWithdrawSilverDraw(ctx);
        sectionInvadeDraw(ctx);
        sectionCaptureDraw(ctx);

        sectionMoveSilverDraw(ctx);
        sectionAbandonDraw(ctx);
        sectionCatchYellowDraw(ctx);
        sectionCatchInvadedDraw(ctx);
        sectionCenterEnergyAndSilverDraw(ctx);
        sectionCollectDraw(ctx);
        sectionClusterDraw(ctx);

        sectionChooseCentersDraw(ctx);
        sectionGossipDraw(ctx);

    }

    destroy() {
        render(null, this.container);
    }
}

export default Plugin;