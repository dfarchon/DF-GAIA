import {
    normalInfo,
    greenInfo,
    colorInfo
} from './infoUtils';

import {
    drawRound
} from './display';

import {
    destroyedFilter,
    radiusFilter,
    isSpeedBonus,
    isRangeBonus,
    isEnergyGrowthBonus,
    isFoundry
} from './logicForPlanetState';

import {
    ENERGY_GROWTH_BONUS,
    SPEED_BONUS,
    RANGE_BONUS,
    INVADE_BUT_NOT_CAPTURE,
    CAN_CAPTURE,
    NOT_CAPTURE,
    HAVE_CAPUTRED,
    HAVE_ARTIFACT,
    HAVE_ACTIVATE_PHOTOID_CANNON,
    OPEN_FIRE,
    ALL_PLANETS
} from './cfgForColor';
import { addToLog, clearInfo } from './infoUtils';
import {
    canCapture,
    getScoreOfPlanets,
    haveCaptured,
    invadeButNotCapture
} from './logicForInvadeAndCapture';
import { getJunkOfPlanets } from './logicForJunk';
import {
    hasArtifactsCanActivate,
    planetWithOpenFire,
    planetWithActivePhotoidCannon
} from './logicForArtifactState';
import { isProspectable } from './logicForArtifactOpen';

function info(text,planets, color, setInfo) {
    clearInfo(setInfo);
    let content = '[SH] '+text;
    let itemInfo = colorInfo(content,color);
    addToLog(itemInfo,setInfo);
    content = '[SH] ' + planets.length + ' planet(s)';
    itemInfo = colorInfo(content, color);
    addToLog(itemInfo, setInfo);
    let junkSum = getJunkOfPlanets(planets);
    content = '[SH] junk sum : ' + junkSum.toLocaleString();
    itemInfo = colorInfo(content, color);
    addToLog(itemInfo, setInfo);
    let scoreSum = getScoreOfPlanets(planets);
    content = '[SH] score sum : ' + scoreSum.toLocaleString();
    itemInfo = colorInfo(content, color);
    addToLog(itemInfo, setInfo);
}

//energy growth bonus
let showEnergyGrowthBonusPlanets = [];
export let colorForShowEnergyGrowthBonusPlanets = ENERGY_GROWTH_BONUS;
export function switchShowEnergyGrowthBonus(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(isEnergyGrowthBonus);
    if (showEnergyGrowthBonusPlanets.length === 0) showEnergyGrowthBonusPlanets = planets;
    else showEnergyGrowthBonusPlanets = [];
    info('energy growth bonus',planets, colorForShowEnergyGrowthBonusPlanets, setInfo);
}

//speed bonus
let showSpeedBonusPlanets = [];
export let colorForShowSpeedBonusPlanets = SPEED_BONUS;
export function switchShowSpeedBonus(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(isSpeedBonus);

    if (showSpeedBonusPlanets.length === 0) showSpeedBonusPlanets = planets;
    else showSpeedBonusPlanets = [];
    info('speed bonus',planets, colorForShowSpeedBonusPlanets, setInfo);
}

//range bonus
let showRangeBonusPlanets = [];
export let colorForShowRangeBonusPlanets = RANGE_BONUS;
export function switchShowRangeBonus(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(isRangeBonus);

    if (showRangeBonusPlanets.length === 0) showRangeBonusPlanets = planets;
    else showRangeBonusPlanets = [];
    info('range bonus',planets, colorForShowRangeBonusPlanets, setInfo);
}

//can capture
// notice: not consider energy
let showCanCapturePlanets = [];
export let colorForShowCanCapturePlanets = CAN_CAPTURE;
export function switchShowCanCapture(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(p=>canCapture(p,false));

    if(showCanCapturePlanets.length ===0) showCanCapturePlanets = planets;
    else showCanCapturePlanets = [];
    info('can capture (not think about energy)',planets,colorForShowCanCapturePlanets,setInfo);
}

//have captured
let showHaveCapturedPlanets = [];
export let colorForShowHaveCaptuedPlanets = HAVE_CAPUTRED;
export function switchShowHaveCaptured(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(haveCaptured);

    if(showHaveCapturedPlanets.length===0) showHaveCapturedPlanets = planets;
    else showHaveCapturedPlanets = [];
    info('have captured',planets,colorForShowHaveCaptuedPlanets,setInfo);
}

// not capture
let showNotCapturePlanets = [];
export let colorForShowNotCapturePlanets = NOT_CAPTURE;
export function switchShowNotCapture(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(p=>haveCaptured(p)===false);

    if(showNotCapturePlanets.length===0) showNotCapturePlanets = planets;
    else showNotCapturePlanets = [];
    info('not capture',planets,colorForShowNotCapturePlanets,setInfo);
}

//invade but not capture
let showInvadeButNotCapturePlanets = [];
export let colorForShowInvadeButNotCapturePlanets = INVADE_BUT_NOT_CAPTURE;
export function switchShowInvadeButNotCapture(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(invadeButNotCapture);

    if(showInvadeButNotCapturePlanets.length===0) showInvadeButNotCapturePlanets = planets;
    else showInvadeButNotCapturePlanets = [];
    info('invade but not capture',planets,colorForShowInvadeButNotCapturePlanets,setInfo);
}

// have can activate actifacts
let showHaveArtifactsPlanets = [];
export let colorForShowHaveArtifactsPlanets = HAVE_ARTIFACT;
export function switchShowHaveArtifacts(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(hasArtifactsCanActivate);
    if(showHaveArtifactsPlanets.length===0) showHaveArtifactsPlanets = planets;
    else showHaveArtifactsPlanets = [];
    info('have can active actifact(s)',planets,colorForShowHaveArtifactsPlanets,setInfo);
   
}

//active photoid cannon
let showHaveActivatePhotoidCannonPlanets = [];
export let colorForShowHaveActivatePhotoidCannonPlanets = HAVE_ACTIVATE_PHOTOID_CANNON;
export function switchShowHaveActivePhotoidCannon(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(planetWithActivePhotoidCannon);
    if(showHaveActivatePhotoidCannonPlanets.length===0) showHaveActivatePhotoidCannonPlanets = planets;
    else showHaveActivatePhotoidCannonPlanets = [];
    info('have active photoid cannon',planets,colorForShowHaveActivatePhotoidCannonPlanets,setInfo);
}

// open fire
let showOpenFirePlanets = [];
export let colorForShowOpenFirePlanets = OPEN_FIRE;
export function switchShowPlanetWithOpenFire(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(planetWithOpenFire);

    if(showOpenFirePlanets.length===0) showOpenFirePlanets = planets;
    else showOpenFirePlanets = [];
    info('open fire',planets,colorForShowOpenFirePlanets,setInfo);
}

// all
let showAllPlanets = [];
export let colorForShowAllPlanets = ALL_PLANETS;
export function switchShowAllPlanets(frontFilter, setInfo) {
    let planets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(frontFilter)
        .filter(p=>{
            if(isFoundry(p)) return isProspectable(p);
            else return true;
        });
    if(showAllPlanets.length===0) showAllPlanets = planets;
    else showAllPlanets = [];
    info('(foundry && prospectable) || others',planets,colorForShowAllPlanets,setInfo);
}


function drawPlanets(ctx,planets,color){
    planets.forEach(p=>drawRound(ctx,p,color,2,1));
}

export function sectionShowDraw(ctx) {
   
    drawPlanets(ctx,showSpeedBonusPlanets,colorForShowSpeedBonusPlanets);
    drawPlanets(ctx,showRangeBonusPlanets,colorForShowRangeBonusPlanets);
    drawPlanets(ctx,showEnergyGrowthBonusPlanets,colorForShowEnergyGrowthBonusPlanets);
   
    drawPlanets(ctx,showCanCapturePlanets,colorForShowCanCapturePlanets);
    drawPlanets(ctx,showNotCapturePlanets,colorForShowNotCapturePlanets);
    drawPlanets(ctx,showHaveCapturedPlanets,colorForShowHaveCaptuedPlanets);
    drawPlanets(ctx,showInvadeButNotCapturePlanets,colorForShowInvadeButNotCapturePlanets);

    drawPlanets(ctx,showHaveArtifactsPlanets,colorForShowHaveArtifactsPlanets);
    drawPlanets(ctx,showHaveActivatePhotoidCannonPlanets,colorForShowHaveActivatePhotoidCannonPlanets);
    drawPlanets(ctx,showOpenFirePlanets,colorForShowOpenFirePlanets );
    drawPlanets(ctx, showAllPlanets,colorForShowAllPlanets);

}
