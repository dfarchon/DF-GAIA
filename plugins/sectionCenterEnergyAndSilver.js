
import { drawRound } from "./display";
import { beginSection, center, endSection, getPlanetName, sleep } from "./logicForBasic";
import { getArrivalsToPlanet, getEnergyCanSend, getOtherEnergyMoveToPlanet, getTrueEnergyPercent, getMyEnergyMoveToPlanet } from "./logicForMoveEnergy";
import { calRange, destroyedFilter, getEnergyPercent, isPlanet, isQuasar, isSpacetimeRip, radiusFilter } from "./logicForPlanetState";
import { addToLog, colorInfo, colorInfoWithFunc, greenInfo, normalInfo } from './infoUtils';
import { MAX_WAIT_TIME_FOR_CENTER_ENERGY } from './cfgForBasic';
import { getSilverCanSend, getSilverMoveToPlanet } from "./logicForMoveSilver";
import { waitForMoveOnchain } from "./logicForMove";
import { isNoOwner, isOther } from "./logicForAccount";
import { getJunkEnabled, getMyJunkBudget } from "./logicForJunk";
import { sectionAbandon } from "./sectionAbandon";
import { colorForInfo, ENERGY_TARGET_PLANETS, ENERGY_SOURCE_PLANETS, colorForWarn,colorForError } from './cfgForColor';
import { canCapture } from "./logicForInvadeAndCapture";
import { artifactFilter } from "./logicForArtifactState";




let drawSign = true;

let colorForEnergySourcePlanets = ENERGY_SOURCE_PLANETS;
let colorForEnergyTargetPlanets = ENERGY_TARGET_PLANETS;


let showTargets = [];
let showSources = [];

let showTargetNow = undefined;
let showSourcesNow = [];
let showSourceCandidatesNow = [];



export function sectionCenterEnergyAndSilverDraw(ctx) {
    if (drawSign === false) return;

    if (showTargetNow !== undefined)
        drawRound(ctx, showTargetNow, colorForEnergyTargetPlanets, 10, 1);
    showSourcesNow.forEach(p => drawRound(ctx, p, colorForEnergySourcePlanets, 5, 1));
    showSourceCandidatesNow.forEach(p => drawRound(ctx, p, colorForEnergySourcePlanets, 3, 0.7));

    showTargets.forEach(p => drawRound(ctx, p, colorForEnergyTargetPlanets, 5, 1));
    showSources.forEach(p => drawRound(ctx, p, colorForEnergySourcePlanets, 3, 1));

}

function showInit() {
    showTargets = [];
    showSources = [];
    showTargetNow = undefined;
    showSourcesNow = [];
    showSourceCandidatesNow = [];
}


function targetFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        planet.planetLevel >= 4 &&
        isQuasar(planet) === false &&
        getTrueEnergyPercent(planet) < 80;
}

function sourceFilter(planet) {
    return destroyedFilter(planet) &&
        artifactFilter(planet) && 
        radiusFilter(planet) &&
        planet.planetLevel >= 1 &&
        getEnergyPercent(planet) >= 60 &&
        getOtherEnergyMoveToPlanet(planet) === 0 &&
        canCapture(planet, false) === false;
}



export async function selectedToCenterEnergyAndSilver(setInfo,mode) {
    let p = ui.getSelectedPlanet();
    let content, itemInfo;
    if (p === undefined) {
        content = '[CE&S] [WARN] no select planet';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
        return;
    }
    await sectionCenterEnergyAndSilver(setInfo,p,1,mode);
}


// mode === 1 sorted mainly by energy landing 
// mode === 2 sorted mainly by time 
export async function sectionCenterEnergyAndSilver(setInfo, targetPlanet = undefined, maxTargetNumber = 6,mode =1) {

    beginSection('[CE&S] === center energy & silver begin ===', setInfo);
    if(mode === 1){
        beginSection('[CE&S] sorted mainly by energyLanding',setInfo);
    }else {
        beginSection('[CE&S] sorted mainly by time',setInfo);

    }

    drawSign = true;
    showInit();
    let content, onClick, itemInfo;
  

    content = '[CE&S] NOTICE: not consider the energy growth';
    itemInfo = greenInfo(content);
    addToLog(itemInfo, setInfo);

    let targetPlanets = Array.from(df.getMyPlanets())
        .filter(targetFilter)
        .sort((a, b) => b.planetLevel - a.planetLevel);


    if (targetPlanet !== undefined) {
        targetPlanets = [];
        targetPlanets.push(targetPlanet);
    }

    content = '[CE&S] ' + targetPlanets.length + ' planet(s) need energy';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    targetPlanets = targetPlanets.slice(0, maxTargetNumber);

    content = '[CE&S] ' + targetPlanets.length + ' planet(s) can get energy';
    itemInfo = greenInfo(content);
    addToLog(itemInfo, setInfo);

    let sourceCandidates = Array.from(df.getMyPlanets())
        .filter(sourceFilter);

    content = '[CE&S] ' + sourceCandidates.length + ' source candidate(s)';
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
            content = '[CE&S] [WARN] junk is not enough';
            continue;
        }


        showTargetNow = to;
        showTargets.push(to);

        content = '[CE&S] [' + getPlanetName(to) + '] center energy and silver to [' + i + ']';
        onClick = () => center(to);
        itemInfo = colorInfoWithFunc(content, colorForInfo, onClick);
        addToLog(itemInfo, setInfo);

        let candidates = Array.from(df.getMyPlanets())
            .filter(sourceFilter)

            .filter(p => targetPlanets.includes(p) === false)
            .filter(p => {
                if (isNoOwner(to)) return p.planetLevel <= to.planetLevel + 1;
                else if (isOther(to)) return p.planetLevel <= to.planetLevel + 1;
                else return p.planetLevel <= to.planetLevel;
            })
            .filter(p => {
                let dist = df.getDist(p.locationId, to.locationId);
                let range = calRange(p);
                let energyCanSend = getEnergyCanSend(p);
                let energyArriving = Math.ceil(df.getEnergyArrivingForMove(p.locationId, to.locationId, dist, energyCanSend));
                if (energyArriving < to.energyCap * 0.01) return false;
                return dist < range * 0.5;
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

                let aEnergy = getEnergyCanSend(a);
                let bEnergy = getEnergyCanSend(b);

                let aEnergyLanding = df.getEnergyArrivingForMove(a.locationId, to.locationId, aDist, aEnergy);
                let bEnergyLanding = df.getEnergyArrivingForMove(b.locationId, to.locationId, bDist, bEnergy);

                if(mode === 1){
                    if (aEnergyLanding !== b.energyLanding) return bEnergyLanding - aEnergyLanding;
                    else return aTime - bTime;
                }else if(mode === 2){
                    if(aTime!==bTime) return aTime - bTime;
                    else return bEnergyLanding - aEnergyLanding;
                }
              
            });


        content = '[CE&S] ' + candidates.length + ' candidate(s)';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);


        showSourceCandidatesNow = candidates;
        showSourcesNow = [];

        // showSources
        let maxArrivals = 6 - getArrivalsToPlanet(to);
        maxArrivals = Math.max(0, maxArrivals);

        maxArrivals = Math.min(maxArrivals, candidates.length);

        content = '[CE&S] ' + 'max arrivals: ' + maxArrivals;
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);



        let energyNeedSum = 0;

        if (isNoOwner(to)) {
            energyNeedSum += to.energy * (to.defense * 0.01) + to.energyCap * 0.8;
            energyNeedSum -= getMyEnergyMoveToPlanet(to);
            energyNeedSum = Math.ceil(energyNeedSum);
            energyNeedSum = Math.max(energyNeedSum, 0);


        } else if (isOther(to)) {
            energyNeedSum += to.energy * (to.defense * 0.01) + to.energyCap ;
            energyNeedSum -= getMyEnergyMoveToPlanet(to);
            energyNeedSum = Math.ceil(energyNeedSum);
            energyNeedSum = Math.max(energyNeedSum, 0);

        } else {
            energyNeedSum += to.energyCap * 0.8;
            energyNeedSum -= to.energy;
            energyNeedSum -= getMyEnergyMoveToPlanet(to);
            energyNeedSum = Math.ceil(energyNeedSum);
            energyNeedSum = Math.max(energyNeedSum, 0);
        }



        let silverNeedSum = 0;
        if (isPlanet(to)) silverNeedSum = Math.ceil(to.silverCap - to.silver - getSilverMoveToPlanet(to));
        else if (isSpacetimeRip(to)) silverNeedSum = Math.ceil(to.silverCap - to.silver - getSilverMoveToPlanet(to));
        else silverNeedSum = 0;

        itemInfo = normalInfo('[CE&S] ' + 'energyNeedSum:' + energyNeedSum);
        addToLog(itemInfo, setInfo);
        itemInfo = normalInfo('[CE&S] ' + 'silverNeedSum:' + silverNeedSum);
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

            content = '[CE&S] ['+getPlanetName(from)+'] source planet';
            onClick = () => center(from);
            itemInfo = colorInfoWithFunc(content, colorForEnergySourcePlanets, onClick);
            addToLog(itemInfo, setInfo);
            content = '[CE&S] ['+getPlanetName(to)+'] target planet';
            onClick = () => center(to);
            itemInfo = colorInfoWithFunc(content, colorForEnergyTargetPlanets, onClick);
            addToLog(itemInfo, setInfo);
            content =  '[CE&S] '+'to will get ' + energyLanding + ' energy + ' + silverSend + ' silver';
            itemInfo = normalInfo(content);
            addToLog(itemInfo, setInfo);

            showSourcesNow.push(from);
            showSources.push(from);

            try {
            
                await df.move(from.locationId, to.locationId, energySend, silverSend);

            } catch (e) {
                content =  '[CE&S] '+'[ERROR] move revert';
                itemInfo = colorInfo(content, colorForError);
                addToLog(itemInfo, setInfo);
            }
        }




        content = '[CE&S] ['+getPlanetName(to)+'] target planet [' + i + ']';
        onClick = () => center(to);
        itemInfo = colorInfoWithFunc(content, colorForInfo, onClick);
        addToLog(itemInfo, setInfo);
        let energyWillGet = getMyEnergyMoveToPlanet(to);
        content = '[CE&S] '+energyWillGet + ' energy will get';

        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);

        let toEnergyAfterMove = 0;
        if (isNoOwner(to) || isOther(to)) {
            toEnergyAfterMove -= to.energy * (to.defense * 0.01);
            toEnergyAfterMove += energyGet;
        } else {
            toEnergyAfterMove += to.energy;
            toEnergyAfterMove += energyGet;
        }

    

        if (toEnergyAfterMove > 0) {
            content ='[CE&S] '+'to energy after move:' + Math.floor(toEnergyAfterMove);
            itemInfo = normalInfo(content);
            addToLog(itemInfo, setInfo);
            let percent = Math.floor(toEnergyAfterMove / to.energyCap * 10000);
            percent = 0.01*percent;
            content = '[CE&S] '+' energy percent after is: ' + percent + ' %';
            itemInfo = normalInfo(content);
            addToLog(itemInfo, setInfo);
        }else {

            let energyLeft = Math.ceil(-toEnergyAfterMove/(to.defense*0.01));
            content = '[CE&S] the planet left '+energyLeft+' energy';
            itemInfo = colorInfo(content,colorForInfo);
            addToLog(itemInfo,setInfo);

            content = '[CE&S] [WARN] '+'you can\'t get this planet';
            itemInfo = colorInfo(content,colorForWarn);
            addToLog(itemInfo,setInfo);
        }

        content = '[CE&S] '+ 'sum silver get ' + silverGet;
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        await waitForMoveOnchain(setInfo,'[CE&S] ');

    }


    endSection('[CE&S] '+'=== center energy & silver end ===', setInfo,'[CE&S] ');
    await sleep(1000);
    drawSign = false;
}
