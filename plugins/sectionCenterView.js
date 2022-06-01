import { getSetOfPlanets } from "./logicForBasic";
import { drawRound, drawCenter } from "./display";
import { beginSection, center, endSection, getPlanetName, sleep } from "./logicForBasic";
import { getArrivalsToPlanet, getEnergyCanSend, getOtherEnergyMoveToPlanet, getTrueEnergyPercent, getMyEnergyMoveToPlanet, judgeRange, getTrueEnergyInFuture } from "./logicForMoveEnergy";
import { calRange, destroyedFilter, getEnergyPercent, isDefenseBonus, isEnergyCapBonus, isEnergyGrowthBonus, isNotQuasar, isPlanet, isQuasar, isRangeBonus, isSpacetimeRip, isSpeedBonus, radiusFilter, inViewport } from "./logicForPlanetState";
import { addToLog, colorInfo, colorInfoWithFunc, greenInfo, normalInfo, pinkInfoWithFunc } from './infoUtils';
import { MAX_WAIT_TIME_FOR_COLLECT_ENERGY, MAX_WAIT_TIME_FOR_GOSSIP } from './cfgForBasic';
import { getSilverCanSend, getSilverMoveToPlanet } from "./logicForMoveSilver";
import { waitForMoveOnchain } from "./logicForMove";
import { isMine, isNoOwner, isOther } from "./logicForAccount";
import { getJunkEnabled, getMyJunkBudget, getPlanetJunk } from "./logicForJunk";
import { sectionAbandon } from "./sectionAbandon";
import { colorForInfo, ENERGY_TARGET_PLANETS, ENERGY_SOURCE_PLANETS, CENTER_CANDIDATES, CHOOSE_CENTERS, ARMY_PLANETS } from './cfgForColor';
import { artifactFilter } from "./logicForArtifactState";
import { haveCaptured } from "./logicForInvadeAndCapture";
import { getCenterCoords } from './logicForCenterCoords';


function targetFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        isQuasar(planet) === false &&
        isNoOwner(planet) &&
        haveCaptured(planet) === false;
}

function sourceFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        artifactFilter(planet) &&
        getEnergyPercent(planet) >= 60 &&
        getOtherEnergyMoveToPlanet(planet) === 0 &&
        isMine(planet);
}

function getMinLevel(planets) {
    let minLevel = 9;
    planets.forEach(p => {
        let lvl = p.planetLevel;
        minLevel = Math.min(minLevel, lvl);

    });
    minLevel = Math.max(minLevel, 1);
    return minLevel;
}

export async function sectionCenterView(setInfo) {
    beginSection('[CV] == center view begin ==', setInfo);

    let content, onClick, itemInfo;

    let myArmyPlanets = Array.from(df.getMyPlanets())
        .filter(sourceFilter)
        .sort((a, b) => b.planetLevel - a.planetLevel)
        .slice(0,100);

    content ='[CV] '+myArmyPlanets.length+' my army planet(s)';
    itemInfo = normalInfo(content);
    addToLog(itemInfo,setInfo);

    let minLevel = getMinLevel(myArmyPlanets);
    content = '[CV] minLevel:'+minLevel;
    itemInfo = normalInfo(content);
    addToLog(itemInfo,setInfo);

    // let preRange = 0;
    // let centerCoords = getCenterCoords(myArmyPlanets);

    // myArmyPlanets.forEach(p => {
    //     let dist = df.getDistCoords(p.location.coords, centerCoords);
    //     let tmpRange = dist + calRange(p);
    //     preRange = Math.max(preRange, tmpRange);
    // });

    // let preTargetCandidates = Array.from(df.getAllPlanets())
    //     .filter(targetFilter)
    //     .filter(p => p.planetLevel >= minLevel)
    //     .filter(p => {
    //         let dist = df.getDistCoords(centerCoords, p.location.coords);
    //         return dist <= preRange;
    //     })
    //     .filter(p => getOtherEnergyMoveToPlanet(p) === 0)
    //     .filter(p => haveCaptured(p) === false);

    // content = '[CV] '+preTargetCandidates.length+' pre target cnadidates';
    // itemInfo = normalInfo(content);
    // addToLog(itemInfo,setInfo);
  
    // let candidates = [];
    // for (let i = 0; i < myArmyPlanets.length; i++) {
    //     let from = myArmyPlanets[i];
    //     let tmp = preTargetCandidates
    //         .filter(to => judgeRange(from, to, 0.8) === true);
    //     tmp.forEach(p => candidates.push(p));
    //     candidates = getSetOfPlanets(candidates);
    // }

    // candidates = df.getPlanetsWithIds(candidates.map(p => p.locationId));
    // candidates = candidates
    //     .filter(targetFilter)
    //     .filter(p => getOtherEnergyMoveToPlanet(p) === 0)
    //     .filter(p => {
    //         if (p.planetLevel === 0) return getMyEnergyMoveToPlanet(p) === 0;
    //         else return getMyEnergyMoveToPlanet(p) < p.energy * p.defense / 100;
    //     });

    // content = '[CV] '+candidates.length+' candidate(s)';
    // itemInfo = normalInfo(content);
    // addToLog(itemInfo,setInfo);

    // candidates = candidates.sort((a,b)=>b.planetLevel -a.planetLevel).slice(0,100);
        
    let planets = myArmyPlanets;

    content = '[CV] '+planets.length+' planet(s)';
    itemInfo = normalInfo(content);
    addToLog(itemInfo,setInfo);
    
    const viewport = ui.getViewport();
    let left = viewport.getLeftBound();
    let right = viewport.getRightBound();
    let top = viewport.getTopBound();
    let bottom = viewport.getBottomBound();

    let x = (left + right) / 2;
    let y = (top + bottom) / 2;

    content = '[CV] old x:' + Math.floor(x) + '; y:' + Math.floor(y);
    itemInfo = normalInfo(content);
    addToLog(itemInfo, setInfo);
    let coords = planets[0].location.coords;
    // console.log(coords);
    let planetLeft = coords.x;
    let planetRight = coords.x;
    let planetTop = coords.y;
    let planetBottom = coords.y;

    planets.forEach(p => {
        let range = p.range;
        let planetCoords = p.location.coords;
        planetLeft = Math.min(planetLeft, planetCoords.x - range);
        planetRight = Math.max(planetRight, planetCoords.x + range);
        planetTop = Math.max(planetTop, planetCoords.y + range);
        planetBottom = Math.min(planetBottom, planetCoords.y - range);
    });

    // console.log(planetLeft);
    // console.log(planetRight);
    // console.log(planetTop);
    // console.log(planetBottom);

    let newX = 0.5 * (planetLeft + planetRight);
    let newY = 0.5 * (planetTop + planetBottom);

    content = '[CV] new x:' + Math.floor(newX) + '; y:' + Math.floor(newY);
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

    content = '[CV] old height:' + Math.floor(height) + '; width:' + Math.floor(width);
    itemInfo = normalInfo(content);
    addToLog(itemInfo, setInfo);
    content = '[CV] cal height:' + Math.floor(newHeight) + '; width:' + Math.floor(newWidth);
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
        if (cnt === 20) break;



        height = viewport.getViewportWorldHeight();
        width = viewport.getViewportWorldWidth();

        content = '[CV] height:' + Math.floor(height)+ '; width:' + Math.floor(width);
        itemInfo = normalInfo(content);
        addToLog(itemInfo, setInfo);

        await sleep(1000);
    }



    endSection('[CV] == center view finish ==', setInfo);
    return;


}