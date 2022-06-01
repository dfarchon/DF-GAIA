import { artifactFilter,getArtifactsInPlanet, getArtifactAndSpaceshipAmountsInFuture, getShipGear, hasArtifactsCanActivate, whereIsShipGear,canActivate, isNormalArtifact } from "./logicForArtifactState";
import { isMine, isNoOwner, isOther } from './logicForAccount';
import { destroyedFilter, inViewport, isFoundry, isSpeedBonus, radiusFilter } from "./logicForPlanetState";
import { isFindable, isProspectable } from "./logicForArtifactOpen";
import { getArrivalsToPlanet, getMyEnergyMoveToPlanet, judgeAttack, judgeRange } from './logicForMoveEnergy';
import { drawRound } from './display';
import { addToLog, pinkInfo, colorInfoWithFunc, colorInfo } from "./infoUtils";
import { center, sleep, beginSection, endSection, getPlanetName } from "./logicForBasic";
import { colorForError, colorForWarn,colorForInfo } from "./cfgForColor";
import { getTimeForMoveInString, waitForMoveOnchain } from "./logicForMove";
import { getJunkEnabled, getMyJunkBudget } from "./logicForJunk";

import { sectionAbandon } from "./sectionAbandon";

const GEAR_NORMAL = '#CCFFFF';
const GEAR_OPEN_ARTIFACT = '#FF6666';
const PLANET_ATTACK_FOUNDRY = '#CCCCFF';
const PLANET_WITH_SPEED_BONUS = '#FF9933';
const CANDIDATE_FOUNDRY = '#99CC00';

let colorOfPlanetWithGear = GEAR_NORMAL;
let colorOfFrom = GEAR_NORMAL;
let colorOfTo = GEAR_NORMAL;
let colorOfPlanetAttackFoundry = PLANET_ATTACK_FOUNDRY;
let colorOfPlanetWithSpeedBonus = PLANET_WITH_SPEED_BONUS;
let colorOfCandidateFoundrys = CANDIDATE_FOUNDRY;


let showGear = [];
let showGearFrom = [];
let showGearTo = [];
let showPlanetAttackFoundry = [];
let showCandidateFoundrys = [];
let showAllSpeedBonusPlanets = [];
let showAimFoundry = [];
let showAimSpeedBnousPlanet = [];

let autoGearDrawSign = true;
export function sectionAutoGearDraw(ctx) {
    if (autoGearDrawSign === false) return;
    showGear.forEach(p => drawRound(ctx, p, colorOfPlanetWithGear, 3, 1));
    showGearFrom.forEach(p => drawRound(ctx, p, colorOfFrom, 2, 0.7));
    showGearTo.forEach(p => drawRound(ctx, p, colorOfTo, 3, 1));
    showPlanetAttackFoundry.forEach(p => drawRound(ctx, p, colorOfPlanetAttackFoundry, 3, 1));
    showCandidateFoundrys.forEach(p => drawRound(ctx, p, colorOfCandidateFoundrys, 3, 0.5));
    showAllSpeedBonusPlanets.forEach(p => drawRound(ctx, p, colorOfPlanetWithSpeedBonus, 3, 0.5));
    showAimSpeedBnousPlanet.forEach(p => drawRound(ctx, p, colorOfPlanetWithSpeedBonus, 5, 1));
    showAimFoundry.forEach(p => drawRound(ctx, p, colorOfCandidateFoundrys, 5, 1));
}


let showAllSppedBonusPlanetsInViewport = [];
let showCandidatFoundrysInViewport = [];

export function showCandidates() {
    let candidateFoundrys = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(artifactFilter)
        .filter(inViewport)
        .filter(isFoundry)
        .filter(isProspectable)
        .filter(p => getArrivalsToPlanet(p) < 6)
        .filter(p => isMine(p) || isNoOwner(p));

    let allSpeedBonusPlanets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(inViewport)
        .filter(artifactFilter)
        .filter(p => p.planetLevel >= 1)
        .filter(isSpeedBonus)
        .filter(p => getArrivalsToPlanet(p) < 6);

    if (showCandidatFoundrysInViewport.length === 0) {
        showCandidatFoundrysInViewport = candidateFoundrys;
    } else showCandidatFoundrysInViewport = [];

    if (showAllSppedBonusPlanetsInViewport.length === 0) {
        showAllSppedBonusPlanetsInViewport = allSpeedBonusPlanets;
    } else showAllSppedBonusPlanetsInViewport = [];

}


export function sectionAutoGearInViewportDraw(ctx) {
    showAllSppedBonusPlanetsInViewport.forEach(p => drawRound(ctx, p, colorOfPlanetWithSpeedBonus, 3, 0.8));
    showCandidatFoundrysInViewport.forEach(p => drawRound(ctx, p, colorOfCandidateFoundrys, 3, 0.8));
}


function isFoundryWithArtifact(p) {
    if (p === undefined) return false;
    return isFoundry(p) && isProspectable(p);
}
function judgeDoubleGear() {
    let gear = getShipGear();

    let cnt = 0;
    if (gear.onVoyageId !== undefined) {
        let time = Date.now();
        let timeStamp = Math.floor(time * 0.001);

        let voyages = Array.from(df.getAllVoyages())
            .filter(tx => tx.eventId === gear.onVoyageId)
            .filter(tx => tx.arrivalTime > timeStamp);
        cnt += voyages.length;
    }

    if (gear.onPlanetId !== undefined) {
        let p = df.getPlanetWithId(gear.onPlanetId);
        let artifactIds = p.heldArtifactIds;
        if (artifactIds.includes(gear.id) === true) cnt++;
    }
    return cnt >= 2;
}

//gear 运送途中  gearFrom gearTo
// -1 未知情况            
// 1.prospect planet
// 2.find artifact
// 3. 打foundry
// 4.送到me or no owner foundry
// 5.送到2倍星

function jundgeCondition(p) {
    if (p === undefined) return -1;
    p = df.getPlanetWithId(p.locationId);
    if (judgeDoubleGear()) return -2;
    else if (isMine(p) && isFoundry(p) && isProspectable(p)) return 1;
    else if (isMine(p) && isFoundry(p) && isFindable(p)) return 2;
    else if (isNoOwner(p) && isFoundry(p) && isProspectable(p)) return 3;
    else if (isSpeedBonus(p) && isFoundryWithArtifact(p) === false) return 4;
    else if (isSpeedBonus(p) && isFoundryWithArtifact(p) && isOther(p)) return 4;
    else if (isSpeedBonus(p) === false && isFoundryWithArtifact(p) === false) return 5;
    else if (isSpeedBonus(p) === false && isFoundryWithArtifact(p) && isOther(p)) return 5;
    else return -1;
}

export async function refreshPlanet(p, setInfo) {
    let content ='[RP] refresh planet';
    let itemInfo =colorInfo(content,colorForInfo);
    addToLog(itemInfo,setInfo);
    try {
        await df.hardRefreshPlanet(p.locationId);
        await df.softRefreshPlanet(p.locationId);
    } catch (e) {
        let content = '[RP] [ERROR] refresh revert';
        let itemInfo = colorInfo(content, colorForError);
        addToLog(itemInfo, setInfo);
        console.log(e);
    }
}

async function autoGearMove(
    from,
    to,
    fromColor,
    toColor,
    isSpaceship = false,
    artifactId = -1,
    maxTime = 30 * 60,
    toEnergyCapPercent = 0.2,
    setInfo
) {
    let content,onClick,itemInfo;

    from = df.getPlanetWithId(from.locationId);
    to = df.getPlanetWithId(to.locationId);

    if (from.energyGrowth === 0)
        await refreshPlanet(from,setInfo);

    let time = df.getTimeForMove(from.locationId, to.locationId);
    let timeStr = getTimeForMoveInString(from.locationId, to.locationId);

    itemInfo = pinkInfo(timeStr);
    if (time > maxTime) {
        content = 'time > ' + maxTime + 'second(s)';
        itemInfo = colorInfo(content, colorForWarn);
        addToLog(itemInfo, setInfo);
        return;
    }

    if (getArrivalsToPlanet(to) > 6) {
        content = 'arrivals > 6';
        itemInfo = colorInfo(content, colorForWarn);
        addToLog(itemInfo, setInfo);
        return;
    }

    let junkEnabled = getJunkEnabled();
    let myJunkBudget = getMyJunkBudget();
    let needJunk = isMine(to) ? 0 : to.spaceJunk;

    if (isSpaceship === false && needJunk !== 0 && junkEnabled) {
        if (myJunkBudget < needJunk) {
            content = 'junk is not enough :-C';
            itemInfo = colorInfo(content, colorForWarn);
            addToLog(itemInfo, setInfo);
            await sectionAbandon(setInfo, needJunk);
            
        }

        if(myJunkBudget<needJunk) {

            content = 'after abandon junk still don\'t enough';
            itemInfo = colorInfo(content,colorForError);
            addToLog(itemInfo,setInfo);
            return;
        }
    }




    let energyArriving = 0;
    if (isMine(from) && isMine(to)) energyArriving = 2;
    else energyArriving = to.energyCap * toEnergyCapPercent + to.energy * (to.defense * 0.01);
    energyArriving = Math.ceil(energyArriving);

    const energyNeeded = Math.ceil(df.getEnergyNeededForMove(from.locationId, to.locationId, energyArriving));

    if (isSpaceship === false) {
        if (from.energy < energyNeeded) {
            content = 'from planet energy is not enough';
            onClick = () => center(from);
            itemInfo = colorInfoWithFunc(content, colorForWarn, onClick);
            addToLog(itemInfo, setInfo);
            return;
        }
    }

    content = 'from planet ' + getPlanetName(from);
    onClick = () => center(from);
    itemInfo = colorInfoWithFunc(content, fromColor, onClick);
    addToLog(itemInfo, setInfo);

    content = 'to planet ' + getPlanetName(to);
    onClick = () => center(to);
    itemInfo = colorInfoWithFunc(content, toColor, onClick);
    addToLog(itemInfo, setInfo);

    if (isSpaceship === false && artifactId === -1) {
        try {
            if(isOther(to)===false)
            await df.move(from.locationId, to.locationId, energyNeeded, 0);

        } catch (e) {
            content = 'move revert';
            itemInfo = colorInfo(content, colorForWarn);
            addToLog(itemInfo, setInfo);
            console.log(e);
            await sleep(1000);
        }


    } else if (isSpaceship === false && artifactId !== -1) {

        try {
            if(isOther(to)===false)
            await df.move(from.locationId, to.locationId, energyNeeded, 0, artifactId);

        } catch (e) {
            content = 'move revert';
            itemInfo = colorInfo(content, colorForWarn);
            addToLog(itemInfo, setInfo);
            console.log(e);
            await sleep(1000);

        }

    } else {
        let artifact = df.getArtifactWithId(artifactId);
        if (artifact.onPlanetId === from.locationId) {

            try {
                if(isOther(to)===false)
                await df.move(from.locationId, to.locationId, 0, 0, artifactId);
            } catch (e) {
                await refreshPlanet(from,setInfo);
                content = 'move revert';
                itemInfo = colorInfo(content, colorForWarn);
                addToLog(itemInfo, setInfo);

            }
        } else {
            await refreshPlanet(from,setInfo);
            content = 'artifact is not on from planet';
            itemInfo = colorInfo(content, colorForWarn);

        }
    }
    await waitForMoveOnchain(setInfo);
}


let lastPlanetWithGear = undefined;
export async function sectionAutoGear(setInfo) {

    beginSection('== begin Auto Gear ==', setInfo);
    showGear = [];
    showGearFrom = [];
    showGearTo = [];
    showPlanetAttackFoundry = [];
    showCandidateFoundrys = [];
    showAllSpeedBonusPlanets = [];
    showAimFoundry = [];
    showAimSpeedBnousPlanet = [];

    let content, onClick, itemInfo;

    let gear = getShipGear();
    let planetWithGear = whereIsShipGear();





    if (planetWithGear === undefined) {
        let voyage = df.getAllVoyages().filter(v => v.eventId == gear.onVoyageId)[0];
        // console.log(voyage);
        let fromPlanetId = voyage.fromPlanet;
        let toPlanetId = voyage.toPlanet;
        let fromPlanet = df.getPlanetWithId(fromPlanetId);
        let toPlanet = df.getPlanetWithId(toPlanetId);

        showGearFrom.push(fromPlanet);
        showGearTo.push(toPlanet);

        content = 'Gear Is On Voyage';
        itemInfo = colorInfo(content, 'pink');
        addToLog(itemInfo, setInfo);

        content = 'from planet is here';
        onClick = () => center(fromPlanet);
        itemInfo = colorInfoWithFunc(content, colorOfFrom, onClick);
        addToLog(itemInfo, setInfo);

        content = 'to planet is here';
        onClick = () => center(toPlanet);
        itemInfo = colorInfoWithFunc(content, colorOfTo, onClick);
        addToLog(itemInfo, setInfo);
        endSection('== end Auto Gear ==', setInfo);
        await sleep(1000);
        return;
    }

    if (isMine(planetWithGear) &&hasArtifactsCanActivate(planetWithGear)) {

        content = '=== move artifact ===';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);


        let artifacts = getArtifactsInPlanet(planetWithGear);
        artifacts = artifacts.filter(canActivate).filter(isNormalArtifact);

        for (let i = 0; i < artifacts.length; i++) {
            let artifact = artifacts[i];

            let aimPlanets = Array.from(df.getMyPlanets())
                .filter(destroyedFilter)
                .filter(radiusFilter)
                .filter(artifactFilter)
                .filter(p => getArrivalsToPlanet(p) < 6)
                .filter(p => getArtifactAndSpaceshipAmountsInFuture(p) < 5)
                .filter(p => p.planetLevel > planetWithGear.planetLevel)
                .filter(p=>judgeRange(planetWithGear,p,0.5))
                .sort((a, b) => {
                    let aDist = df.getDist(planetWithGear.locationId, a.locationId);
                    let bDist = df.getDist(planetWithGear.locationId, b.locationId);
                    return aDist - bDist;
                });
            if (aimPlanets.length === 0) continue;

            let from = planetWithGear;
            let to = aimPlanets[0];

            await autoGearMove(from, to, 'lightgreen', 'yellow', false, artifact.id, 60*60, 0, setInfo);
        }
        content = '== end move artifact ==';
        itemInfo = colorInfo(content,colorForInfo);
        addToLog(itemInfo,setInfo);

    }

    let state = jundgeCondition(planetWithGear);
    content = 'jundge condition:' + state;
    itemInfo = pinkInfo(content);
    addToLog(itemInfo, setInfo);


    
    // if(lastPlanetWithGear!==undefined && planetWithGear!==undefined && lastPlanetWithGear.locationId===planetWithGear.locationId&&state!==3){
    //     content = 'refresh planet';
    //     itemInfo = colorInfo(content,colorForWarn);
    //     addToLog(itemInfo,setInfo);
    //     await refreshPlanet(planetWithGear);
    // }

    // lastPlanetWithGear = planetWithGear;

    if (state <= -1) {
        content = 'Meet ' + state + ' We Don\'t Know';
        itemInfo = colorInfo(content, colorForWarn);
        addToLog(itemInfo, setInfo);
        await refreshPlanet(planetWithGear, setInfo);
        await sleep(1000);
        return;
    } else if (state === 1) {
        colorOfPlanetWithGear = GEAR_OPEN_ARTIFACT;
        showGear.push(planetWithGear);
        content = 'Open Artifact';
        itemInfo = colorInfo(content, colorOfPlanetWithGear);
        addToLog(itemInfo, setInfo);
        content = 'gear is on this planet';
        onClick = () => center(planetWithGear);
        itemInfo = colorInfoWithFunc(content, colorOfPlanetWithGear, onClick);
        addToLog(itemInfo, setInfo);

        planetWithGear = df.getPlanetWithId(planetWithGear.locationId);

        let artifact = df.getArtifactWithId(gear.id);
        if (artifact.onPlanetId === planetWithGear.locationId) {
            try {
                await df.prospectPlanet(planetWithGear.locationId);
            } catch (e) {
                content = 'prospect planet fail';
                itemInfo = colorInfo(content, colorForWarn);
                addToLog(itemInfo, setInfo);
                await refreshPlanet(planetWithGear,setInfo);
            }
            let prospectTimeCnt = 0;
            while (true) {
                if (prospectTimeCnt >= 40) {
                    content = 'wait time for prospect planet >= 50s';
                    itemInfo = colorInfo(content, colorForWarn);
                    addToLog(itemInfo, setInfo);
                    break;

                }
                planetWithGear = df.getPlanetWithId(planetWithGear.locationId);
                if (isProspectable(planetWithGear) === false) break;
                await sleep(1000);
                prospectTimeCnt++;
            }
            if (prospectTimeCnt < 40) {
                try {
                    await df.findArtifact(planetWithGear.locationId);

                } catch (e) {
                    content = 'find artifact fail';
                    itemInfo = colorInfo(content, colorForWarn);
                    addToLog(itemInfo, setInfo);
                    await refreshPlanet(planetWithGear,setInfo);
                }

                let findTimeCnt = 0;
                while (true) {
                    if (findTimeCnt >= 40) {
                        content = 'wait time for find >=40s';
                        itemInfo = colorInfo(content, colorForWarn);
                        addToLog(itemInfo, setInfo);
                        break;
                    }
                    planetWithGear = df.getPlanetWithId(planetWithGear.locationId);
                    if (isFindable(planetWithGear) === false) break;
                    await sleep(1000);
                    findTimeCnt++;
                }
            }
        } else {
            content = 'gear is not on planetWithGear';
            itemInfo = colorInfo(content, colorForWarn);
            addToLog(itemInfo, setInfo);
            await sleep(1000);
        }
    } else if (state === 2) {

        colorOfPlanetWithGear = GEAR_OPEN_ARTIFACT;
        showGear.push(planetWithGear);
        content = 'Find Artifact';
        itemInfo = colorInfo(content, colorOfPlanetWithGear);
        addToLog(itemInfo, setInfo);
        content = 'gear is on this planet';
        onClick = () => center(planetWithGear);
        itemInfo = colorInfoWithFunc(content, colorOfPlanetWithGear, onClick);
        addToLog(itemInfo, setInfo);

        let artifact = df.getArtifactWithId(gear.id);
        if (artifact.onPlanetId === planetWithGear.locationId) {
            try {
                await df.findArtifact(planetWithGear.locationId);

            } catch (e) {
                content = 'find artifact fail';
                itemInfo = colorInfo(content, colorForWarn);
                addToLog(itemInfo, setInfo);
                await refreshPlanet(planetWithGear,setInfo);
            }

            let findTimeCnt = 0;
            while (true) {
                if (findTimeCnt >= 50) {
                    content = 'wait time for find >=50s';
                    itemInfo = colorInfo(content, colorForWarn);
                    addToLog(itemInfo, setInfo);
                    break;
                }
                planetWithGear = df.getPlanetWithId(planetWithGear.locationId);
                if (isFindable(planetWithGear) === false) break;
                await sleep(1000);
                findTimeCnt++;
            }
        } else {
            content = 'gear is not on planetWithGear';
            itemInfo = colorInfo(content, colorForWarn);
            addToLog(itemInfo, setInfo);
            await sleep(1000);
        }
    }

    else if (state === 3) {

        //  attack foundry
        content = 'condition 3: attack foundry with gear';
        itemInfo =pinkInfo(content);
        addToLog(itemInfo,setInfo);

        colorOfPlanetWithGear = GEAR_NORMAL;
        let to = planetWithGear;

        if(getMyEnergyMoveToPlanet(to)>Math.ceil(to.energy*to.defense*0.01)){
            showGear.push(to);
            content = 'energy is attacking foundry';
            itemInfo = pinkInfo(content);
            addToLog(itemInfo,setInfo);
            await sleep(1000);
            
        }else {
            let myPlanets = Array.from(df.getMyPlanets())
                .filter(destroyedFilter)
                .filter(radiusFilter)
                .filter(artifactFilter)
                .filter(p=>p.planetLevel>=to.planetLevel && p.planetLevel <=to.planetLevel+3)
                .filter(p=>judgeAttack(p,to,0.5,0.2))
                .sort((a,b)=>{
                    let aTime = df.getTimeForMove(a.locationId,to.locationId);
                    let bTime = df.getTimeForMove(b.locationId,to.locationId);
                    return aTime - bTime;

                });

            if(myPlanets.length===0){
                content = 'i can\'t reach it';
                itemInfo = colorInfo(content,colorForWarn);
                addToLog(itemInfo,setInfo);
                showGear.push(planetWithGear);

                content = 'gear is here';

                onClick = ()=>center(planetWithGear);
                itemInfo = colorInfoWithFunc(content,colorForWarn,onClick);
                addToLog(itemInfo,setInfo);

                let planets = Array.from(df.getMyPlanets())   
                .filter(destroyedFilter)
                .filter(radiusFilter)
                .filter(artifactFilter)
                .filter(p=>p.planetLevel>=Math.min(4,to.planetLevel) && p.planetLevel <=to.planetLevel+3)
                .sort((a,b)=>{
                    let aDist = df.getDist(a.locationId,to.locationId);
                    let bDist = df.getDist(b.locationId,to.locationId);
                    return aDist - bDist;
                });

                if(planets.length===0){
                    content= 'this can\'t happen';
                    itemInfo = colorInfo(content,colorForError);
                    addToLog(itemInfo,setInfo);

                }else {
    

                    await autoGearMove(planetWithGear,planets[0],colorOfPlanetWithGear,'lightgreen',true,gear.id,30*60,0.2,setInfo);

                }

                

            }else {

                let from = myPlanets[0];
                showPlanetAttackFoundry.push(from);
                showGear.push(to);
                
                await autoGearMove(from,to,colorOfPlanetWithGear,colorOfPlanetAttackFoundry,false,-1,30*60,0.2,setInfo);
                

            }
        }


    } else if (state === 4) {
        //  4. send to foundry (me or owner)

        colorOfPlanetWithGear = PLANET_WITH_SPEED_BONUS;
        content = 'Condition 4: from speed bonus planet to foundry';
        itemInfo = pinkInfo(content);
        addToLog(itemInfo,setInfo);

        let candidateFoundrys = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(artifactFilter)
        .filter(isFoundry)
        .filter(isProspectable)
        .filter(p => getArrivalsToPlanet(p) < 6)
        .filter(p=>p.planetLevel>=1)
        .filter(p => isMine(p) || isNoOwner(p) )
       
        .sort((a, b) => {
            let aDist = df.getDist(planetWithGear.locationId, a.locationId);
            let bDist = df.getDist(planetWithGear.locationId, b.locationId);
            return aDist - bDist;
        })
        .slice(0, 50);

        showGear.push(planetWithGear);
        showCandidateFoundrys = candidateFoundrys;

        let aimFoundry = candidateFoundrys[0];

        await autoGearMove(planetWithGear,aimFoundry,colorOfPlanetWithGear,colorOfCandidateFoundrys,true,gear.id,30*60,0.2,setInfo);

    } else if (state === 5) {
        content = 'Condition 5: to speed bnous planet';
        itemInfo = colorInfo(content, 'pink');
        addToLog(itemInfo, setInfo);
        let allSpeedBonusPlanets = Array.from(df.getAllPlanets())
            .filter(destroyedFilter)
            .filter(radiusFilter)
            .filter(artifactFilter)
            .filter(p => p.planetLevel >= 1)
            .filter(isSpeedBonus)
            .filter(p => getArrivalsToPlanet(p) < 6)
            .sort((a, b) => {
                let aTime = df.getTimeForMove(planetWithGear.locationId, a.locationId);
                let bTime = df.getTimeForMove(planetWithGear.locationId, b.locationId);
                return aTime - bTime;
            }).slice(0, 40);

        if (allSpeedBonusPlanets.length === 0) {
            content = 'No Speed bonus planets';
            itemInfo = colorInfo(content, colorForWarn);
            addToLog(itemInfo, setInfo);
            await sleep(1000);

        } else {
            let aimSpeedBnousPlanet = allSpeedBonusPlanets[0];
            content = 'to speed bonus planet';
            itemInfo = pinkInfo(content);
            addToLog(itemInfo, setInfo);

            colorOfPlanetWithGear = GEAR_NORMAL;
            showGear.push(planetWithGear);
            showAllSpeedBonusPlanets = allSpeedBonusPlanets;
            showAimSpeedBnousPlanet.push(aimSpeedBnousPlanet);

            await autoGearMove(
                planetWithGear,
                aimSpeedBnousPlanet,
                colorOfPlanetWithGear,
                colorOfPlanetWithSpeedBonus,
                true,
                gear.id,
                60*60,
                0.2,
                setInfo
            );
        }
    }


    endSection('=== end auto gear ===',setInfo);
    await sleep(1000);
    autoGearDrawSign = false;

}
