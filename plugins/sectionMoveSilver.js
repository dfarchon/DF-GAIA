import {
    colorForInfo,
    colorForWarn,
    colorForError,
    MOVE_SILVER_SOURCE,
    MOVE_SILVER_TO_PLANETS,
    MOVE_SILVER_TO_BLOCKHOLES
} from './cfgForColor';

import {
    addToLog,
    pinkInfo,
    greenInfo,
    normalInfo,
    colorInfo,
    colorInfoWithFunc
} from './infoUtils';

import { artifactFilter } from './logicForArtifactState';

import {
    sleep,
    beginSection,
    endSection,
    getPlanetName,
    center,
    getSetOfPlanets
} from './logicForBasic';

import {
    destroyedFilter,
    isAsteroidField,
    isPlanet,
    isSpacetimeRip,
    radiusFilter
} from './logicForPlanetState';

import {
    isPlanetAtMaxRank
} from './logicForUpgrade';


import {
    getArrivalsToPlanet,
    judgeLevel,
    getEnergyCanSend,
    judgeRange,
    getOtherEnergyMoveToPlanet
} from './logicForMoveEnergy';

import {
    drawRound
} from './display';
import {
    getNeedSilver,
    getSilverCanSend,
    getTrueSilverInTheFuture
} from './logicForMoveSilver';


import { MAX_MOVE_SILVER_TIME } from './cfgForBasic';
import { waitForMoveOnchain } from './logicForMove';


import {
    isOther
} from './logicForAccount';
import { canCapture } from './logicForInvadeAndCapture';

let colorForSilverSources = MOVE_SILVER_SOURCE;
let colorForMoveToPlanets = MOVE_SILVER_TO_PLANETS;
let colorForMoveToBlockholes = MOVE_SILVER_TO_BLOCKHOLES;

let showAllSilverSources = [];
let showAllSilverTarges = [];


let showSilverSource = undefined;
let showSilverTargets = [];

let drawSign = true;
export function sectionMoveSilverDraw(ctx) {
    if (drawSign === false) return;

    if (showSilverSource !== undefined)
        drawRound(ctx, showSilverSource, colorForSilverSources, 5, 1);
    showSilverTargets.forEach(p => {
        if (isPlanet(p)) drawRound(ctx, p, colorForMoveToPlanets, 5, 1);
        if (isSpacetimeRip(p)) drawRound(ctx, p, colorForMoveToBlockholes, 5, 1);
    });

    showAllSilverSources.forEach(p => drawRound(ctx, p, colorForSilverSources, 2, 0.7));

    showAllSilverTarges.forEach(p => {
        if (isPlanet(p)) drawRound(ctx, p, colorForMoveToPlanets, 2, 0.7);
        if (isSpacetimeRip(p)) drawRound(ctx, p, colorForMoveToBlockholes, 2, 0.7);
    });
}


// my asteroidField(s) move silver to my planet(s) or my SpacetimeRip(s)

// mode === 0  only to normal planet(s)
// mode === 1  to both, but to normal planet(s) first
// mode === 2  only to SpacetimeRip(s)
function judgePlanetType(planet, mode) {
    if (mode === 0) return isPlanet(planet);
    else if (mode === 1) return isPlanet(planet) || isSpacetimeRip(planet);
    else if (mode === 2) return isSpacetimeRip(planet);
    return false;
}

function asteroidFieldFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        isAsteroidField(planet) &&
        Math.floor(planet.silver) > 0 &&
        getOtherEnergyMoveToPlanet(planet) === 0 &&
        planet.planetLevel < 7 &&
        canCapture(planet,false)===false;
};


function getToMinLevel(planets) {
    let minLevel = 9;
    planets.forEach(p => {
        let lvl = p.planetLevel;
        minLevel = Math.min(minLevel, lvl - 1);
    });
    minLevel = Math.max(minLevel, 1);
    return minLevel;
}



function preCandidateFilter(planet, mode, minLevel) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        judgePlanetType(planet, mode) &&
        planet.planetLevel >= minLevel;
}

// if toChain === true     
//             return 0
// if toChain === false 
//         return the aim planet(s) 
async function opMoveSilver(from, preCandidates, setInfo, toChain = true, waitSign = true) {

    showSilverSource = undefined;
    showSilverTargets = [];

    let content, onClick, itemInfo;

    from = df.getPlanetWithId(from.locationId);
    preCandidates = df.getPlanetsWithIds(preCandidates.map(p => p.locationId));

    let candidates = preCandidates
        .filter(p => judgeRange(from, p, 0.4))
        .filter(p=>judgeLevel(from,p))
        .filter(p => {
            let needSilver = getNeedSilver(p);
            // if (isPlanet(p) && isPlanetAtMaxRank(p)) needSilver = 0;
            if (needSilver === 0) return false;
            return true;
        })
        .sort((a, b) => {
            let aTypeValue = isPlanet(a) ? 1 : 2;
            let bTypeValue = isPlanet(b) ? 1 : 2;
            if (aTypeValue !== bTypeValue) return aTypeValue - bTypeValue;

            let aDelta = getNeedSilver(a);
            if (isPlanet(a) && isPlanetAtMaxRank(a)) aDelta = 0;
            let bDelta = getNeedSilver(b);
            if (isPlanet(b) && isPlanetAtMaxRank(b)) bDelta = 0;
            if (aDelta !== bDelta) return bDelta - aDelta;
			
			let aTime = df.getTimeForMove(from.locationId,a.locationId);
			let bTime = df.getTimeForMove(from.locationId,b.locationId);
			return aTime - bTime;

        });


    if (toChain) {
        showSilverSource = from;
        content = '[MS] '+candidates.length + ' candidate(s)';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
    }
    const energyBudget = getEnergyCanSend(from);
    const silverBudget = getSilverCanSend(from);
    let energySpent = 0;
    let silverSpent = 0;

    let moves = 0;

    let toPlanets = [];
    let fakeCandidates = [];

    // notice: for fakeCandidates item.silver includes the silver on voyoga and on unconfirmedMoves
    candidates.forEach(p => {
        let item = {};
        item.locationId = p.locationId;
        item.silver = getTrueSilverInTheFuture(p);
        item.silverCap = p.silverCap;
        item.arrivals = getArrivalsToPlanet(p);
        item.planetType = p.planetType;

        fakeCandidates.push(item);
    });

    for (let i = 0; i < fakeCandidates.length; i++) {
        // notice:  if the variable to change 
        //  fakeCandidates[i] will change too
        let fakeCandidate = fakeCandidates[i];
        // notice: to's state may not update 
        const silverLeft = silverBudget - silverSpent;
        const energyLeft = energyBudget - energySpent;
        if (silverLeft < 1000) break;
        if (energyLeft <= 0) break;
        if (fakeCandidate.arrivals >= 6) break;

        let time = Math.ceil(df.getTimeForMove(from.locationId, fakeCandidate.locationId));
        if (time > MAX_MOVE_SILVER_TIME) continue;

        let energyArriving = 5;
        let energyNeeded = Math.ceil(df.getEnergyNeededForMove(from.locationId, fakeCandidate.locationId, energyArriving));
        if (energyNeeded > energyLeft) continue;

        let silverNeeded = Math.ceil(fakeCandidate.silverCap - fakeCandidate.silver);
        // if (isPlanet(to) && isPlanetAtMaxRank(to)) silverNeeded = 0;
        if (silverNeeded <= 0) continue;

        silverNeeded = Math.min(silverNeeded, silverLeft);

        energySpent += energyNeeded;
        silverSpent += silverNeeded;
        moves++;

        if (toChain) {
            content = '[MS] ['+getPlanetName(from)+'] silver source';
            onClick = () => center(from);
            itemInfo = colorInfoWithFunc(content, colorForSilverSources, onClick);
            addToLog(itemInfo, setInfo);
            content = '[MS] ['+getPlanetName(fakeCandidate)+'] silver target';
            onClick = () => center(fakeCandidate);
            let nowColor = isPlanet(fakeCandidate) ? colorForMoveToPlanets : colorForMoveToBlockholes;
            itemInfo = colorInfoWithFunc(content, nowColor, onClick);
            addToLog(itemInfo, setInfo);

            content ='[MS] use '+energyNeeded.toLocaleString() + ' energy to send ' + silverNeeded.toLocaleString() + ' silver';
            itemInfo = normalInfo(content);
            addToLog(itemInfo, setInfo);

            content = '[MS] to planet have ' + fakeCandidate.silver.toLocaleString() + ' silver';
            itemInfo = colorInfo(content, colorForInfo);
            addToLog(itemInfo, setInfo);
        }

        fakeCandidate.arrivals += 1;
        fakeCandidate.silver += silverNeeded;
        fakeCandidate.silver = Math.min(fakeCandidate.silver, fakeCandidate.silverCap);
        toPlanets.push(fakeCandidate);


        if (toChain) {
            content = '[MS] to planet have ' + fakeCandidate.silver.toLocaleString() + ' silver after move';
            itemInfo = colorInfo(content, colorForInfo);
            addToLog(itemInfo, setInfo);
            content = '[MS] to planet have ' + fakeCandidate.silverCap.toLocaleString() + ' silverCap';
            itemInfo = colorInfo(content, colorForInfo);
            addToLog(itemInfo, setInfo);
            showSilverTargets.push(df.getPlanetWithId(fakeCandidate.locationId));
        }

        if (toChain) {
            try {
                //todo: maybe need check for last time
                await df.move(from.locationId, fakeCandidate.locationId, energyNeeded, silverNeeded);
            } catch (e) {
                content = '[MS] [ERROR] move revert';
                itemInfo = colorInfo(content, colorForError);
                addToLog(itemInfo, setInfo);
                console.error(e);
            }
        }
    }

    if (toChain === false) {
        toPlanets = df.getPlanetsWithIds(toPlanets.map(p => p.locationId));
        return toPlanets;
    } else {
        if (moves > 0 && waitSign) {
            await waitForMoveOnchain(setInfo,'[MS] ');
        }
        return 0;
    }
}


export async function sectionMoveSilver(setInfo, mode = 1, maxFromNumber = 3) {
    beginSection('[MS] === move silver begin  ===', setInfo);
    drawSign = true;

    showAllSilverSources = [];
    showAllSilverTarges = [];
    showSilverSource = undefined;
    showSilverTargets = [];

    let content, onClick, itemInfo;

    let myAsteroidFields = Array.from(df.getMyPlanets())
        .filter(asteroidFieldFilter)
        .sort((a, b) => b.silver - a.silver);
    itemInfo = colorInfo('[MS] ' + myAsteroidFields.length + ' planet(s) have silver',colorForInfo);
    addToLog(itemInfo, setInfo);

    let minLevel = getToMinLevel(myAsteroidFields);
    itemInfo = colorInfo('[MS] min to level: '+minLevel);
    addToLog(itemInfo,setInfo);

    itemInfo = pinkInfo('[MS] max from number: ' + maxFromNumber);
    addToLog(itemInfo, setInfo);

    let preCandidates = Array.from(df.getMyPlanets())
        .filter(p => preCandidateFilter(p, mode, minLevel));

    itemInfo = normalInfo('[MS] ' + preCandidates.length + ' pre candidate(s)');
    addToLog(itemInfo, setInfo);

    let cnt = 0;
    for (let i = 0; i < myAsteroidFields.length; i++) {
        let plt = myAsteroidFields[i];
        let aimPlanets = await opMoveSilver(plt, preCandidates, setInfo, false);
        if (aimPlanets.length === 0) continue;
        showAllSilverSources.push(plt);
        aimPlanets.forEach(p => showAllSilverTarges.push(p));
        content = '[MS] ['+getPlanetName(plt)+'] Asteriod Field [' + cnt + ']';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForSilverSources, onClick);
        addToLog(itemInfo, setInfo);
        await opMoveSilver(plt, preCandidates, setInfo, true, true);
        cnt++;
        if (cnt === maxFromNumber) break;

    }
    endSection('[MS] === move silver finish ===', setInfo, '[MS] ');
    await sleep(1000);
    drawSign = false;
}