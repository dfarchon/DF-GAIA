import {
    colorForError,
    colorForWarn,
    colorForInfo,
    CAN_INVADE
} from './cfgForColor';

import {
    MAX_WAIT_TIME_FOR_INVADE
} from './cfgForBasic';

import {
    drawRound
} from './display';

import {
    addToLog,
    pinkInfo,
    greenInfo,
    normalInfo,
    colorInfo,
    colorInfoWithFunc,
    refreshLast
} from './infoUtils';

import {
    sleep,
    center,
    getPlanetName,
    beginSection,
    endSection
} from './logicForBasic';


import {
    destroyedFilter,
    radiusFilter
} from './logicForPlanetState';

import {
    canInvade,
    getPlanetScore,
    notInvade

} from './logicForInvadeAndCapture';

let colorForCanInvadePlanets = CAN_INVADE;
let showCanInvadePlanets = [];
let showCanInvadePlanet = undefined;

let drawSign = true;

export function sectionInvadeDraw(ctx) {
    if (drawSign === false) return;
    if (showCanInvadePlanet !== undefined) drawRound(ctx, showCanInvadePlanet, colorForCanInvadePlanets,5, 1);
    showCanInvadePlanets.forEach(p => drawRound(ctx, p, colorForCanInvadePlanets, 3, 0.7));
}

export function canInvadeFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        getPlanetScore(planet) > 0 &&
        canInvade(planet);
}

export async function waitForInvade(planets, setInfo) {
    let cnt = 0;
    let MaxCnt = MAX_WAIT_TIME_FOR_INVADE * planets.length;
    let itemInfo = pinkInfo('[IN] '+planets.length + ' planet(s) invade');
    addToLog(itemInfo, setInfo);
    while (true) {
        if (cnt > MaxCnt) {
            itemInfo = colorInfo('[IN] [WARN] met max wait time', colorForWarn);
            addToLog(itemInfo, setInfo);
            break;
        }
        planets = df.getPlanetsWithIds(planets.map(p => p.locationId));
        planets = planets.filter(notInvade);
        itemInfo = normalInfo('[IN] '+planets.length + ' planet(s) left & wait ' + cnt + 's');
        if (cnt === 0) addToLog(itemInfo, setInfo);
        else refreshLast(itemInfo, setInfo);
        if (planets.length === 0) break;
        await sleep(4000);
        cnt+=4;
    }
}

export async function sectionInvade(setInfo, hasMoveAfter = false) {
    beginSection('[IN] === invade begin ===', setInfo);
    showCanInvadePlanets = [];
    showCanInvadePlanet = undefined;
    drawSign = true;
    let content, onClick, itemInfo;

    //  info display logic
    let canInvadePlanets = Array.from(df.getMyPlanets())
        .filter(canInvadeFilter);

    showCanInvadePlanets = canInvadePlanets;
    itemInfo = normalInfo('[IN] '+canInvadePlanets.length + ' can invade planet(s)');
    addToLog(itemInfo, setInfo);

    let waitGroup = [];
    for (let i = 0; i < canInvadePlanets.length; i++) {
    
        let plt = canInvadePlanets[i];
        content = '[IN] ['+getPlanetName(plt)+'] planet is [' + i + ']';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForCanInvadePlanets, onClick);
        addToLog(itemInfo, setInfo);
        showCanInvadePlanet = plt;
  
        try {
            await df.invadePlanet(plt.locationId);
        } catch (e) {
            content = '[IN] [ERROR] invade revert';
            itemInfo = colorInfo(content, colorForError);
            addToLog(itemInfo, setInfo);
            console.error(e);
        }

        waitGroup.push(plt);
        if(i%5===4 && hasMoveAfter === false){
            await waitForInvade(waitGroup,setInfo);
            waitGroup = [];
        }
            
    }
    if (waitGroup.length > 0 && hasMoveAfter === false)
        await waitForInvade(waitGroup, setInfo);
    endSection('[IN] === invade finish ===', setInfo,'[IN] ');

    await sleep(1000);
    drawSign = false;
    return;
}