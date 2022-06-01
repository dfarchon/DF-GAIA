import {
    notOwnerAddress
} from './cfgForBasic';
import { getEnergyPercent } from './logicForPlanetState';

export function getCaptureZonesEnabled(){
    return df.contractConstants.CAPTURE_ZONES_ENABLED;
}

function getNextChangeBlock() {
    return ui.getCaptureZoneGenerator().nextChangeBlock;
}

function getYellowZones() {
    if(getCaptureZonesEnabled()===false) return [];
    return df.captureZoneGenerator.zones;
}

function getConstantsForCaptureZonePlanetLevelScore() {
    return df.contractConstants.CAPTURE_ZONE_PLANET_LEVEL_SCORE;
}

export function getCurrentBlockNumber() {
    return df.contractsAPI.ethConnection.blockNumber;
}

function getConstantsForCaptureZoneHoleBlocksRequired() {
    return df.contractConstants.CAPTURE_ZONE_HOLD_BLOCKS_REQUIRED;
}


export function isInZones(planet) {
    let yellowZones = Array.from(getYellowZones());
    let coords = planet.location.coords;
    for (let i = 0; i < yellowZones.length; i++) {
        let zone = yellowZones[i];
        let dist = df.getDistCoords(zone.coords, coords);
        if (dist < zone.radius) return true;
    }
    return false;
}

export function getPlanetScore(p) {
    let scoresList = getConstantsForCaptureZonePlanetLevelScore();
    let score = scoresList[p.planetLevel];
    return score;
}

export function getScoreOfPlanets(plts) {
    let score = 0;
    plts.forEach(p => score += getPlanetScore(p));
    return score;
}

export function notInvade(planet) {
    return planet.invadeStartBlock === undefined && getPlanetScore(planet)>0;
}


export function canInvade(planet) {
    return notInvade(planet) && isInZones(planet);
}


export function invadeButNotCapture(p) {
    let aboutState = p.capturer === notOwnerAddress && p.invader !== notOwnerAddress;
    return aboutState;
}


export function invadeButCanNotCapture(p) {
    let currentBlockNumber = getCurrentBlockNumber();
    let beginBlockNumber = p.invadeStartBlock;
    if (beginBlockNumber === undefined) return false;
    let delta = getConstantsForCaptureZoneHoleBlocksRequired(); //256*8;       
    let aboutTime = beginBlockNumber + delta >= currentBlockNumber;
    let aboutState = p.capturer === notOwnerAddress && p.invader !== notOwnerAddress;
    return aboutTime && aboutState;
}

export function canCapture(p,energySign =true) {
    let currentBlockNumber = getCurrentBlockNumber();
    let beginBlockNumber = p.invadeStartBlock;
    if (beginBlockNumber === undefined) return false;
    let delta = getConstantsForCaptureZoneHoleBlocksRequired(); //256*8;       
    let aboutTime = beginBlockNumber + delta < currentBlockNumber;
    let aboutState = p.capturer === notOwnerAddress && p.invader !== notOwnerAddress;
    let aboutEnergy  =energySign===true? getEnergyPercent(p)>=80: true;
    return aboutTime && aboutState && aboutEnergy;
}



export function haveCaptured(p) {
    let aboutState = p.capturer !== notOwnerAddress && p.invader !== notOwnerAddress;
    return aboutState;
}

export function getTimeRemaining() {
    let secondsPerBlock = 5.5;
    return Math.floor((getNextChangeBlock() - getCurrentBlockNumber()) * secondsPerBlock);
}

export function getMinDistToYellowCircle(p) {
    let zonesInvade = Array.from(getYellowZones());
    let coords = p.location.coords;
    let dist = undefined;
    for (let i = 0; i < zonesInvade.length; i++) {
        let centerCoords = zonesInvade[i].coords;
        let tmpDist = df.getDistCoords(coords, centerCoords);
        if (dist === undefined) dist = tmpDist;
        else dist = Math.min(dist, tmpDist);
    }
    return dist;
}

export function getMinDistYellowZone(p) {
    let zonesInvade = Array.from(getYellowZones());
    let coords = p.location.coords;
    let dist = undefined;
    let resZone = undefined;
    for (let i = 0; i < zonesInvade.length; i++) {
        let centerCoords = zonesInvade[i].coords;

        let tmpDist = df.getDistCoords(coords, centerCoords);
        if (dist === undefined) {
            dist = tmpDist;
            resZone = zonesInvade[i];
        } else if (dist > tmpDist) {
            dist = tmpDist;
            resZone = zonesInvade[i];
        }
    }
    return resZone;

}


export function inOneZone(p, zone) {
    if (p === undefined) return false;
    if (p.location === undefined) return false;
    let zoneCoords = zone.coords;
    let zoneRadius = zone.radius;
    let dist = df.getDistCoords(zoneCoords, p.location.coords);
    return dist < zoneRadius;

}


// import {
//     getPlanetScore,
//     getScoreOfPlanets,
//     isInZones,
//     notInvade,
//     canInvade,
//     invadeButCanNotCapture,
//     canCapture,
//     canCaptureWithEnergyJudge,
//     haveCaptured,
//     getTimeRemaining,
//     getMinDistToYellowCircle,
// getMinDistYellowZone,
// inOneZone
// } from './logicForInvadeAndCapture';