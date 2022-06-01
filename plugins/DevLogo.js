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
import { getArrivalsToPlanet, getMyEnergyMoveToPlanet, getOtherEnergyMoveToPlanet, getTrueEnergyInFuture } from "./logicForMoveEnergy";
import { artifactFilter } from "./logicForArtifactState";
import { drawCenter, drawRound } from "./display";
import { colorForInfo, colorForWarn } from "./cfgForColor";
import { endSection, getPlanetName } from "./logicForBasic";
import { sectionCenterView } from "./sectionCenterView";
import { sectionClusterDraw, showClusterMs } from "./sectionCluster.js";
import { getTrueSilverInTheFuture } from "./logicForMoveSilver";
import { getMinDistToYellowCircle, getMinDistYellowZone } from "./logicForInvadeAndCapture";
import { calRange, destroyedFilter, radiusFilter } from "./logicForPlanetState";

let planets = [];

let pointCoords = [];
let one = '#FEE761';
let two = '#FEAE34';


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


    function addCoords(x,y,color){
        let item ={x:x,y:y,color:color};
        pointCoords.push(item);
    }
    function show() {
        if (planets.length !== 0) {
            planets = [];
            return;
        }

        let blockSize = Math.ceil(2 * df.worldRadius / 32);
        
      

        addCoords(14,18,'#FEAE34');
        addCoords(13,19,'#FEAE34');
        addCoords(12,20,'#FEAE34');
        addCoords(11,21,'#FEAE34');
        addCoords(10,22,'#FEAE34');

        addCoords(17,18,'#FEAE34');
        addCoords(18,19,'#FEAE34');
        addCoords(19,20,'#FEAE34');
        addCoords(20,21,'#FEAE34');
        addCoords(21,22,'#FEAE34');
        //D
        addCoords(6,6,two);
        addCoords(7,6,two);
        addCoords(8,7,two);
        addCoords(6,7,one);
        addCoords(7,7,one);
        addCoords(6,8,one);
        addCoords(6,9,one);
        addCoords(6,10,one);
        addCoords(6,11,one);
        addCoords(6,12,one);
       
        addCoords(7,12,one);
        addCoords(8,8,one);
        addCoords(8,9,one);
        addCoords(8,10,one);
        addCoords(8,11,one);
     

        //F
        for(let i = 7;i<=12;i++)
        addCoords(10,i,one);
        addCoords(11,12,one);
        addCoords(11,10,one);
        addCoords(11,9,two);
        addCoords(10,6,two);

        //G
        for(let i = 7;i<=12;i++)  addCoords(13,i,one);
        for(let i =13;i<13+3;i++) {
            addCoords(i,7,one);
            addCoords(i,6,two);
        }
        addCoords(15,8,one);
        addCoords(15,10,two);
        addCoords(14,12,one);
        addCoords(15,11,one);

        //A
        for(let i = 6;i<=11;i++) {
            addCoords(17,i,one);
            addCoords(17+2,i,one);
        }
        addCoords(18,12,one);
        addCoords(18,10,one);
        addCoords(17,6,two);
        addCoords(19,6,two);
        addCoords(18,9,two);

        // I
        for(let i =7;i<=12;i++)
        addCoords(21,i,one);
        addCoords(21,6,two);

        //A
        let d =6;
        for(let i = 6;i<=11;i++) {
            addCoords(17+d,i,one);
            addCoords(17+2+d,i,one);
        }
        addCoords(18+d,12,one);
        addCoords(18+d,10,one);
        addCoords(17+d,6,two);
        addCoords(19+d,6,two);
        addCoords(18+d,9,two);

        let res = [];

         Array.from(df.getAllPlanets())
            .filter(destroyedFilter)
            .filter(radiusFilter)
            .filter(p => p.planetLevel >= 1 && p.planetLevel <= 3)
            .forEach(p => {
                let tmp = p;
                let coords = p.location.coords;
                let x = coords.x + df.worldRadius;
                let y = coords.y + df.worldRadius;
                let tx = Math.floor(x / blockSize);
                let ty = Math.floor(y / blockSize);

                if (ty >= 15 && ty <= 27 && tx >= 15 && tx < 17) {
                    tmp = p;
                    tmp.color = one;
                    res.push(tmp);
                }

                if(ty===23 && tx>=5 && tx<= 26) {
                    tmp = p;
                    tmp.color = two;
                    res.push(tmp);
                }

                if(ty===27 && tx>=14 && tx<18) {
                    tmp = p;
                    tmp.color = one;
                    res.push(tmp);
                }
               
                if(ty>=22 && ty<=24 && tx===6) {
                    tmp = p;
                    tmp.color = one;
                    res.push(tmp);
                }

                if(ty>=22 && ty<=24 && tx=== 25){
                    tmp = p;
                    tmp.color = one;
                    res.push(tmp);
                }


                for(let i = 0;i<pointCoords.length;i++){
                    let now = pointCoords[i];
                    if(tx=== now.x && ty===now.y) {
                        tmp = p;
                        tmp.color = now.color;
                        res.push(tmp);
                    }
                }
                
            });

            planets = res;



    }

    return html`<div style=${divStyle} > 

    <button style=${getButtonStyle('100px')} onClick=${show}> show</button>
  
  
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
        planets.forEach(p => drawRound(ctx, p, p.color));

    }

    destroy() {
        render(null, this.container);
    }
}

export default Plugin;