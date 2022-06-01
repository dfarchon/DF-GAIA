import {
    addToLog,
    pinkInfo,
    greenInfo,
    normalInfo,
    colorInfo,
    refreshLast,
    colorInfoWithFunc
} from './infoUtils';

import {
    sleep,
    beginSection,
    endSection,
    getPlanetName,
    center
} from './logicForBasic';

import {
    destroyedFilter,
    radiusFilter,
    getEnergyPercent
} from './logicForPlanetState';

import {
    getPlanetScore,
    invadeButNotCapture,
    haveCaptured,
    canCapture,
    getScoreOfPlanets
} from './logicForInvadeAndCapture';

import {
    drawRound
} from './display';

import {
    colorForWarn,
    colorForError,
    colorForInfo,
    INVADE_BUT_NOT_CAPTURE,
    CAN_CAPTURE
} from './cfgForColor';


import {
    mainAddress,
    MAX_WAIT_TIME_FOR_CAPTURE
} from './cfgForBasic';



let colorForInvadeButNotCapturePlanets = INVADE_BUT_NOT_CAPTURE;
let colorForCapturePlanets = CAN_CAPTURE;

let showInvadeButNotCapturePlanets = [];
let showCapturePlanets = [];
let showCapturePlanet = undefined;
let drawSign = true;


export function sectionCaptureDraw(ctx) {
    if (drawSign === false) return;
    if (showCapturePlanet != undefined)
        drawRound(ctx, showCapturePlanet, colorForCapturePlanets, 5, 1);
    showInvadeButNotCapturePlanets.forEach(p =>
        drawRound(ctx, p, colorForInvadeButNotCapturePlanets, 3, 0.7));
    showCapturePlanets.forEach(p =>
        drawRound(ctx, p, colorForCapturePlanets, 3, 1));
}

function invadeButNotCaptureFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        getPlanetScore(planet) > 0 &&
        invadeButNotCapture(planet);
}

function canCaptureFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        getPlanetScore(planet) > 0 &&
        canCapture(planet) &&
        ((df.account===mainAddress) || (df.account!==mainAddress && planet.planetLevel <=6));
}

export async function waitForCapture(planets, setInfo) {
    let cnt = 0;
    let MaxCnt = MAX_WAIT_TIME_FOR_CAPTURE * planets.length; 
    let itemInfo = pinkInfo('[CA] '+planets.length + ' planet(s) capture');
    addToLog(itemInfo, setInfo);

    while (true) {
        if (cnt > MaxCnt) {
            itemInfo = colorInfo('[CA] [WARN] met max wait time', colorForWarn);
            addToLog(itemInfo, setInfo);
            break;
        }
        planets = df.getPlanetsWithIds(planets.map(p => p.locationId));
        planets = planets.filter(canCapture);
        itemInfo = normalInfo('[CA] '+planets.length + ' planet(s) left & wait ' + cnt + 's');
        if (cnt === 0) addToLog(itemInfo, setInfo);
        else refreshLast(itemInfo, setInfo);
        if (planets.length === 0) break;
        await sleep(4000);
        cnt+=4;
    }
}

export async function sectionCapture(setInfo, hasMoveAfter = false) {
    // logic info display 
    beginSection('[CA] === capture begin ===', setInfo);
    drawSign = true;
    showInvadeButNotCapturePlanets = [];
    showCapturePlanets = [];
    let content, onClick, itemInfo;

    let invadeButNotCapturePlanets = Array.from(df.getMyPlanets())
        .filter(invadeButNotCaptureFilter);

    showInvadeButNotCapturePlanets = invadeButNotCapturePlanets;

    let score = getScoreOfPlanets(invadeButNotCapturePlanets);
    itemInfo = greenInfo("[CA] can capture after " + invadeButNotCapturePlanets.length+" planet(s)");
    addToLog(itemInfo, setInfo);
    itemInfo = greenInfo("[CA] add score: " + score.toLocaleString());
    addToLog(itemInfo, setInfo);

    let planets = Array.from(df.getMyPlanets())
        .filter(canCaptureFilter);
    showCapturePlanets = planets;
    score = getScoreOfPlanets(planets);
    itemInfo = pinkInfo("[CA] now can capture " + planets.length + ' planet(s)');
    addToLog(itemInfo, setInfo);
    itemInfo = pinkInfo("[CA] now can add " + score.toLocaleString() + ' score(s)');
    addToLog(itemInfo, setInfo);

    let waitGroup = [];

    for (let i = 0; i < planets.length; i++) {
        let plt = planets[i];
        content = '[CA] ['+getPlanetName(plt)+'] capture planet  [' + i + ']';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForCapturePlanets, onClick);
        addToLog(itemInfo, setInfo);

        showCapturePlanet = plt;

        try {
            await df.capturePlanet(plt.locationId);
        } catch (e) {
            content = '[CA] [ERROR] capture revert';
            itemInfo = colorInfo(content, colorForError);
            addToLog(itemInfo, setInfo);
            console.error(e);
        }

        waitGroup.push(plt);
        if(i%5 === 4 && hasMoveAfter === false) {
            await waitForCapture(waitGroup,setInfo);
            waitGroup = [];
        }      
    }

    if (waitGroup.length > 0 && hasMoveAfter === false)
        await waitForCapture(waitGroup, setInfo);


    endSection('[CA] === capture finish ===', setInfo,'[CA] ');
    await sleep(1000);
    drawSign = false;
    return;
}