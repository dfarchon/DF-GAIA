import { deltaTimeSection, getSetOfPlanets } from "./logicForBasic";
import { drawRound, drawCenter } from "./display";
import { beginSection, center, endSection, getPlanetName, sleep } from "./logicForBasic";
import { getArrivalsToPlanet, getEnergyCanSend, getOtherEnergyMoveToPlanet, getTrueEnergyPercent, getMyEnergyMoveToPlanet, judgeRange, getTrueEnergyInFuture } from "./logicForMoveEnergy";
import { calRange, destroyedFilter, getEnergyPercent, isDefenseBonus, isEnergyCapBonus, isEnergyGrowthBonus, isNotQuasar, isPlanet, isQuasar, isRangeBonus, isSpacetimeRip, isSpeedBonus, radiusFilter, inViewport, inBlackSpace, inGreenSpace, inDarkblueSpace, inBlueSpace } from "./logicForPlanetState";
import { addToLog, colorInfo, colorInfoWithFunc, greenInfo, normalInfo, pinkInfoWithFunc } from './infoUtils';
import { MAX_WAIT_TIME_FOR_COLLECT_ENERGY, MAX_WAIT_TIME_FOR_GOSSIP } from './cfgForBasic';
import { getSilverCanSend, getSilverMoveToPlanet } from "./logicForMoveSilver";
import { waitForMoveOnchain } from "./logicForMove";
import { isMine, isNoOwner, isOther } from "./logicForAccount";
import { getJunkEnabled, getMyJunkBudget, getPlanetJunk } from "./logicForJunk";
import { sectionAbandon } from "./sectionAbandon";
import { colorForInfo, colorForError, ENERGY_TARGET_PLANETS, ENERGY_SOURCE_PLANETS, CENTER_CANDIDATES, CHOOSE_CENTERS, ARMY_PLANETS } from './cfgForColor';
import { artifactFilter, canPlanetActivateArtifact } from "./logicForArtifactState";
import { canCapture, haveCaptured } from "./logicForInvadeAndCapture";
import { getCenterCoords } from './logicForCenterCoords';


//== about choose centers =============================================

export let chooseCenters = [];

let colorForChooseCenters = CHOOSE_CENTERS;

export function clearChooseCenters() {
    chooseCenters = [];
}



export function addChooseCenters() {
    let p = ui.getSelectedPlanet();
    if (p === undefined) return;

    let tmp = chooseCenters;
    tmp.push(p);
    tmp = getSetOfPlanets(tmp);
    chooseCenters = tmp;
}

export function clearOneOfChooseCenters() {
    let p = ui.getSelectedPlanet();
    if (p === undefined) return;
    let tmp = chooseCenters.filter(planet => planet.locationId !== p.locationId);
    chooseCenters = tmp;
}


export function sectionChooseCentersDraw(ctx) {
    chooseCenters.forEach(p => drawRound(ctx, p, colorForChooseCenters, 10, 1));
}


let drawSign = true;

let colorForShowCenterCandidates = CENTER_CANDIDATES;
let colorForEnergySourcePlanets = ENERGY_SOURCE_PLANETS;
let colorForEnergyTargetPlanets = ENERGY_TARGET_PLANETS;
let colorForArmyPlanets = ARMY_PLANETS;

let showTargets = [];
let showSources = [];

let showTargetNow = undefined;
let showSourcesNow = [];
let showSourceCandidatesNow = [];


let showCenterPlanet = undefined;
let showCenterCandidates = [];
let showTargetCandidates = [];

let showArmyPlanets = [];




export function sectionGossipDraw(ctx) {
    if (drawSign === false) return;

    if (showCenterPlanet !== undefined) {
        let tx = showCenterPlanet.location.coords.x;
        let ty = showCenterPlanet.location.coords.y;
        drawCenter(ctx, tx, ty);
    }

    showCenterCandidates.forEach(p => drawRound(ctx, p, colorForShowCenterCandidates, 1));
    showTargetCandidates.forEach(p => drawRound(ctx, p, colorForEnergyTargetPlanets, 3, 0.7));

    // showArmyPlanets.forEach(p=>drawRound(ctx,p,colorForArmyPlanets,2,1));

    if (showTargetNow !== undefined)
        drawRound(ctx, showTargetNow, colorForEnergyTargetPlanets, 10, 1);
    showSourcesNow.forEach(p => drawRound(ctx, p, colorForEnergySourcePlanets, 5, 1));
    showSourceCandidatesNow.forEach(p => drawRound(ctx, p, colorForEnergySourcePlanets, 3, 0.7));
    showTargets.forEach(p => drawRound(ctx, p, colorForEnergyTargetPlanets, 5, 1));
    showSources.forEach(p => drawRound(ctx, p, colorForEnergySourcePlanets, 3, 1));
}

function initShow() {
    showTargets = [];
    showSources = [];
    showTargetNow = undefined;
    showSourcesNow = [];
    showSourceCandidatesNow = [];
}

function targetFilter(p) {
    return destroyedFilter(p) &&
        radiusFilter(p) &&
        isQuasar(p) === false &&
        isNoOwner(p) &&
        haveCaptured(p) === false &&
        getOtherEnergyMoveToPlanet(p) === 0;
}

function sourceFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        artifactFilter(planet) &&
        getEnergyPercent(planet) >= 60 &&
        getOtherEnergyMoveToPlanet(planet) === 0 &&
        isMine(planet) &&
        canCapture(planet, false) === false;
}

function getTargetMinLevel(planets) {
    let minLevel = 9;
    planets.forEach(p => {
        let lvl = p.planetLevel;
        minLevel = Math.min(minLevel, lvl);

    });
    minLevel = Math.max(minLevel, 1);
    return minLevel;
}

function getCenterPlanetCandidates(minTargetLevel, centerCoords, preRange) {



    let centerCandidates = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(isNoOwner)
        .filter(p => inBlackSpace(p) || inGreenSpace(p))
        .filter(p => p.planetLevel >= minTargetLevel)
        .filter(isPlanet)
        .filter(p => isDefenseBonus(p) === false)
        .filter(p => getMyEnergyMoveToPlanet(p) === 0)
        .filter(p => getOtherEnergyMoveToPlanet(p) === 0)
        // .filter(p => {
        //     let dist = df.getDistCoords(centerCoords, p.location.coords);
        //     return dist < preRange;
        // })
        .sort((a, b) => {
            let aDist = df.getDistCoords(centerCoords, a.location.coords);

            let bDist = df.getDistCoords(centerCoords, b.location.coords);
            return aDist - bDist;
        });

    let res = centerCandidates.filter(p => p.planetLevel >= 5);
    if (res.length !== 0) return res;
    res = centerCandidates.filter(p => p.planetLevel >= 4);
    if (res.length !== 0) return res;

    return centerCandidates;
}

// if toChain ===false return if should gossip to planet
async function opGossip(setInfo, to, preCandidates, toChain = true, waitSign = true, showSign = false) {
    to = df.getPlanetWithId(to.locationId);
    preCandidates = df.getPlanetsWithIds(preCandidates.map(p => p.locationId));
    let content, onClick, itemInfo;

    if (toChain === false) {

        if (targetFilter(to) === false) return false;
        if (getOtherEnergyMoveToPlanet(to) > 0) return false;
    }

    if (showSign) {
        showTargetNow = to;
        showTargets.push(to);

        content = '[GO] [' + getPlanetName(to) + '] target now';
        onClick = () => center(to);
        itemInfo = colorInfoWithFunc(content, colorForEnergyTargetPlanets, onClick);
        addToLog(itemInfo, setInfo);
    }



    let candidates = preCandidates
        .filter(sourceFilter)
        .filter(p => p.planetLevel <= to.planetLevel + 2)
        .filter(p => {
            let dist = df.getDist(p.locationId, to.locationId);
            let range = calRange(p);
            let energyCanSend = getEnergyCanSend(p);
            let energyArriving = Math.ceil(df.getEnergyArrivingForMove(p.locationId, to.locationId, dist, energyCanSend));
            if (energyArriving < to.energyCap * 0.005) return false;
            return dist < range * 0.6;
        })
        .filter(p => {
            let time = df.getTimeForMove(p.locationId, to.locationId);
            return time < MAX_WAIT_TIME_FOR_GOSSIP;
        })
        .sort((a, b) => {
            let aDist = df.getDist(a.locationId, to.locationId);
            let bDist = df.getDist(b.locationId, to.locationId);
            let aTime = df.getTimeForMove(a.locationId, to.locationId);
            let bTime = df.getTimeForMove(b.locationId, to.locationId);

            let aEnergy = getEnergyCanSend(a);
            let bEnergy = getEnergyCanSend(b);

            let aEnergyLanding = df.getEnergyArrivingForMove(a.locationId, to.locationId, aDist, aEnergy);
            let bEnergyLanding = df.getEnergyArrivingForMove(b.locationId, to.locationId, bDist, bEnergy);

            return aTime - bTime;

            // if (aEnergyLanding !== b.energyLanding) return bEnergyLanding - aEnergyLanding;
            // else return aTime - bTime;
        });

    if (toChain === false) {
        if (candidates.length === 0) return false;
    }

    if (showSign) {
        content = '[GO] ' + candidates.length + ' candidate(s)';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
        showSourceCandidatesNow = candidates;
        showSourcesNow = [];
    }

    let maxArrivals = 6 - getArrivalsToPlanet(to);
    maxArrivals = Math.max(0, maxArrivals);
    maxArrivals = Math.min(maxArrivals, candidates.length);

    if (showSign) {
        content = '[GO] max arrivals: ' + maxArrivals;
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
    }

    let energyNeedSum = to.energyCap * 0.4 + to.energy * (to.defense * 0.01) - getMyEnergyMoveToPlanet(to);
    energyNeedSum = Math.ceil(energyNeedSum);
    energyNeedSum = Math.max(energyNeedSum, 0);

    let silverNeedSum = 0;

    if (isPlanet(to) || isSpacetimeRip(to)) {
        silverNeedSum = to.silverCap - to.silver - getSilverMoveToPlanet(to);
    } else silverNeedSum = 0;

    silverNeedSum = Math.ceil(silverNeedSum);
    silverNeedSum = Math.max(silverNeedSum, 0);

    if (showSign) {
        itemInfo = normalInfo('[GO] energyNeedSum:' + energyNeedSum);
        addToLog(itemInfo, setInfo);
        itemInfo = normalInfo('[GO] silverNeedSum:' + silverNeedSum);
        addToLog(itemInfo, setInfo);
    }

    let energyGet = 0;
    let silverGet = 0;

    for (let j = 0; j < maxArrivals; j++) {
        let from = candidates[j];
        from = df.getPlanetWithId(from.locationId);
        let dist = df.getDist(from.locationId, to.locationId);
        let energy = getEnergyCanSend(from);
        let silver = getSilverCanSend(from);
        let energyLanding = Math.floor(df.getEnergyArrivingForMove(from.locationId, to.locationId, dist, energy));
        const energyNeed = Math.max(energyNeedSum - energyGet, 0);
        const silverNeed = Math.max(silverNeedSum - silverGet, 0);

        if (energyNeed === 0) break;
        energyLanding = Math.min(energyLanding, energyNeed);
        silver = Math.min(silver, silverNeed);
        let energySend = Math.ceil(df.getEnergyNeededForMove(from.locationId, to.locationId, energyLanding));

        // try to avoid some revert
        energySend = Math.min(energySend, energy);

        let silverSend = silver;
        energyGet += energyLanding;
        silverGet += silverSend;
        if (showSign) {
            content = '[GO] [' + getPlanetName(from) + '] source planet';

            onClick = () => center(from);
            itemInfo = colorInfoWithFunc(content, colorForEnergySourcePlanets, onClick);
            addToLog(itemInfo, setInfo);
            content = '[GO] [' + getPlanetName(to) + '] target planet';
            onClick = () => center(to);
            itemInfo = colorInfoWithFunc(content, colorForEnergyTargetPlanets, onClick);
            addToLog(itemInfo, setInfo);
            content = '[GO] will get ' + energyLanding + ' energy and ' + silverSend + ' silver';
            itemInfo = normalInfo(content);
            addToLog(itemInfo, setInfo);

            showSourcesNow.push(from);
            showSources.push(from);
        }


        if (toChain) {
            try {
                if (isOther(to) === false)
                    await df.move(from.locationId, to.locationId, energySend, silverSend);
            } catch (e) {
                content = '[GO] [ERROR] move revert';
                itemInfo = colorInfo(content, colorForError);
                addToLog(itemInfo, setInfo);
            }
        }
    }
    if (showSign) {
        content = '[GO] center energy and silver to [' + getPlanetName(to) + ']';
        onClick = () => center(to);
        itemInfo = colorInfoWithFunc(content, colorForEnergyTargetPlanets, onClick);
        addToLog(itemInfo, setInfo);

        content = '[GO] energy get sum:' + energyGet + '; silver get sum:' + silverGet;
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        let defenseEnergy = to.energy * to.defense / 100;
        content = '[GO] defense energy: ' + defenseEnergy;
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
    }

    let energyGetSum = energyGet;
    let energyOfDefense = to.energy * to.defense / 100;


    if (toChain === false) {



        // console.log(energyGetSum);
        // console.log(energyOfDefense);
        if (isNoOwner(to)) {

            if (energyGetSum * 5 > energyOfDefense) return true;
            else return false;
        }

        return false;
    }

    if (showSign) {
        if (energyGetSum > energyOfDefense) {
            content = '[GO] can gossip successfully';
            itemInfo = greenInfo(content);
            addToLog(itemInfo, setInfo);
        } else {
            content = '[GO] can\'t gossip successfully';
            itemInfo = greenInfo(content);
            addToLog(itemInfo, setInfo);
        }
    }

    if (toChain && waitSign)
        await waitForMoveOnchain(setInfo, '[GO] ');
    return 0;
}


export async function sectionGossipSelected(setInfo) {
    let p = ui.getSelectedPlanet();
    if (p === undefined) return;
    await sectionGossip(setInfo, p, [], 6);

}



export async function sectionGossip(setInfo, chooseTo = undefined, chooseFroms = [], maxToNumber = 3, centerViewSign = false) {
    beginSection('[GO] === gossip begin ===', setInfo);
    drawSign = true;
    initShow();
    let content, onClick, itemInfo;

    let myArmyPlanets = Array.from(df.getMyPlanets())
        .filter(sourceFilter)
        .sort((a, b) => b.planetLevel - a.planetLevel);

    if (chooseFroms.length !== 0) {
        myArmyPlanets = chooseFroms;
    }

  

    content = '[GO] ' + myArmyPlanets.length + ' army planet(s)';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);
    myArmyPlanets = myArmyPlanets.slice(0, 50);
    content = '[GO] ' + myArmyPlanets.length + ' army planet(s)';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    showArmyPlanets = myArmyPlanets;

    let minTargetLevel = getTargetMinLevel(myArmyPlanets);
    content = '[GO] min target level is ' + minTargetLevel;
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    let preRange = 0;
    let centerCoords = getCenterCoords(myArmyPlanets);

    //   myArmyPlanets.forEach(p=>console.log(p.location.coords,p.planetLevel));

    myArmyPlanets.forEach(p => {
        let dist = df.getDistCoords(p.location.coords, centerCoords);
        let tmpRange = dist + calRange(p);
        preRange = Math.max(preRange, tmpRange);
    });

   deltaTimeSection(setInfo);

    let preTargetCandidates = Array.from(df.getAllPlanets())
    .filter(destroyedFilter)
    .filter(p => p.planetLevel >= minTargetLevel )
    .filter(p => {
        let dist = df.getDistCoords(centerCoords, p.location.coords);
        return dist <= preRange;
    })
        .filter(targetFilter);
        
     

    content = '[GO] ' + preTargetCandidates.length + ' pre candidate(s)';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

   deltaTimeSection(setInfo);




    let candidates = [];
    for (let i = 0; i < myArmyPlanets.length; i++) {
        let from = myArmyPlanets[i];
        let tmp = preTargetCandidates
            .filter(to => judgeRange(from, to, 0.8) === true);
        tmp.forEach(p => candidates.push(p));
        candidates = getSetOfPlanets(candidates);
    }

    candidates = df.getPlanetsWithIds(candidates.map(p => p.locationId));
    candidates = candidates
        .filter(targetFilter)
        .filter(p => getOtherEnergyMoveToPlanet(p) === 0)
        .filter(p => {
            if (p.planetLevel === 0) return getMyEnergyMoveToPlanet(p) === 0;
            else return getMyEnergyMoveToPlanet(p) < p.energy * p.defense / 100;
        });
    content = '[GO] ' + candidates.length + ' candidate(s)';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    deltaTimeSection(setInfo);

    let centerCandidates = getCenterPlanetCandidates(minTargetLevel, centerCoords, preRange);

    showCenterCandidates = centerCandidates;

    if (centerCandidates.length === 0) {
        content = '[GO] need wait for a while';
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);
        endSection('[GO] === gossip finish ===', setInfo);
        await sleep(1000);
        drawSign = false;
        return;

    }



    let centerPlanet = undefined;

    chooseCenters = chooseCenters.filter(isNoOwner);
   // console.log(chooseCenters);

    if (chooseCenters.length === 0) {
        centerPlanet = centerCandidates[0];
        content = '[GO] no chosen center planets';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
        content = '[GO] [' + getPlanetName(centerPlanet) + '] auto get center planet';
        onClick = () => center(centerPlanet);
        itemInfo = colorInfoWithFunc(content, colorForShowCenterCandidates, onClick);
        addToLog(itemInfo, setInfo);

    } else {
        chooseCenters = chooseCenters.sort((a, b) => {
            let aDist = df.getDistCoords(centerCoords, a.location.coords);
            let bDist = df.getDistCoords(centerCoords, b.location.coords);
            return aDist - bDist;
        });
        let fi = chooseCenters[0];
        let se = centerCandidates[0];

        let fiDist = Math.ceil(df.getDistCoords(centerCoords, fi.location.coords));
        let seDist = Math.ceil(df.getDistCoords(centerCoords, se.location.coords));

        content = '[GO] [' + getPlanetName(fi) + '] chooseCenter dist:' + fiDist;
        onClick = () => center(fi);
        itemInfo = colorInfoWithFunc(content, colorForChooseCenters, onClick);
        addToLog(itemInfo, setInfo);

        content = '[GO] [' + getPlanetName(se) + '] autoCenter dist:' + seDist;
        onClick = () => center(se);
        itemInfo = colorInfoWithFunc(content, colorForShowCenterCandidates, onClick);
        addToLog(itemInfo, setInfo);




        if (fiDist < seDist * 100) {
            centerPlanet = fi;
            content = '[GO] choose first';
            itemInfo = colorInfo(content, colorForInfo);
            addToLog(itemInfo, setInfo);
        }
        else {
            centerPlanet = se;
            content = '[GO] choose second';
            itemInfo = colorInfo(content, colorForInfo);
            addToLog(itemInfo, setInfo);
        }
    }

    showCenterPlanet = centerPlanet;

    //let tmp = candidates.filter(p=>inBlueSpace(p)===false && inDarkblueSpace(p)===false);
    // console.log(tmp);
    // console.log('tmp:'+tmp.length);
    //  if(tmp.length<=0) candidates = tmp;
    // candidates= candidates.sort((a,b)=>{
    //     let aDist = df.getDist(centerPlanet.locationId, a.locationId);
    //     let bDist = df.getDist(centerPlanet.locationId, b.locationId);
    //     return aDist - bDist;
    // });



    candidates = candidates.sort((a, b) => {
        // if(a.planetLevel!==b.planetLevel) return b.plnaetLevel-a.planetLevel;
        let aScore = 0;
        if (a.spaceJunk === 0) aScore += 1000;
        if (isEnergyGrowthBonus(a)) aScore += 2000;
        if (isRangeBonus(a)) aScore += 1000;
        if (isSpeedBonus(a)) aScore += 1000;
        if (isDefenseBonus(a)) aScore -= 1000;
        if (inBlackSpace(a)) aScore += 1000;
        else if (inGreenSpace(a)) aScore += 2000;
        else if (inDarkblueSpace(a)) aScore += 500;
        else if (inBlueSpace(a)) aScore += 0;

        aScore += 1000 * a.planetLevel;

        let bScore = 0;
        if (b.spaceJunk === 0) bScore += 1000;
        if (isEnergyGrowthBonus(b)) bScore += 2000;
        if (isRangeBonus(b)) bScore += 1000;
        if (isSpeedBonus(b)) bScore += 1000;
        if (isDefenseBonus(b)) bScore -= 1000;
        if (inBlackSpace(b)) bScore += 1000;
        else if (inGreenSpace(b)) bScore += 2000;
        else if (inDarkblueSpace(b)) bScore += 500;
        else if (inBlueSpace(b)) bScore += 0;
        bScore += 1000 * b.planetLevel;

        if (aScore !== bScore) return bScore - aScore;
        else {
            let aDist = df.getDist(centerPlanet.locationId, a.locationId);
            let bDist = df.getDist(centerPlanet.locationId, b.locationId);
            return aDist - bDist;
        };
    });

    candidates = candidates.slice(0, 50);
    // candidates.forEach(a=>{
    //     let aScore = 0;
    //     if (a.spaceJunk === 0) aScore += 1000;
    //     if (isEnergyGrowthBonus(a)) aScore += 2000;
    //     if (isRangeBonus(a)) aScore += 1000;
    //     if (isSpeedBonus(a)) aScore += 1000;
    //     if (isDefenseBonus(a)) aScore -= 1000;
    //     if(inBlackSpace(a)) aScore+=1000;
    //     else if(inGreenSpace(a)) aScore+=1000;
    //     else if(inDarkblueSpace(a)) aScore+=50;
    //     else if(inBlueSpace(a)) aScore+=0;

    //     aScore += 1000 * a.planetLevel;
    //     content = getPlanetName(a)+' '+aScore;
    //     onClick = ()=>center(a);
    //     itemInfo = colorInfoWithFunc(content,colorForInfo,onClick);
    //     addToLog(itemInfo,setInfo);
    // });



    if (chooseTo !== undefined) {
        candidates = [];
        candidates.push(chooseTo);
    }

    showTargetCandidates = candidates;



    if (centerViewSign) {
        beginSection('== begin center view ==', setInfo);
        let planets = candidates.slice(0, 20);
        const viewport = ui.getViewport();
        let left = viewport.getLeftBound();
        let right = viewport.getRightBound();
        let top = viewport.getTopBound();
        let bottom = viewport.getBottomBound();

        let x = (left + right) / 2;
        let y = (top + bottom) / 2;

        content = 'old x:' + x + '; y:' + y;
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);
        let coords = planets[0].location.coords;
        //    console.log(coords);
        let planetLeft = coords.x;
        let planetRight = coords.x;
        let planetTop = coords.y;
        let planetBottom = coords.y;

        planets.forEach(p => {
            let range = p.range;
            let planetCoords = p.location.coords;
            planetLeft = Math.min(planetLeft, planetCoords.x - range - 1000);
            planetRight = Math.max(planetRight, planetCoords.x + range + 1000);
            planetTop = Math.max(planetTop, planetCoords.y + range + 1000);
            planetBottom = Math.min(planetBottom, planetCoords.y - range - 1000);
        });

        // console.log(planetLeft);
        // console.log(planetRight);
        // console.log(planetTop);
        // console.log(planetBottom);

        let newX = 0.5 * (planetLeft + planetRight);
        let newY = 0.5 * (planetTop + planetBottom);

        content = 'new x:' + x + '; y:' + y;
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);
        if (newX !== x || newY !== y) {
            ui.centerCoords({ x: newX + 1, y: newY + 1 });
        }

        // if (length === inViewAmount) {
        //     content = 'all planet in viewport';
        //     itemInfo = normalInfo(content);
        //     addToLog(itemInfo, setInfo);
        //     endSection('== end center view ==',setInfo);
        //     return;
        // }


        let height = viewport.getViewportWorldHeight();
        let width = viewport.getViewportWorldWidth();

        let newHeight = planetRight - planetLeft;
        let newWidth = planetTop - planetBottom;

        content = 'old height:' + height + '; width:' + width;
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);
        content = 'cal height:' + newHeight + '; width:' + newWidth;
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);

        let flag = true; // if true judge height, else judgt width;

        if (height / width < newHeight / newWidth) flag = true;
        else flag = false;

        let zoomIn = true; // if true zoom in, false: zoom out

        const zoomDelta = 200;
        let cnt = 0;
        while (true) {
            height = viewport.getViewportWorldHeight();
            width = viewport.getViewportWorldWidth();
            if (zoomIn) {
                if (flag) if (newHeight < height) break;
                else if (newWidth < width) break;
                viewport.onScroll(+zoomDelta, true);
            } else {
                if (flag) if (newHeight + 100 > height) break;
                else if (newWidth + 100 > width) break;
                viewport.onScroll(-zoomDelta, true);
            }

            let inViewAmount = 0;
            planets.forEach(p => {
                if (inViewport(p)) inViewAmount++;
            });
            if (inViewAmount === planets.length) break;
            cnt++;
            if (cnt === 50) break;
            height = viewport.getViewportWorldHeight();
            width = viewport.getViewportWorldWidth();

            content = 'height:' + height + '; width:' + width;
            itemInfo = normalInfo(content);
            addToLog(itemInfo, setInfo);
            await sleep(1000);
        }
        endSection('== end center view ==', setInfo);
    }

    let cnt = 0;



    for (let i = 0; i < candidates.length; i++) {
        if (cnt >= maxToNumber) break;
        let to = candidates[i];

        let state = await opGossip(setInfo, to, myArmyPlanets, false, false, false);
        if (state === false) continue;



        let junkEnabled = getJunkEnabled();
        let myJunkBudget = getMyJunkBudget();
        let planetJunk = to.spaceJunk;
        if (junkEnabled && to.spaceJunk > 0) {
            if (myJunkBudget < planetJunk) {

                content = '[GO] my junk budget:' + myJunkBudget;
                itemInfo = normalInfo(content);
                addToLog(itemInfo, setInfo);

                content = '[GO] planet junk:' + planetJunk;
                itemInfo = normalInfo(content);
                addToLog(itemInfo, setInfo);

                await sectionAbandon(setInfo, planetJunk, 5, 0.8);

                content = '[GO] after abandon';
                itemInfo = normalInfo(content);
                addToLog(itemInfo, setInfo);

                myJunkBudget = getMyJunkBudget();
                content = '[GO] my junk budget:' + myJunkBudget;
                itemInfo = normalInfo(content);
                addToLog(itemInfo, setInfo);

            }

            if (myJunkBudget < planetJunk) continue;
        }


        content = '[GO] [' + getPlanetName(to) + '] gossip target [' + cnt + ']';
        onClick = () => center(to);
        itemInfo = pinkInfoWithFunc(content, onClick);
        addToLog(itemInfo, setInfo);

        await opGossip(setInfo, to, myArmyPlanets, true, true, true);

        cnt++;

    }


    endSection('[GO] === gossip finish ===', setInfo);
    await sleep(1000);
    drawSign = false;
}


