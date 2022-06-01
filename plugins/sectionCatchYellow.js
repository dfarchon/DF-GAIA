import {
    addToLog,
    colorInfo,
    colorInfoWithFunc,
} from './infoUtils';


import {
    artifactFilter
} from './logicForArtifactState';

import {
    drawRound
} from './display';

import {
    notOwnerAddress
} from './cfgForBasic';

import {
    sleep,
    beginSection,
    endSection,
    center,
    getPlanetName,
    deltaTimeSection
} from './logicForBasic';

import {
    waitForMoveOnchain
} from './logicForMove';

import {
    getPlanetScore,
    getTimeRemaining,
    getMinDistToYellowCircle,
    getMinDistYellowZone,
    canInvade,
    inOneZone,
    canCapture
} from './logicForInvadeAndCapture';

import {
    destroyedFilter,
    radiusFilter,
    calRange,
    isNotQuasar
} from './logicForPlanetState';

import {
    getArrivalsToPlanet,
    getOtherEnergyMoveToPlanet,
    judgeAttack
} from './logicForMoveEnergy';

import {
    getScoreOfPlanets
} from './logicForInvadeAndCapture';


import { sectionAbandon } from './sectionAbandon';
import { sectionCapture } from './sectionCapture';
import { sectionInvade } from './sectionInvade';
import {
    colorForError,
    colorForInfo,
    colorForWarn,
    CATCH_YELLOW_FROM_PLANETS,
    CATCH_YELLOW_TO_PLANETS
} from './cfgForColor';
import { getJunkEnabled, getJunkOfPlanets, getMyJunkBudget, getPlanetJunk } from './logicForJunk';
import { calEnergyCanAbandon } from './logicForAbandon';
import { isNoOwner } from './logicForAccount';




let colorForFromPlanets = CATCH_YELLOW_FROM_PLANETS;
let colorForToPlanets = CATCH_YELLOW_TO_PLANETS;

let showCandidatePlanets = [];
let showFromPlanets = [];
let showToPlanets = [];

let catchYellowDrawSign = true;

export function sectionCatchYellowDraw(ctx) {
    if (catchYellowDrawSign === false) return;
    showFromPlanets.forEach(p => drawRound(ctx, p, colorForFromPlanets, 5, 1));
    showCandidatePlanets.forEach(p => drawRound(ctx, p, colorForToPlanets, 2, 0.7));
    showToPlanets.forEach(p => drawRound(ctx, p, colorForToPlanets, 3, 1));
}


function catchYellowFromFilter(p) {
    return destroyedFilter(p) &&
        radiusFilter(p) &&
        artifactFilter(p) &&
        p.planetLevel >= 4 &&
        p.planetLevel <= 6 &&
        getOtherEnergyMoveToPlanet(p) === 0 &&
        canCapture(p,false)===false;
}



// if toChain === true  
//          
//             return 0
// if toChain === false 
//         return the aim planet(s) 

export async function opCatchYellow(from, setInfo, toChain = true, waitSign = true) {
    let content, onClick, itemInfo;
    from = df.getPlanetWithId(from.locationId);

    if (toChain) {
        showFromPlanets.push(from);
    }

    let toPlanets = [];
    let energySpent = 0;
    let moves = 0;
    let energyBudget = Math.floor(from.energy - from.energyCap * 0.2);
    if (energyBudget <= 0) return toPlanets;



    let zone = getMinDistYellowZone(from);

    let candidates = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(isNoOwner)
        .filter(p => getPlanetScore(p) > 0)
        .filter(p => inOneZone(p, zone))
        .filter(canInvade)
        .filter(p => getArrivalsToPlanet(p) === 0)
        .filter(p => judgeAttack(from, p, 1, 0))
        .filter(isNotQuasar)
        .filter(p => p !== from)
        .sort((a, b) => {
            if (a.planetLevel !== b.planetLevel) return b.planetLevel - a.planetLevel;
            let aDist = df.getDist(from.locationId, a.locationId);
            let bDist = df.getDist(from.locationId, b.locationId);
            return aDist - bDist;
        });
    if (candidates.length === 0) return toPlanets;

    let fakeCandidates = [];
    candidates.forEach(p => {
        let item = {};
        item.locationId = p.locationId;
        item.energy = p.energy;
        item.energyCap = p.energyCap;
        item.defense = p.defense;
        item.arrivals = getArrivalsToPlanet(p);
        item.planetLevel = p.planetLevel;
        fakeCandidates.push(item);
    });

    for (let i = 0; i < fakeCandidates.length; i++) {
        // notice:  if the variable fakeCandidate change 
        //  fakeCandidates[i] will change too
        let fakeCandidate = fakeCandidates[i];

        const energyLeft = energyBudget - energySpent;
        if (energyLeft <= 0) break;
        if (fakeCandidate.arrivals >= 6) continue;
        let time = Math.ceil(df.getTimeForMove(from.locationId, fakeCandidate.locationId));
        let leftTime = getTimeRemaining();
        if (time > leftTime) continue;
        if (toChain === true) {
            let myJunkBudget = getMyJunkBudget();
            let pltJunk = getPlanetJunk(fakeCandidate);
            if (myJunkBudget < pltJunk) break;
        }

        let abandonEnergy = Math.ceil(df.getEnergyNeededForMove(fakeCandidate.locationId, from.locationId, 5, true));
        if (abandonEnergy > fakeCandidate.energyCap) continue;

        let arrivingEnergy = 0;
        if (fakeCandidate.planetLevel <= 3) arrivingEnergy = Math.ceil(abandonEnergy + fakeCandidate.energy * fakeCandidate.defense * 0.01);
        else arrivingEnergy = 100 + Math.ceil(fakeCandidate.defense * 0.01 * fakeCandidate.energy);

        let energyNeeded = Math.ceil(df.getEnergyNeededForMove(from.locationId, fakeCandidate.locationId, arrivingEnergy));
        if (energyNeeded > energyLeft) continue;

        energySpent += energyNeeded;
        moves++;
        toPlanets.push(df.getPlanetWithId(fakeCandidate.locationId));
        fakeCandidate.arrivals++;

        if (toChain) {
            content = '[CY] [' + getPlanetName(from) + '] planet source';
            onClick = () => center(from);
            itemInfo = colorInfoWithFunc(content, colorForFromPlanets, onClick);
            addToLog(itemInfo, setInfo);

            content = '[CY] [' + getPlanetName(fakeCandidate) + '] planet target';
            onClick = () => center(fakeCandidate);
            itemInfo = colorInfoWithFunc(content, colorForToPlanets, onClick);
            addToLog(itemInfo, setInfo);
            showToPlanets.push(df.getPlanetWithId(fakeCandidate.locationId));
            moves++;
            try {

                await df.move(from.locationId, fakeCandidate.locationId, energyNeeded, 0);
            } catch (e) {
                content = '[CY] [WARN] move revert';
                itemInfo = colorInfo(content, colorForWarn);
                addToLog(itemInfo, setInfo);
            }

            if (toChain && waitSign && moves % 3 === 0) {
                await waitForMoveOnchain(setInfo, '[CY] ');
            }
        }
    }

    if (toChain && waitSign)
        await waitForMoveOnchain(setInfo, '[CY] ');

    if (toChain === false) return toPlanets;
    return 0;
}

export async function selectOneToCatchYellow(setInfo) {
    let p = ui.getSelectedPlanet();
    if (p === undefined) {
        let content = '[CY] [WARN] not select planet';
        let itemInfo = colorInfo(content, colorForWarn);
        addToLog(itemInfo, setInfo);
        return;
    }
    await sectionCatchYellow(setInfo, p);
}


export async function sectionCatchYellow(setInfo, seletedPlanet = undefined, maxFromNumber = 3) {
    beginSection('[CY] === catch yellow begin ===', setInfo);
    catchYellowDrawSign = true;
    showCandidatePlanets = [];
    showFromPlanets = [];
    showToPlanets = [];

    let content, onClick, itemInfo;
    let myPlanets = Array.from(df.getMyPlanets())
        .filter(catchYellowFromFilter)
        .filter(p => {
            let range = calRange(p);
            let dist = getMinDistToYellowCircle(p);
            return range * 0.6 >= dist;
        })
        .map(to => [to, getMinDistToYellowCircle(to)])
        .sort((a, b) => a[1] - b[1])
        .map(to => to[0]);

    // showFromPlanets = myPlanets;
    // myPlanets.forEach(p => {
    //     let dist = getMinDistToYellowCircle(p);
    //     content = getPlanetName(p) + ":" + dist;
    //     onClick = () => center(p);
    //     itemInfo = colorInfoWithFunc(content, colorForInfo, onClick);
    //     addToLog(itemInfo, setInfo);

    // });
    // await sleep(10000);
    // return 0;

    if (seletedPlanet !== undefined) {
        myPlanets = [];
        myPlanets.push(seletedPlanet);
    }

    let cnt = 0;

    for (let i = 0; i < myPlanets.length; i++) {
        if (cnt >= maxFromNumber) break;
        let from = myPlanets[i];
        from = df.getPlanetWithId(from.locationId);
        let range = calRange(from);
        let minDistToYellowCircle = getMinDistToYellowCircle(from);
        if (range < minDistToYellowCircle) break;

        let toPlanets = await opCatchYellow(from, setInfo, false, false);
        // console.log('toPlanets');
        // console.log(toPlanets);
        if (toPlanets.length === 0) continue;

        await sectionInvade(setInfo, false);
        //await sectionCapture(setInfo, false);

        showCandidatePlanets = toPlanets;
        showFromPlanets.push(from);

        content = '[CY] [' + getPlanetName(from) + '] from planet is here [' + cnt + ']';
        onClick = () => center(from);
        itemInfo = colorInfoWithFunc(content, colorForFromPlanets, onClick);
        addToLog(itemInfo, setInfo);

        let junkSum = getJunkOfPlanets(toPlanets);
        let scoreSum = getScoreOfPlanets(toPlanets);

        content = '[CY] ' + toPlanets.length + ' aim planet(s)';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        content = '[CY] will get ' + scoreSum.toLocaleString() + ' score(s)';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        let deltaJunk = getMyJunkBudget();
        let needJunk = Math.max(0, junkSum - deltaJunk);
        let junkEnabled = getJunkEnabled();

        if (junkEnabled) {
            content = '[CY] need ' + needJunk + ' junk(s) so abandon planets';
            itemInfo = colorInfo(content, colorForInfo);
            addToLog(itemInfo, setInfo);
            if (needJunk > 0)
                await sectionAbandon(setInfo, needJunk, 5, 0.7, [], toPlanets);
            
        }

        await opCatchYellow(from, setInfo, true, true);
        cnt++;
    }
    endSection('[CY] === catch yellow finish ===', setInfo, '[CY] ');
    await sleep(1000);
    catchYellowDrawSign = false;
    return;
}