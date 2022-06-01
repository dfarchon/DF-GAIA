import {
    pinkInfo,
    normalInfo,
    addToLog
} from './infoUtils';


export const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

export const center = (plt) => {
    ui.centerLocationId(plt.locationId);
}

export const getPlanetName = (plt) => {
    let planetId = plt.locationId;
    return planetId.slice(3, 3 + 4);
}

export function getSetOfPlanets(plts) {
    plts = Array.from(new Set(plts));
    return plts;
}


let beginTime;
let endTime;
let timer;
export function beginSection(msg, setInfo) {
    let itemInfo = pinkInfo(msg);
    addToLog(itemInfo, setInfo);
    beginTime = Date.now();
    timer = Date.now();
}

export function deltaTimeSection(setInfo,pre='') {
    timer = Date.now();
    let deltaTime = timer - beginTime;
    deltaTime = Math.ceil(deltaTime);
    deltaTime *= 0.001;
    let itemInfo = pinkInfo(pre+'delta time: ' + deltaTime + 's');
    addToLog(itemInfo, setInfo);
}

export function endSection(msg, setInfo,prefix='') {
    endTime = Date.now();
    let deltaTime = endTime - beginTime;
    let itemInfo;
    deltaTime = Math.ceil(deltaTime);
    deltaTime *= 0.001;
    itemInfo = normalInfo(prefix+'delta time: ' + deltaTime + 's');
    addToLog(itemInfo, setInfo);
    itemInfo = pinkInfo(msg);
    addToLog(itemInfo, setInfo);
}

// import {
//     sleep,
//     center,
//     getPlanetName,
//     getSetOfPlanets,
//     beginSection,
//     endSection
// } from './logicForBasic';