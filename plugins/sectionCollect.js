
import { drawRound } from "./display";
import { beginSection, center, endSection, getPlanetName, sleep } from "./logicForBasic";
import { getArrivalsToPlanet, getEnergyCanSend, getOtherEnergyMoveToPlanet, getTrueEnergyPercent, getMyEnergyMoveToPlanet, judgeLevel } from "./logicForMoveEnergy";
import { calRange, destroyedFilter, getEnergyPercent, isPlanet, isQuasar, isSpacetimeRip, radiusFilter } from "./logicForPlanetState";
import { addToLog, colorInfo, colorInfoWithFunc, normalInfo, pinkInfoWithFunc } from './infoUtils';
import { MAX_WAIT_TIME_FOR_COLLECT_ENERGY } from './cfgForBasic';
import { getSilverCanSend, getSilverMoveToPlanet } from "./logicForMoveSilver";
import { waitForMoveOnchain } from "./logicForMove";
import { isMine, isOther } from "./logicForAccount";
import { colorForInfo, colorForWarn, colorForError} from './cfgForColor';
import { ENERGY_TARGET_PLANETS, ENERGY_SOURCE_PLANETS } from './cfgForColor';
import { artifactFilter } from "./logicForArtifactState";
import { canCapture } from "./logicForInvadeAndCapture";


let drawSign = true;

let colorForEnergySourcePlanets = ENERGY_SOURCE_PLANETS;
let colorForEnergyTargetPlanets = ENERGY_TARGET_PLANETS;

let showTargets = [];
let showSources = [];

let showTargetNow = undefined;
let showSourcesNow = [];
let showSourceCandidatesNow = [];

export function sectionCollectDraw(ctx) {
    if (drawSign === false) return;

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

function targetFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        planet.planetLevel >= 5 &&
        isQuasar(planet) === false &&
        getTrueEnergyPercent(planet) < 85 &&
        isMine(planet);
}

function sourceFilter(p) {
    return destroyedFilter(p) &&
        radiusFilter(p) &&
        artifactFilter(p) &&
        p.planetLevel >= 1 &&
        p.planetLevel <= 5 &&
        getEnergyPercent(p) >= 40 &&
        getOtherEnergyMoveToPlanet(p) === 0 &&
        isMine(p) &&
        canCapture(p,false) === false;
}
// if toChain ===false return energyCanGet 
async function opCollect(setInfo, to, preCandidates, toChain = true, waitSign = true, showSign = true) {
    to = df.getPlanetWithId(to.locationId);
    preCandidates = df.getPlanetsWithIds(preCandidates.map(p => p.locationId));

    if (showSign) {
        showTargetNow = to;
        showTargets.push(to);
    }

    let content, onClick, itemInfo;

    let candidates = preCandidates
        .filter(p => judgeLevel(p, to))
        .filter(p => p.planetLevel < to.planetLevel)
        .filter(p => {
            let dist = df.getDist(p.locationId, to.locationId);
            let range = calRange(p);
            let energyCanSend = getEnergyCanSend(p);
            let energyArriving = Math.ceil(df.getEnergyArrivingForMove(p.locationId, to.locationId, dist, energyCanSend));
            if (energyArriving < to.energyCap * 0.01) return false;
            return dist < range * 0.6;
        })
        .filter(p => {
            let time = df.getTimeForMove(p.locationId, to.locationId);
            return time < MAX_WAIT_TIME_FOR_COLLECT_ENERGY;
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

    if (showSign) {
        content = '[CO] ' + candidates.length + ' candidate(s)';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
        showSourceCandidatesNow = candidates;
        showSourcesNow = [];
    }

    let maxArrivals = 6 - getArrivalsToPlanet(to);
    maxArrivals = Math.max(0, maxArrivals);
    maxArrivals = Math.min(maxArrivals, candidates.length);

    if (showSign) {
        content = '[CO] max arrivals: ' + maxArrivals;
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
    }

    let energyNeedSum = to.energyCap * 0.85 - to.energy - getMyEnergyMoveToPlanet(to);
    energyNeedSum = Math.ceil(energyNeedSum);
    energyNeedSum = Math.max(energyNeedSum, 0);

    let silverNeedSum = 0;

    if (isPlanet(to) || isSpacetimeRip(to)) {
        silverNeedSum = to.silverCap - to.silver - getSilverMoveToPlanet(to);
    } else silverNeedSum = 0;

    silverNeedSum = Math.ceil(silverNeedSum);
    silverNeedSum = Math.max(silverNeedSum, 0);

    if (showSign) {
        itemInfo = normalInfo('[CO] energyNeedSum:' + energyNeedSum);
        addToLog(itemInfo, setInfo);
        itemInfo = normalInfo('[CO] silverNeedSum:' + silverNeedSum);
        addToLog(itemInfo, setInfo);
    }

    let energyGet = 0;
    let silverGet = 0;
    let cnt = 0;

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
        let silverSend = silver;
        energyGet += energyLanding;
        silverGet += silverSend;
        if (showSign) {
            content = '[CO] [' + getPlanetName(from) + '] source planet';
            onClick = () => center(from);
            itemInfo = colorInfoWithFunc(content, colorForEnergySourcePlanets, onClick);
            addToLog(itemInfo, setInfo);
            content = '[CO] [' + getPlanetName(to) + '] target planet';
            onClick = () => center(to);
            itemInfo = colorInfoWithFunc(content, colorForEnergyTargetPlanets, onClick);
            addToLog(itemInfo, setInfo);
            content = '[CO] to will get ' + energyLanding + ' energy and ' + silverSend + ' silver';
            itemInfo = normalInfo(content);
            addToLog(itemInfo, setInfo);
            showSourcesNow.push(from);
            showSources.push(from);
        }

        if (toChain) {
            
            try {
                await df.move(from.locationId, to.locationId, energySend, silverSend);
            } catch (e) {
                content = '[CO] move revert';
                itemInfo = colorInfo(content, colorForError);
                addToLog(itemInfo, setInfo);
            }

            if(cnt%3===2) await waitForMoveOnchain(setInfo, '[CO] ');
            cnt++;

        }
    }
    if (showSign) {
        content = '[CO] [' + getPlanetName(to) + '] center energy and silver';
        onClick = () => center(to);
        itemInfo = colorInfoWithFunc(content, colorForEnergyTargetPlanets, onClick);
        addToLog(itemInfo, setInfo);

        content = '[CO] energy get sum:' + energyGet + '; silver get sum:' + silverGet;
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        let percent = toChain ? getTrueEnergyPercent(to) : getTrueEnergyPercent(to) + energyGet / to.energyCap * 100;
        content = '[CO] energy percent:' + percent + '%';
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);
    }

    if (toChain === false) return energyGet;

    if (toChain && waitSign) await waitForMoveOnchain(setInfo, '[CO] ');
    return 0;
}

export async function sectionCollect(setInfo, chooseTo = undefined, chooseFroms = [], maxToNumber = 3) {
    beginSection('[CO] === collect begin ===', setInfo);
    drawSign = true;
    initShow();
    let content, onClick, itemInfo;
    let targetPlanets = Array.from(df.getMyPlanets())
        .filter(targetFilter)
        .sort((a, b) => {
            let aScore = 0;
            if (canCapture(a,false)) aScore += 10000;
            let bScore = 0;
            if (canCapture(b,false)) bScore += 10000;
            if (aScore !== bScore) return bScore - aScore;
            else return b.planetLevel - a.planetLevel;
        });

    if (chooseTo !== undefined) {
        targetPlanets = [];
        targetPlanets.push(chooseTo);
    }

    content = '[CO] ' + targetPlanets.length + ' planet(s) need energy';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    content = '[CO] max to number : ' + maxToNumber;
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    let preSourceCandidates = Array.from(df.getMyPlanets())
        .filter(sourceFilter)
        .filter(p => targetPlanets.includes(p) === false);

    if (chooseFroms.length !== 0) {
        preSourceCandidates = chooseFroms;
    }

    content = '[CO] ' + preSourceCandidates.length + ' pre source candidate(s)';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    let cnt = 0;
    for (let i = 0; i < targetPlanets.length; i++) {
        let to = targetPlanets[i];
        to = df.getPlanetWithId(to.locationId);
        let preCalEnergyGet = await opCollect(setInfo, to, preSourceCandidates, false, false, false);
        if (preCalEnergyGet === 0) continue;

        content = '[CO] [' + getPlanetName(to) + '] target planet [' + cnt + ']';
        onClick = () => center(to);
        itemInfo = pinkInfoWithFunc(content, onClick);
        addToLog(itemInfo, setInfo);

        await opCollect(setInfo, to, preSourceCandidates, true, true, true);
        cnt++;
        if (cnt >= maxToNumber) break;
    }

    endSection('[CO] === collect finish ===', setInfo);
    await sleep(1000);
    drawSign = false;
}