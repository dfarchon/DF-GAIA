import {
    addToLog,
    pinkInfo,
    greenInfo,
    normalInfo,
    colorInfo,
    pinkInfoWithFunc,
    colorInfoWithFunc
} from './infoUtils';

import {
    hasArtifact,
    artifactFilter,
    hasArtifactsCanActivate,
    whereIsShipGear,
    getArtifactsInPlanet,
    planetWithActivePhotoidCannon,
    isPhotoidCannon,
    getArtifactName,
    getCanActiveArtifactsInPlanet,
    getArtifactAndSpaceshipAmountsInFuture,
    isWormhole,
    isActive
} from './logicForArtifactState';

import {
    notOwnerAddress
} from './cfgForBasic';

import {
    beginSection,
    endSection,
    sleep,
    center,
    getPlanetName,
    getSetOfPlanets
} from './logicForBasic';

import {
    waitForMoveOnchain
} from './logicForMove';

import {
    destroyedFilter,
    getEnergyPercent,
    inBlackSpace,
    inBlueSpace,
    inDarkblueSpace,
    isAsteroidField,
    isFoundry,
    isNotQuasar,
    isPlanet,
    isSpacetimeRip,
    radiusFilter
} from './logicForPlanetState';

import {
    getArrivalsToPlanet
} from './logicForMoveEnergy';

import {
    drawRound,
} from './display';

import {
    isInZones,
    notInvade,
    haveCaptured,
    canCapture,
    invadeButCanNotCapture
} from './logicForInvadeAndCapture';

import {
    colorForWarn,
    colorForInfo,
    colorForError,
    ABANDON_PLANETS
} from './cfgForColor';

import {
    getJunkEnabled,
    getPlanetJunk,
    getMyJunk,
    getMyJunkLimit
} from './logicForJunk';

import {
    judgeAbandonRange
} from './logicForAbandon';

import {
    hasOwner,
    isFamily,
    isMain,
    isMine,
    isOther
} from './logicForAccount';

let colorForAbandonPlanets = ABANDON_PLANETS;
let showAbandonPlanet = undefined;
let showAbandonPlanets = [];

let drawSign = true;

export function sectionAbandonDraw(ctx) {
    if (drawSign === false) return;

    if (showAbandonPlanet !== undefined)
        drawRound(ctx, showAbandonPlanet, colorForAbandonPlanets, 5, 1);

    showAbandonPlanets.forEach(p =>
        drawRound(ctx, p, colorForAbandonPlanets, 3, 0.7));

}


function getAbandonMinLevel() {
    let myPlanets = Array.from(df.getMyPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(artifactFilter)
        .filter(p => p.isHomePlanet === false)
        .filter(p => getArrivalsToPlanet(p) === 0);
    let level = 9;
    myPlanets.forEach(p => level = Math.min(level, p.planetLevel));
    return level;
}

function getAbandonMaxLevel() {
    let myPlanets = Array.from(df.getMyPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(artifactFilter)
        .filter(p => p.isHomePlanet === false)
        .filter(p => getArrivalsToPlanet(p) === 0);
    let level = 0;
    myPlanets.forEach(p => level = Math.max(level, p.planetLevel));
    if(level>=8) return 5;
    else if (level === 7) return 4;
    else if (level === 6) return 4;
    else if (level === 5) return 3;
    else if (level === 4) return 2;
    else if (level === 3) return 1;
    else if (level === 2) return 1;
    else return 0;


}

// wait for abandon 
// waitForMoveOnchain(setInfo);



let sorted = (a, b) => {
    if (a.planetLevel !== b.planetLevel) return a.planetLevel - b.planetLevel;
    let aScore = 0;
    let bScore = 0;

    if (isFoundry(a)) aScore += 10;
    if (inBlueSpace(a)) aScore += 100;
    if (inDarkblueSpace(a)) aScore += 50;
    if (invadeButCanNotCapture(a)) aScore += 100;
    if (haveCaptured(a)) aScore += 1000;
    if (hasArtifact(a)) aScore = 0;

    if (isFoundry(b)) bScore += 10;
    if (inBlueSpace(b)) bScore += 100;
    if (inDarkblueSpace(b)) bScore += 50;
    if (invadeButCanNotCapture(a)) aScore += 100;
    if (haveCaptured(b)) aScore += 1000;
    if (hasArtifact(b)) bScore = 0;

    return bScore - aScore;
};

export async function opAbandon(plt, setInfo, attackOther = false, waitSign = false) {

    plt = df.getPlanetWithId(plt.locationId);
    let content, onClick, itemInfo;

    let junkEnabled = getJunkEnabled();
    let myJunk = getMyJunk();
    let pltJunk = getPlanetJunk(plt);

    if (junkEnabled && myJunk < pltJunk) {
        content = '[AB] [WARN] player junk is too low';
        itemInfo = colorInfo(content, colorForWarn);
        addToLog(itemInfo, setInfo);
        return -1;
    }

    if (isInZones(plt) && notInvade(plt) && isMine(plt)) {
        content = '[AB] [WARN] [' + getPlanetName(plt) + '] in zone but not invade';
        onClick = center(plt);
        itemInfo = colorInfoWithFunc(content, colorForWarn, onClick);
        addToLog(itemInfo, setInfo);
        return -1;
    }

    if (canCapture(plt)) {
        content = '[AB] [WARN] [' + getPlanetName(plt) + '] the planet can capture now!';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForWarn, onClick);
        addToLog(itemInfo, setInfo);
        return -1;
    }

    let planet = whereIsShipGear();
    if (planet !== undefined && planet.locationId === plt.locationId) {
        content = '[AB] [WARN] [' + getPlanetName(plt) + '] gear is on this planet';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForWarn, onClick);
        addToLog(itemInfo, setInfo);
        return -1;
    }

    if (planetWithActivePhotoidCannon(plt)) {
        content = '[AB] [WARN] [' + getPlanetName(plt) + '] have active cannon';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForWarn, onClick);
        addToLog(itemInfo, setInfo);
        return -1;
    }

    let aimPlanets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(p => p.planetLevel >= 3)
        .filter(p => getArrivalsToPlanet(p) < 6)
        .filter(p => getArtifactAndSpaceshipAmountsInFuture(p) < 5)
        .filter(p => judgeAbandonRange(plt, p))
        .filter(p => p.locationId !== plt.locationId)
        .filter(p => {
            if (isMine(p)) return true;
            // notice : avoid to attack other to cause war
            // if (attackOther && hasOwner(p)) return true;
            return false;
        })
        .sort((a, b) => {
            let aTime = df.getTimeForMove(plt.locationId, a.locationId);
            let bTime = df.getTimeForMove(plt.locationId, b.locationId);
            return aTime - bTime;

        });





    if (aimPlanets.length === 0) {
        content = '[AB] [' + getPlanetName(plt) + '] no abandon aim';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForWarn, onClick);
        addToLog(itemInfo, setInfo);
        return -1;
    }


    let to = aimPlanets[0];
    let artifactMoved = undefined;

    let candidateArtifacts = getCanActiveArtifactsInPlanet(plt);
    if (candidateArtifacts.length !== 0) {
        candidateArtifacts = candidateArtifacts.sort((a, b) => {
            let aScore = a.rarity;
            if (isPhotoidCannon(a)) aScore += 10;
            let bScore = b.rarity;
            if (isPhotoidCannon(b)) bScore += 10;
            return bScore - aScore;
        });
        artifactMoved = candidateArtifacts[0].id;

        content = '[AB] [' + getPlanetName(plt) + '] carry artifact [' + getArtifactName(candidateArtifacts[0]) + ']';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForAbandonPlanets, onClick);
        addToLog(itemInfo, setInfo);
    }


    let abandoning = true;
    let forces = Math.floor(plt.energy);
    let silver = Math.floor(plt.silver);

    let value = getPlanetJunk(plt);

    content = '[AB] [' + getPlanetName(plt) + '] this plt = ' + value + ' junk(s)';
    onClick = () => center(plt);
    itemInfo = colorInfoWithFunc(content, colorForAbandonPlanets, onClick);
    addToLog(itemInfo, setInfo);
    showAbandonPlanet = plt;


    try {
        await df.move(plt.locationId, to.locationId, forces, silver, artifactMoved, abandoning);
        if (waitSign) await waitForMoveOnchain(setInfo);
    } catch (e) {
        content = '[AB] [ERROR] move revert';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForError, onClick);
        addToLog(itemInfo, setInfo);
        return -1;
    }
    return getPlanetJunk(plt);
}


// 在满足最高abandon星球的等级要求下
// 如果满足 needJunk or stopJunkPercent 其中一个就可以

// if needJunk === -1 

// abandonPlanets is to set the candidate planets for abandon,
//      if abandonPlanets.length === 0, the code will automatically calculate a set of planets
//
// dontAbandonPlanets is to set the planets which can't abandon

export async function sectionAbandon(setInfo, needJunk = -1, maxLevel = 5, stopJunkPercent = 0.8, abandonPlanets = [], dontAbandonPlanets = [], attackOther = false) {
    beginSection('[AB] === abandon begin ===', setInfo);
    drawSign = true;
    showAbandonPlanet = undefined;
    showAbandonPlanets = [];
    let content, onClick, itemInfo;

    if (needJunk != -1) {
        beginSection('[AB] need ' + needJunk.toLocaleString() + ' junk(s)', setInfo);
    }

    let abandonMinLevel = getAbandonMinLevel();
    let abandonMaxLevel = getAbandonMaxLevel();

    content ='[AB] abandon min level '+abandonMinLevel;
    itemInfo = colorInfo(content,colorForInfo);
    addToLog(itemInfo,setInfo);
    content = '[AB] abadnon max level '+abandonMaxLevel;
    itemInfo = colorInfo(content,colorForInfo);
    addToLog(itemInfo,setInfo);
    content = '[AB] user set max level '+maxLevel;
    itemInfo = colorInfo(content,colorForInfo);
    addToLog(itemInfo,setInfo);
    

    let myPlanets = Array.from(df.getMyPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(artifactFilter)
        .filter(p => p.isHomePlanet === false)
        .filter(p => p.planetLevel >= abandonMinLevel && p.planetLevel <= abandonMaxLevel)
        .filter(p => p.planetLevel <= maxLevel)
        .filter(p => getArrivalsToPlanet(p) === 0)
        .filter(p => dontAbandonPlanets.includes(p) === false);
        



    if (abandonPlanets.length !== 0) {
        myPlanets = Array.from(abandonPlanets)
            .filter(destroyedFilter)
            .filter(radiusFilter)
            .filter(artifactFilter)
            .filter(p => p.isHomePlanet === false)
            .filter(p => p.planetLevel >= abandonMinLevel && p.planetLevel <= abandonMaxLevel)
            .filter(p => getArrivalsToPlanet(p) === 0)
            .filter(p => dontAbandonPlanets.includes(p) === false);

    }

    // wormhole filter
    let myActiveWormholes = Array.from(df.getMyArtifacts())
        .filter(isWormhole)
        .filter(isActive);
    // console.log(myActiveWormholes);

    let planetsLinkToWormhole = [];
    myActiveWormholes.forEach(it => {
        let fi = df.getPlanetWithId(it.wormholeTo);
        let se = df.getPlanetWithId(it.onPlanetId);
        planetsLinkToWormhole.push(fi);
        planetsLinkToWormhole.push(se);
    })
    planetsLinkToWormhole = getSetOfPlanets(planetsLinkToWormhole);
 
    myPlanets = myPlanets
        .filter(p => myActiveWormholes.includes(p) === false)
        .sort(sorted);


    content = '[AB] ' + myPlanets.length + ' candidate planet(s)';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    let candidateJunkSum = 0;
    myPlanets.forEach(p => candidateJunkSum += getPlanetJunk(p));
    content = '[AB] ' + candidateJunkSum.toLocaleString() + ' candidate junk sum';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);


    let cnt = 0;
    let junkCount = 0;


    for (let i = 0; i < myPlanets.length; i++) {
        let myJunk = getMyJunk();
        let junkLimit = getMyJunkLimit();
        let junkEnabled = getJunkEnabled();

        if (junkEnabled === false) {
            content = '[AB] [WARN] junk enabled === false';
            itemInfo = colorInfo(content, colorForWarn);
            addToLog(itemInfo, setInfo);
            break;
        }

        if (myJunk <= Math.floor(junkLimit * stopJunkPercent)) {
            let percent = Math.floor(stopJunkPercent * 100);
            content = '[AB] [WARN] your junk is less than ' + percent + ' %';
            itemInfo = colorInfo(content, colorForWarn);
            addToLog(itemInfo, setInfo);
            break;
        }
        if (needJunk !== -1 && junkCount >= needJunk) {
            content = '[AB] junkCount >= needJunk';
            itemInfo = colorInfo(content, colorForInfo);
            addToLog(itemInfo, setInfo);

            break;
        }


        let plt = myPlanets[i];
        plt = df.getPlanetWithId(plt.locationId);
        if (getArrivalsToPlanet(plt) !== 0) continue;

        content = '[AB] [' + getPlanetName(plt) + '] planet [' + i + ']';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForAbandonPlanets, onClick);
        addToLog(itemInfo, setInfo);

        showAbandonPlanets.push(plt);

        let res = await opAbandon(plt, setInfo, attackOther, false);
        if (res != -1) {
            junkCount += res;
            cnt++;
            if (cnt % 3 === 0) await waitForMoveOnchain(setInfo, '[AB] ');
        }
    }
    await waitForMoveOnchain(setInfo, '[AB] ');
    content = '[AB] ' + junkCount + ' junk(s) --';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    endSection('[AB] === abandon finish ===', setInfo, '[AB] ');
    drawSign = false;
    await sleep(1000);
    return;
}