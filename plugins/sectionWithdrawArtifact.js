import {
    addToLog,
    colorInfo,
    pinkInfo,
    colorInfoWithFunc,
    normalInfo,
    refreshLast
} from './infoUtils';

import {
    hasArtifactsNotActivate,
    getCanWithdrawArtifactsInPlanet,
    getCanWithdrawArtifactsInPlanets,
    getArtifactName,
    getArtifactType
} from './logicForArtifactState';

import {
    sleep,
    beginSection,
    endSection,
    center,
    getPlanetName
} from './logicForBasic';

import {
    destroyedFilter,
    isSpacetimeRip,
    radiusFilter
} from './logicForPlanetState';

import { drawRound } from './display';

import {
    colorForError,
    colorForInfo,
    colorForWarn,
    BLOCKHOLES_THAT_WITHDRAW_ARTIFACT
} from './cfgForColor';

import {
    MAX_WAIT_TIME_FOR_WITHDRAW_ARTIFACT
} from './cfgForBasic';


let drawSign = false;
let showBlackhole = undefined;
let showBlackholes = [];
let colorForWithdrawArtifacts = BLOCKHOLES_THAT_WITHDRAW_ARTIFACT;

export function sectionWithdrawArtifactDraw(ctx) {
    if (drawSign === false) return;
    if (showBlackhole !== undefined)
        drawRound(ctx, showBlackhole, colorForWithdrawArtifacts, 5, 1);
    showBlackholes.forEach(p => {
        drawRound(ctx, p, colorForWithdrawArtifacts, 3, 0.7);
    });
}

function withdrawArtifactFilter(planet) {
    return destroyedFilter(planet) &&
        radiusFilter(planet) &&
        planet.planetLevel >= 1 &&
        isSpacetimeRip(planet) &&
        hasArtifactsNotActivate(planet);
}

export async function waitForWithdrawArtifact(planets, setInfo) {
    let cnt = 0;
    
    let artifacts =  getCanWithdrawArtifactsInPlanets(planets);
    let MaxCnt = MAX_WAIT_TIME_FOR_WITHDRAW_ARTIFACT *  artifacts.length;
    let itemInfo = pinkInfo('[WA] withdraw '+ artifacts.length + ' artifact(s)');
    addToLog(itemInfo, setInfo);
    while (true) {
        if (cnt > MaxCnt) {
            itemInfo = colorInfo('[WA] [WARN] met max wait time', colorForWarn);
            addToLog(itemInfo, setInfo);
            break;
        }
        planets = df.getPlanetsWithIds(planets.map(p => p.locationId));
        artifacts = getCanWithdrawArtifactsInPlanets(planets);

        itemInfo = normalInfo('[WA] ' + artifacts.length + ' artifact(s) left & wait ' + cnt + 's');
        if (cnt === 0) addToLog(itemInfo, setInfo);
        else refreshLast(itemInfo, setInfo);
        if (artifacts.length === 0) break;
        await sleep(4000);
        cnt += 4;
    }
}

export async function sectionWithdrawArtifact(setInfo, haveMoveAfter = false, maxNumber = 3) {
    beginSection('[WA] === withdraw artifact begin ===', setInfo);
    showBlackhole = undefined;
    showBlackholes = [];
    drawSign = true;

    let content, onClick, itemInfo;

    let planets = Array.from(df.getMyPlanets())
        .filter(withdrawArtifactFilter);
    content = '[WA] ' + planets.length + ' planet(s) as candidate(s)';
    itemInfo = colorInfo(content, colorForInfo);
    addToLog(itemInfo, setInfo);

    planets = planets.slice(0, maxNumber);
    content = '[WA] ' + planets.length + ' planet(s) chosen';
    itemInfo = colorInfo(content, colorForWithdrawArtifacts);
    addToLog(itemInfo, setInfo);
    showBlackholes = planets;

    for (let i = 0; i < planets.length; i++) {
        let plt = planets[i];
        plt = df.getPlanetWithId(plt.locationId);
        content = '[WA] ['+getPlanetName(plt)+'] planet is [' + i + ']';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForInfo, onClick);
        addToLog(itemInfo, setInfo);

        let artifacts = getCanWithdrawArtifactsInPlanet(plt);
        content = '[WA] [' + getPlanetName(plt) + '] blockhole withdraw ' + artifacts.length + ' artifacts';
        onClick = () => center(plt);
        itemInfo = colorInfoWithFunc(content, colorForWithdrawArtifacts, onClick);
        addToLog(itemInfo, setInfo);
        showBlackhole = plt;

        for (let j = 0; j < artifacts.length; j++) {
            let artifact = artifacts[j];
            let artifactId = artifact.id;
            
            content = '[WA] withdraw ' + getArtifactType(artifact)+' ['+getArtifactName(artifact)+']';
            itemInfo = pinkInfo(content);
            addToLog(itemInfo, setInfo);

            try {
                await df.withdrawArtifact(plt.locationId, artifactId);
            } catch (e) {
                content = '[WA] [ERROR] withdraw artifact revert';
                itemInfo = colorInfo(content, colorForError);
                addToLog(itemInfo, setInfo);
            }
        }
    }
    if (planets.length > 0 && haveMoveAfter === false)
        await waitForWithdrawArtifact(planets, setInfo);


    endSection('[WA] === withdraw artifact finish ===', setInfo, '[WA] ');
    await sleep(1000);
    drawSign = false;


}