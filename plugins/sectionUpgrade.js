// 1. a lot of import 
import {
    addToLog,
    pinkInfo,
    normalInfo,
    colorInfo,
    colorInfoWithFunc,
    refreshLast
} from './infoUtils';

import {
    drawRound
} from './display';

import {
    destroyedFilter,
    radiusFilter,
    isPlanet
} from './logicForPlanetState';

import {
    colorForInfo,
    colorForWarn,
    colorForError,
    UPGRADE_PLANETS
} from './cfgForColor';


import {
    sleep,
    center,
    getPlanetName,
    beginSection,
    endSection
} from './logicForBasic';


import {
    canPlanetUpgrade,
    canStateUpgrade,
    getPlanetUpgradeStateInString
} from './logicForUpgrade';


import {
    MAX_WAIT_TIME_FOR_UPGRADE
} from './cfgForBasic';


// 2. display variables
let showUpgradePlanet = undefined;
let showUpgradePlanets = [];

let drawSign = true;

let colorForUpgradePlanets = UPGRADE_PLANETS;


// 3. the main draw function
export function sectionUpgradeDraw(ctx) {
    if (drawSign === false) return;

    if (showUpgradePlanet !== undefined)
        drawRound(ctx, showUpgradePlanet, colorForUpgradePlanets, 5, 1);
    showUpgradePlanets.forEach(p => {
        drawRound(ctx, p, colorForUpgradePlanets, 3, 0.7);
    });
}

// 4. some functions to get target planet(s)
function upgradeFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        isPlanet(planet) &&
        canPlanetUpgrade(planet);
}

// sorted function 
function sortedByPlanetLevel(a, b) {
    return b.planetLevel - a.planetLevel;
}

// 6. waiting mechanism
// default is to wait for a group of planets
async function waitForUpgrade(planets, setInfo) {
    let cnt = 0;
    let maxCnt = MAX_WAIT_TIME_FOR_UPGRADE * planets.length;
    let itemInfo = pinkInfo('[UP] '+planets.length + ' planet(s) upgrade');
    addToLog(itemInfo, setInfo);
    let fakPlanets = [];
    planets.forEach(p => {
        let item = {};
        item.silver = p.silver;
        fakPlanets.push(item);
    });

    while (true) {
        if (cnt > maxCnt) {
            itemInfo = colorInfo('[UP] [WARN] met max wait time', colorForWarn);
            addToLog(itemInfo, setInfo);
            break;
        }
        planets = df.getPlanetsWithIds(planets.map(p => p.locationId));

        let sameNumber = 0;
        for (let i = 0; i < planets.length; i++) {
            let planet = planets[i];
            let planetBefore = fakPlanets[i];
            if (planet.silver === planetBefore.silver) sameNumber++;
        }
        
        itemInfo = normalInfo('[UP] '+sameNumber + ' planet(s) left & wait ' + cnt + 's');
        if (cnt === 0) addToLog(itemInfo, setInfo);
        else refreshLast(itemInfo, setInfo);
        if (sameNumber === 0) break;
        await sleep(4000);
        cnt+=4;
    }
}

// 7. the main function 
//    
// seting  maxNumber is for the convenience of test
// actually should upgrade as soon as possible
//
// if hasMoveAfter===true, this section don't need to set  waiting mechanism
// 
// notice: it may be slower if the waiting mechanism is set for each planet operation  
//         the way we recommend is to do the operation to some planets (may be 6-12 planets)
//         and use waitForUpgrade(planets,setInfo) to wait the state of all those planets to refresh
// 
export async function sectionUpgrade(setInfo, hasMoveAfter = false, maxNumber = 3) {
    // sectionXXX 1:  begin section, 
    //                init of display variables,
    //                set public variables (content,onClick,itemInfo)
    beginSection('[UP] === upgrade planet(s) begin ===', setInfo);
    drawSign = true;
    showUpgradePlanet = undefined;
    showUpgradePlanets = [];

    let content, onClick, itemInfo;

    // setctionXXX 2: get candidate planets 
    //                show it in info panel by addToLog()
    //                set display variables to show planets in map
    let plts = Array.from(df.getMyPlanets())
        .filter(upgradeFilter)
        .sort(sortedByPlanetLevel);

    content = '[UP] '+plts.length + ' upgrade planet(s)';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);
    
    plts = plts.slice(0, maxNumber);
    content = '[UP] ' + plts.length + ' upgrade planet(s) chosen';
    itemInfo = normalInfo(content);
    addToLog(itemInfo, setInfo);
    showUpgradePlanets = plts;

    let waitGroup = [];
   
    //sectionXXX 3: do the operation to every planet(s)
    for (let i = 0; i < plts.length; i++) {
        let plt = plts[i];
        plt = df.getPlanetWithId(plt.locationId);

        content = '[UP] ['+getPlanetName(plt)+'] planet [' + i + '] upgrade';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForInfo, onClick);
        addToLog(itemInfo, setInfo);

        content = '[UP] '+getPlanetUpgradeStateInString(plt);
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        let upgradeType = -1;
     
        //1,2,0

        
        // [defenseCan, rangeCan, speedCan] 
        if (canStateUpgrade(plt, 1)) {
            upgradeType = 1;
        } else if (canStateUpgrade(plt, 2)) {
            upgradeType = 2;
        } else if (canStateUpgrade(plt, 0)) {
            upgradeType = 0;
        }

        if (upgradeType === -1) {
            content = '[UP] [ERROR] this planet can\'t upgrade';
            itemInfo = colorInfo(content, colorForError);
            addToLog(itemInfo, setInfo);
            continue;
        }

        content = '[UP] [' + getPlanetName(plt)+'] planet';
        if (upgradeType === 2) content += ' speed upgrade';
        else if (upgradeType === 1) content += ' range upgrade';
        else if (upgradeType === 0) content += ' defense upgrade';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForUpgradePlanets, onClick);
        addToLog(itemInfo, setInfo);
        showUpgradePlanet = plt;

        try {
            await df.upgrade(plt.locationId, upgradeType);
        } catch (e) {
            content = '[UP] [ERROR] upgrade revert';
            itemInfo = colorInfo(content, colorForError);
            addToLog(itemInfo, setInfo);
            console.error(e);
        }

        waitGroup.push(plt);
        

        if(waitGroup.length>=3 && hasMoveAfter===false){
            await waitForUpgrade(waitGroup,setInfo);
            waitGroup = [];
        }

    }

    //sectionXXX 4: set waiting mechanism
    if (waitGroup.length > 0 && hasMoveAfter === false)
        await waitForUpgrade(plts, setInfo);

    // sectionXXX 5: end section and set display sign (drawSign) to false
    endSection('[UP] === upgrade planet(s) finish ===', setInfo,'[UP] ');
    await sleep(1000);
    drawSign = false;
}