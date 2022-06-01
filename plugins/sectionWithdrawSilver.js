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
    isSpacetimeRip,
    radiusFilter
} from './logicForPlanetState';

import {
    colorForInfo,
    colorForWarn,
    colorForError,
    BLOCKHOLES_THAT_WITHDRAW_SILVER
} from './cfgForColor';

import {
    sleep,
    center,
    getPlanetName,
    beginSection,
    endSection
} from './logicForBasic';


import {
    MAX_WAIT_TIME_FOR_WITHDRAW_SILVER
} from './cfgForBasic';

let drawSign = false;

let showBlockhole = undefined;
let showBlockholes = [];

let colorForBlockholes = BLOCKHOLES_THAT_WITHDRAW_SILVER;

export function sectionWithdrawSilverDraw(ctx) {
    if (drawSign === false) return;
    if (showBlockhole !== undefined)
        drawRound(ctx, showBlockhole, colorForBlockholes, 5, 1);
    showBlockholes.forEach(p =>
        drawRound(ctx, p, colorForBlockholes, 3, 0.7)
    );
}

function spacetimeRipWithSilverFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        isSpacetimeRip(planet) &&
        Math.floor(planet.silver) > 0 &&
        !planet.unconfirmedWithdrawSilver;
}

export async function waitForWithdrawSilver(planets, setInfo) {
    let cnt = 0;
    let MaxCnt = MAX_WAIT_TIME_FOR_WITHDRAW_SILVER * planets.length;
    let itemInfo = pinkInfo('[WS] '+planets.length + ' blackhole(s) withdraw silver');
    addToLog(itemInfo, setInfo);

    while (true) {
        if (cnt > MaxCnt) {
            itemInfo = colorInfo('[WS] [WARN] met max wait time', colorForWarn);
            addToLog(itemInfo, setInfo);
            break;
        }
        planets = df.getPlanetsWithIds(planets.map(p => p.locationId));
        planets = planets.filter(p => Math.floor(p.silver) !== 0);
        itemInfo = normalInfo('[WS] '+planets.length + ' blockhole(s) left & wait ' + cnt + 's');
        if (cnt === 0) addToLog(itemInfo, setInfo);
        else refreshLast(itemInfo, setInfo);
        if (planets.length === 0) break;
        await sleep(4000);
        cnt+=4;
    }
}

// notice: it may be slower if the waiting mechanism is set for each planet operation
//         the way we recommend is to do the operation to some planets (may be 3-6 planets)
//         and use waitForXXX(planets,setInfo) to wait the state of all those planets to refresh
//
export async function sectionWithdrawSilver(setInfo, haveMoveAfter = false, maxNumber = 5) {

    beginSection('[WS] === withdraw silver start ===', setInfo);
    showBlockhole = undefined;
    showBlockholes = [];
    drawSign = true;

    let content, onClick, itemInfo;

    let plts = Array.from(df.getMyPlanets())
        .filter(spacetimeRipWithSilverFilter)
        .sort((a, b) => b.silver - a.silver);
    content ='[WS] '+plts.length + ' planet(s) can withdraw silver';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    plts = plts.slice(0, maxNumber);
    content = '[WS] ' + plts.length + ' planet(s) chosen';
    itemInfo = normalInfo(content);
    addToLog(itemInfo, setInfo);
    showBlockholes = plts;

    for (let i = 0; i < plts.length; i++) {
        let plt = plts[i];
        plt = df.getPlanetWithId(plt.locationId);
        content = '[WS] ['+getPlanetName(plt)+'] blockchole  [' + i + '] ';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForInfo, onClick);
        addToLog(itemInfo, setInfo);

        let silverAmount = Math.floor(plt.silver);
        content = '[WS] ['+getPlanetName(plt)+'] withdraw ' + silverAmount.toLocaleString() + ' silver';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForBlockholes, onClick);
        addToLog(itemInfo, setInfo);
        showBlockhole = plt;
        
        try {
            await df.withdrawSilver(plt.locationId, silverAmount);
        } catch (e) {
            content = '[WS] [ERROR] withdraw silver revert';
            itemInfo = colorInfo(content, colorForError);
            addToLog(itemInfo, setInfo);
            console.error(e);
        }
    }

    if (plts.length > 0 && haveMoveAfter === false)
        await waitForWithdrawSilver(plts, setInfo);

    endSection('[WS] === withdraw silver finish ===', setInfo,'[WS] ');
    await sleep(1000);
    drawSign = false;
    return;
}
