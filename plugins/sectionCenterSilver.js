
import { MOVE_SILVER_SOURCE, MOVE_SILVER_TO_PLANETS, MOVE_SILVER_TO_BLOCKHOLES, MOVE_SILVER_TO_OTHERS } from './cfgForColor';
import { getCaptureZonesEnabled, canCapture } from "./logicForInvadeAndCapture";
import { drawRound } from "./display";
import { beginSection, center, endSection, getPlanetName, sleep } from "./logicForBasic";
import { getArrivalsToPlanet, getEnergyCanSend, getOtherEnergyMoveToPlanet, getTrueEnergyPercent, getMyEnergyMoveToPlanet } from "./logicForMoveEnergy";
import { calRange, destroyedFilter, getEnergyPercent, isAsteroidField, isPlanet, isQuasar, isSpacetimeRip, radiusFilter } from "./logicForPlanetState";
import { addToLog, colorInfo, colorInfoWithFunc, greenInfo, normalInfo } from './infoUtils';
import { MAX_WAIT_TIME_FOR_CENTER_ENERGY } from './cfgForBasic';
import { getNeedSilver,getSilverCanSend, getSilverMoveToPlanet,getTrueSilverInTheFuture  } from "./logicForMoveSilver";
import { waitForMoveOnchain } from "./logicForMove";
import { isNoOwner, isOther } from "./logicForAccount";
import { getJunkEnabled, getMyJunkBudget } from "./logicForJunk";
import { sectionAbandon } from "./sectionAbandon";
import { colorForInfo} from './cfgForColor';
import { artifactFilter } from './logicForArtifactState';





let drawSign = true;

function getSourcePlanetColor(p) {
    return MOVE_SILVER_SOURCE;
}

function getTargetPlanetColor(p) {
    if (isPlanet(p)) return MOVE_SILVER_TO_PLANETS;
    else if (isSpacetimeRip(p)) return MOVE_SILVER_TO_BLOCKHOLES;
    else return MOVE_SILVER_TO_OTHERS;
}

let showTargets = [];
let showSources = [];

let showTargetNow = undefined;
let showSourcesNow = [];
let showSourceCandidatesNow = [];


export function sectionCenterSilverDraw(ctx) {
    if (drawSign === false) return;

    if (showTargetNow !== undefined)
        drawRound(ctx, showTargetNow, getTargetPlanetColor(showTargetNow), 10, 1);
    showSourcesNow.forEach(p => drawRound(ctx, p, getSourcePlanetColor(p), 5, 1));
    showSourceCandidatesNow.forEach(p => drawRound(ctx, p, getSourcePlanetColor(p), 3, 0.7));

    showTargets.forEach(p => drawRound(ctx, p, getTargetPlanetColor(p), 5, 1));
    showSources.forEach(p => drawRound(ctx, p, getSourcePlanetColor(p), 3, 1));
}


function showInit() {
    showTargets = [];
    showSources = [];
    showTargetNow = undefined;
    showSourcesNow = [];
    showSourceCandidatesNow = [];
}


let targetMinLevel = 4;
let targetMaxLevel = 9;
let targetSilverMaxPercent = 0.6;

export function setTargetState(l, r, maxPercent = 0.6) {
    targetMinLevel = l;
    targetMaxLevel = r;
    targetSilverMaxPercent = maxPercent;
}

function targetFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        planet.planetLevel >= targetMinLevel &&
        planet.planetLevel <= targetMaxLevel &&
        isQuasar(planet) === false &&
        getTrueSilverInTheFuture(planet) <= planet.silverCap * targetSilverMaxPercent;
}

let sourceMinLevel = 1;
let sourceMaxLevel = 9;

export function setSourceState(l, r) {
    sourceMinLevel = l;
    sourceMaxLevel = r;
}

function sourceFilter(planet) {
    let captureZonesEnabled = getCaptureZonesEnabled();
    return destroyedFilter(planet) &&
        artifactFilter(planet) &&
        radiusFilter(planet) &&
        planet.planetLevel >= sourceMinLevel &&
        planet.planetLevel <= sourceMaxLevel &&
        getEnergyPercent(planet) >= 15 &&
        (getSilverCanSend(planet) >= planet.silverCap * 0.4 || getSilverCanSend(planet) >= 1000)&&
        getOtherEnergyMoveToPlanet(planet) === 0 &&
        (captureZonesEnabled? true:canCapture(planet, false) === false);
}



export async function selectedToCenterSilver(setInfo) {
    let p = ui.getSelectedPlanet();
    let content, itemInfo;
    if (p === undefined) {
        content = '[CS] [WARN] no select planet';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
        return;
    }

    await sectionCenterSilver(setInfo,p);
    
}


export async function sectionCenterSilver(setInfo, targetPlanet = undefined, maxTargetNumber = 3) {

    beginSection('[CS] === center silver begin ===',setInfo);
    drawSign = true;
    showInit();
    let content, onClick, itemInfo;

    content = '[CS] NOTICE: not consider the energy growth';
    itemInfo = greenInfo(content);
    addToLog(itemInfo, setInfo);

    let targetPlanets = Array.from(df.getMyPlanets())
        .filter(targetFilter)
        .filter(p=>isPlanet(p)||isSpacetimeRip(p))
        .sort((a, b) => b.planetLevel - a.planetLevel);

    if (targetPlanet !== undefined) {
        targetPlanets = [];
        targetPlanets.push(targetPlanet);
    }

    content = '[CS] ' + targetPlanets.length + ' planet(s) need silver';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    targetPlanets = targetPlanets.slice(0, maxTargetNumber);

    content = '[CS] ' + targetPlanets.length + ' planet(s) can get silver';
    itemInfo = greenInfo(content);
    addToLog(itemInfo, setInfo);

    let sourceCandidates = Array.from(df.getMyPlanets())
        .filter(sourceFilter);

    content = '[CS] ' + sourceCandidates.length + ' source candidate(s)';
    itemInfo = greenInfo(content);
    addToLog(itemInfo, setInfo);


    let cnt = 0;
    for (let i = 0; i < targetPlanets.length; i++) {
        let to = targetPlanets[i];
        to = df.getPlanetWithId(to.locationId);

        if (isNoOwner(to)) {
            let junkEnabled = getJunkEnabled();
            let planetJunk = to.spaceJunk;
            let junkBudget = getMyJunkBudget();
            if (junkEnabled && junkBudget < planetJunk)
                await sectionAbandon(setInfo, planetJunk, 4, 0.8, []);
        }

        let junkEnabled = getJunkEnabled();
        let planetJunk = to.spaceJunk;
        let junkBudget = getMyJunkBudget();
        if (junkEnabled && junkBudget < planetJunk) {
            content = '[CS] [WARN] junk is not enough';
            continue;
        }


        showTargetNow = to;
        showTargets.push(to);

        content = '[CS] [' + getPlanetName(to) + '] center silver to [' + i + ']';
        onClick = () => center(to);
        itemInfo = colorInfoWithFunc(content, colorForInfo, onClick);
        addToLog(itemInfo, setInfo);

        let candidates = Array.from(df.getMyPlanets())
            .filter(sourceFilter)
            .filter(p => targetPlanets.includes(p) === false)
            // .filter(p => {
            //     if (isNoOwner(to)) return p.planetLevel <= to.planetLevel ;
            //     else if (isOther(to)) return p.planetLevel <= to.planetLevel ;
            //     else return p.planetLevel <= to.planetLevel;
            // })
            .filter(p=>{
                if(p.planetLevel<=3) return true;
                else return isAsteroidField(p);
            })
            .filter(p => {
                let dist = df.getDist(p.locationId, to.locationId);
                let range = calRange(p);
                let silverCanSend = getSilverCanSend(p);
                let silverArriving = silverCanSend;

                if (silverArriving <to.silverCap * 0.01) return false;
                if(p.planetLevel<=3) return dist<range;
                else if(p.planetLevel<=4) return dist<range*0.75;
                else return dist < range * 0.6;
            })
            .filter(p => {
                let time = df.getTimeForMove(p.locationId, to.locationId);
                return time < MAX_WAIT_TIME_FOR_CENTER_ENERGY;
            })
            .sort((a, b) => {
                let aDist = df.getDist(a.locationId, to.locationId);
                let bDist = df.getDist(b.locationId, to.locationId);
                let aTime = df.getTimeForMove(a.locationId, to.locationId);
                let bTime = df.getTimeForMove(b.locationId, to.locationId);
            
                let aSilver = getSilverCanSend(a);
                let bSilver = getSilverCanSend(b);
             //   if(aSilver !==bSilver) return bSilver - aSilver;
                return aTime - bTime;
            });
    

        content = '[CS] ' + candidates.length + ' candidate(s)';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        showSourceCandidatesNow = candidates;
        showSourcesNow = [];

        // showSources
        let maxArrivals = 6 - getArrivalsToPlanet(to);
        maxArrivals = Math.max(0, maxArrivals);

        maxArrivals = Math.min(maxArrivals, candidates.length);

        content = '[CS] ' + 'max arrivals: ' + maxArrivals;
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);


        let silverNeedSum = getNeedSilver(to);
        itemInfo = normalInfo('[CS] ' + 'silverNeedSum:' + silverNeedSum);
        addToLog(itemInfo, setInfo);

        let energyGet = 0;
        let silverGet = 0;

        for (let j = 0; j < maxArrivals; j++) {
            let from = candidates[j];
            from = df.getPlanetWithId(from.locationId);
            let dist = df.getDist(from.locationId, to.locationId);
            let energy = getEnergyCanSend(from);
            let silver = getSilverCanSend(from);
            // console.log('-------------------');
            // console.log(silver);
            // console.log(from.silver);
            // console.log('----------------------');
            let energyLanding = 2; //Math.floor(df.getEnergyArrivingForMove(from.locationId, to.locationId, dist, energy));
          //  const energyNeed = Math.max(energyNeedSum - energyGet, 0);
            const silverNeed = Math.max(silverNeedSum - silverGet, 0);

            if (silverNeed === 0) break;
            silver = Math.min(silver, silverNeed);

            let energySend = Math.ceil(df.getEnergyNeededForMove(from.locationId, to.locationId, energyLanding));
            if(energySend > energy) continue;

            let silverSend = silver;

        

            silverGet += silverSend;

            content = '[CS] [' + getPlanetName(from) + '] source planet';
            onClick = () => center(from);
            itemInfo = colorInfoWithFunc(content, getSourcePlanetColor(from), onClick);
            addToLog(itemInfo, setInfo);
            content = '[CS] [' + getPlanetName(to) + '] target planet';
            onClick = () => center(to);
            itemInfo = colorInfoWithFunc(content, getTargetPlanetColor(to), onClick);
            addToLog(itemInfo, setInfo);
            content = '[CS] ' + 'to will get ' + silverSend + ' silver';
            itemInfo = normalInfo(content);
            addToLog(itemInfo, setInfo);

            showSourcesNow.push(from);
            showSources.push(from);
            cnt++;
           
            try {

                await df.move(from.locationId, to.locationId, energySend, silverSend);

            } catch (e) {
                content = '[CS] ' + '[ERROR] move revert';
                itemInfo = colorInfo(content, colorForError);
                addToLog(itemInfo, setInfo);
            }


            
        }



        content = '[CS] [' + getPlanetName(to) + '] target planet [' + i + ']';
        onClick = () => center(to);
        itemInfo = colorInfoWithFunc(content, colorForInfo, onClick);
        addToLog(itemInfo, setInfo);
        let silverWillGet = getSilverMoveToPlanet(to);
        
        content = '[CS] ' + silverWillGet + ' silver will get';
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);


        content = '[CS] ' + 'sum silver get ' + silverGet;
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        await waitForMoveOnchain(setInfo, '[CS] ');

    }


    endSection('[CE&S] ' + '=== center silver end ===', setInfo, '[CS] ');
    await sleep(1000);
    drawSign = false;
}
