import {
    addToLog,
    colorInfo,
    colorInfoWithFunc
} from './infoUtils';

import {
    artifactFilter
} from './logicForArtifactState';

import {
    drawRound
} from './display';

import {
    MAX_CATCH_INVADED_MOVE_TIME,
    notOwnerAddress
} from './cfgForBasic';

import {
    sleep,
    beginSection,
    endSection,
    center,
    getSetOfPlanets,
    getPlanetName
} from './logicForBasic';

import {
    waitForMoveOnchain
} from './logicForMove';

import {
    getPlanetScore,
    getScoreOfPlanets
} from './logicForInvadeAndCapture';

import {
    destroyedFilter,
    radiusFilter
} from './logicForPlanetState';

import {
    getArrivalsToPlanet,
    getOtherEnergyMoveToPlanet,
    judgeAttack
} from './logicForMoveEnergy';
import { sectionAbandon } from './sectionAbandon';

import {
    canCapture
} from './logicForInvadeAndCapture';


import {
    colorForInfo,
    colorForWarn,
    colorForError,
    CATCH_INVADED_FROM_PLANETS,
    CATCH_INVADED_TO_PLANETS
} from './cfgForColor';
import { isNoOwner } from './logicForAccount';
import {
    getJunkEnabled,
    getJunkOfPlanets,
    getMyJunkBudget
} from './logicForJunk';

import {
    isOther
} from './logicForAccount';
import { colorForShowCanCapturePlanets } from './sectionShow';


let colorForFromPlanets = CATCH_INVADED_FROM_PLANETS;
let colorForToPlanets = CATCH_INVADED_TO_PLANETS;

let drawSign = true;

let showCandidatePlanets = [];
let showFromPlanets = [];
let showToPlanets = [];


function fromFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        artifactFilter(planet) &&
        planet.planetLevel >= 4 &&
        planet.planetLevel <= 6 &&
        getOtherEnergyMoveToPlanet(planet) === 0 &&
        canCapture(planet,false) === false;
}

function toFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        isNoOwner(planet) &&
        getPlanetScore(planet) > 0 &&
        canCapture(planet,false) &&
        getArrivalsToPlanet(planet) === 0 &&
        isNoOwner(planet);
}


let catchInvadedPreCandidates = []; 
export function getCatchInvadedPreCandidates(setInfo){
    let planets = Array.from(df.getAllPlanets())
        .filter(toFilter);

    let content,itemInfo;
    content= '[CI] '+planets.length+' candidate(s)';
    itemInfo = colorInfo(content,colorForInfo);
    addToLog(itemInfo,setInfo);

    if(catchInvadedPreCandidates.length===0) catchInvadedPreCandidates=planets;
    else catchInvadedPreCandidates = [];

}


export function sectionCatchInvadedDraw(ctx) {
    catchInvadedPreCandidates.forEach(p=>drawRound(ctx,p,colorForToPlanets,2,0.7)); 
    if (drawSign === false) return;
    showFromPlanets.forEach(p => drawRound(ctx, p, colorForFromPlanets, 5, 1));
    showToPlanets.forEach(p => drawRound(ctx, p, colorForToPlanets, 3, 1));
    showCandidatePlanets.forEach(p => drawRound(ctx, p, colorForToPlanets, 2, 0.7));

}

export async function selectOneToCatchInvaded(setInfo) {
    let p = ui.getSelectedPlanet();
    if (p === undefined) {
        let content = '[CI] [WARN] not select planet';
        let itemInfo = colorInfo(content, colorForWarn);
        addToLog(itemInfo, setInfo);
        return;
    }
    await sectionCatchInvaded(setInfo, p);
}

export async function sectionCatchInvaded(setInfo, onePlanet = undefined, maxFromNumber = 3) {
    beginSection('[CI] === catch invaded begin ===', setInfo);
    if(onePlanet===undefined) beginSection('[CI] max use ' + maxFromNumber + ' planets', setInfo);
    drawSign = true;
    showCandidatePlanets = [];
    showFromPlanets = [];
    showToPlanets = [];

    let content, onClick, itemInfo;


    let myPlanets = Array.from(df.getMyPlanets())
        .filter(fromFilter);

    if(onePlanet===undefined){
        content = '[CI] ' + myPlanets.length + ' my planet(s)';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
    }

 

    if (myPlanets.length === 0) {
        
        content = '[CI] source planets number === 0';
        itemInfo = colorInfo(content,colorForInfo);
        addToLog(itemInfo,setInfo);

        endSection('[CI] === catch invaded end ==', setInfo, '[CI] ');
        return;
    }

    //  to get candidate my planets
    let candidateToPlanets = Array.from(df.getAllPlanets())
        .filter(toFilter);

    if (myPlanets.length === 0) {

        content = '[CI] target planets number === 0';
        itemInfo = colorInfo(content,colorForInfo);
        addToLog(itemInfo,setInfo);

        endSection('[CI] === catch invaded end ==', setInfo, '[CI] ');
        return;
    }
    showCandidatePlanets = candidateToPlanets;

    let map = new Map();
    myPlanets.forEach(p => map.set(p.locationId, 0));

    candidateToPlanets.forEach(p => {
        let pid = myPlanets[0].locationId;
        let dist = df.getDist(p.locationId, myPlanets[0].locationId);

        myPlanets.forEach(v => {
            let vPid = v.locationId;
            let vDist = df.getDist(p.locationId, v.locationId);
            if (vDist < dist) {
                dist = vDist;
                pid = vPid;
            }
        });
        let value = map.get(pid);
        let from = df.getPlanetWithId(pid);
        value += from.planetLevel >= p.planetLevel? p.planetLevel:0;
        map.set(pid, value);
    });

    //console.log(map);

    myPlanets = myPlanets
        .filter(p => {
            let value = map.get(p.locationId);
            return value > 0;
        })
        .sort((a, b) => {
            let aCnt = map.get(a.locationId);
            let bCnt = map.get(b.locationId);
            return bCnt - aCnt;
        });

    // for test only
    // myPlanets.forEach(p => {
    //     let value = map.get(p.locationId);
    //     content = getPlanetName(p) + ':' + value;
    //     onClick = ()=>center(p);
    //     itemInfo = colorInfoWithFunc(content, colorForInfo,onClick);
    //     addToLog(itemInfo, setInfo);
    // });
    // await sleep(10000);
    // return 0;

  
    if (onePlanet !== undefined) {
        myPlanets = [];
        myPlanets.push(onePlanet);
    }

    let cnt = 0;
    for (let i = 0; i < myPlanets.length; i++) {
        if (cnt >= maxFromNumber) break;
        let from = myPlanets[i];
        from = df.getPlanetWithId(from.locationId);
        let energyBudget = Math.floor(from.energy - from.energyCap * 0.2);
        if (energyBudget <= 0) continue;
        let energySpent = 0;


        let candidates = Array.from(df.getAllPlanets())
            .filter(toFilter)
            .filter(p => p !== from)
            .filter(p => judgeAttack(from, p, 1, 0))
            .sort((a, b) => {
                if (a.planetLevel !== b.planetLevel) return b.planetLevel - a.planetLevel;
                let aDist = df.getDist(from.locationId, a.locationId);
                let bDist = df.getDist(from.locationId, b.locationId);
                return aDist - bDist;
            });
         console.log(candidates.length);

        let toPlanets = [];

        for (let j = 0; j < candidates.length; j++) {

            let to = candidates[j];
            let energyLeft = Math.floor(energyBudget - energySpent);
            if (energyLeft <= 0) break;
            let arrivingEnergy = Math.ceil(to.energyCap * 0.8 + to.energy* (to.defense * 0.01))+100;
            let energyNeeded = Math.ceil(df.getEnergyNeededForMove(from.locationId, to.locationId, arrivingEnergy));
            if (energyNeeded > energyLeft) continue;
            let time = Math.ceil(df.getTimeForMove(from.locationId, to.locationId));
            let leftTime = MAX_CATCH_INVADED_MOVE_TIME;
            if (time >= leftTime) continue;
            toPlanets.push(to);
            energySpent += energyNeeded;
        }
       
        if (toPlanets.length === 0) continue;


        // showCandidatePlanets = candidates;
        showFromPlanets.push(from);


        content = '[CI] [' + getPlanetName(from) + '] planet source [' + cnt + ']';
        onClick = () => center(from);
        itemInfo = colorInfoWithFunc(content, colorForFromPlanets, onClick);
        addToLog(itemInfo, setInfo);

        toPlanets = getSetOfPlanets(toPlanets);
        let junkSum = getJunkOfPlanets(toPlanets);
        let scoreSum = getScoreOfPlanets(toPlanets);

        content = '[CI] ' + toPlanets.length + ' aim planet(s)';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        content = '[CI] will get ' + scoreSum.toLocaleString() + ' scoreSum';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);


        let junkEabled = getJunkEnabled();
        let myJunkBudget = getMyJunkBudget();
        let needJunk = Math.max(0, junkSum - myJunkBudget);


        if (junkEabled && needJunk > 0) {
            content = '[CI] need ' + needJunk + ' junk(s) so abandon planets';
            itemInfo = colorInfo(content, colorForInfo);
            addToLog(itemInfo, setInfo);
            await sectionAbandon(setInfo, needJunk, 5, 0.7, [], toPlanets);
            // notice： after abandon junkbudget may still don't enough   
        }



        content = '[CI] [' + getPlanetName(from) + '] planet source [' + cnt + ']';
        onClick = () => center(from);
        itemInfo = colorInfoWithFunc(content, colorForFromPlanets, onClick);
        addToLog(itemInfo, setInfo);

        energyBudget = Math.floor(from.energy - from.energyCap * 0.2);
        if (energyBudget <= 0) continue;
        energySpent = 0;
      

        let movesCnt = 0;
        for (let j = 0; j < candidates.length; j++) {
            let to = candidates[j];
            let energyLeft = Math.floor(energyBudget - energySpent);
            if (energyLeft <= 0) break;
            let arrivingEnergy = Math.ceil(to.energyCap * 0.8 + to.energy * (to.defense * 0.01)) + 100;
            let energyNeeded = Math.ceil(df.getEnergyNeededForMove(from.locationId, to.locationId, arrivingEnergy));
            if (energyNeeded > energyLeft) continue;
            let time = Math.ceil(df.getTimeForMove(from.locationId, to.locationId));
            let leftTime = MAX_CATCH_INVADED_MOVE_TIME;
            if (time > leftTime) continue;

            let myJunkBudget = getMyJunkBudget();
            let pltJunk = to.spaceJunk;
            if (myJunkBudget < pltJunk) continue;


            content = '[CI] [' + getPlanetName(from) + '] planet source';
            onClick = () => center(from);
            itemInfo = colorInfoWithFunc(content, colorForFromPlanets, onClick);
            addToLog(itemInfo, setInfo);

            content = '[CI] [' + getPlanetName(to) + '] planet target';
            onClick = () => center(to);
            itemInfo = colorInfoWithFunc(content, colorForToPlanets, onClick);
            addToLog(itemInfo, setInfo);


            energySpent += energyNeeded;
            showToPlanets.push(to);
            movesCnt++;
           
            try {

                await df.move(from.locationId, to.locationId, energyNeeded, 0);
            } catch (e) {
                content = '[CI] [WARN] move revert';
                itemInfo = colorInfo(content, colorForWarn);
                addToLog(itemInfo, setInfo);
            }
            cnt++;
            if (cnt % 2 == 0) await waitForMoveOnchain(setInfo, '[CI] ')

        }
        await waitForMoveOnchain(setInfo, '[CI] ');
    }
    endSection('[CI] === catch invaded finish ===', setInfo, '[CI] ');
    await sleep(1000);
    drawSign = false;

    return;
}