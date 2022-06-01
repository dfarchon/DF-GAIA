// todo: need more test

import {
    ArtifactRarityNames,
    ArtifactTypeNames,
    ArtifactType
} from "https://cdn.skypack.dev/@darkforest_eth/types";

import {
    WORMHOLE_COOLDOWN_TIME,
    ARTIFACT_COOLDOWN_TIME,
    PHOTOID_CANNON_WAIT_TIME
} from './cfgForBasic';

import {
    getEnergyPercent,
    isSpacetimeRip
} from './logicForPlanetState';

import {
    getUnconfirmedMoves
} from './logicForMove';


// BlackDomain: 9
// BloomFilter: 8
// Colossus: 2
// Monolith: 1
// PhotoidCannon: 7
// PlanetaryShield: 6
// Pyramid: 4
// ShipCrescent: 11
// ShipGear: 13
// ShipMothership: 10
// ShipTitan: 14
// ShipWhale: 12
// Spaceship: 3
// Unknown: 0
// Wormhole: 5


export const isUnknown = artifact => artifact.artifactType === 0;
export const isMonolith = artifact => artifact.artifactType === 1;
export const isColossus = artifact => artifact.artifactType === 2;
export const isSpaceship = artifact => artifact.artifactType === 3;
export const isPyramid = artifact => artifact.artifactType === 4;
export const isWormhole = artifact => artifact.artifactType === 5;
export const isPlanetaryShield = artifact => artifact.artifactType === 6;
export const isPhotoidCannon = artifact => artifact.artifactType === 7;
export const isBloomFilter = artifact => artifact.artifactType === 8;
export const isBlackDomain = artifact => artifact.artifactType === 9;

export const isShipMothership = artifact => artifact.artifactType === ArtifactType.ShipMothership;
export const isShipCrescent = artifact => artifact.artifactType === ArtifactType.ShipCrescent;
export const isShipWhale = artifact => artifact.artifactType === ArtifactType.ShipWhale;
export const isShipGear = artifact => artifact.artifactType === ArtifactType.ShipGear;
export const isShipTitan = artifact => artifact.artifactType === ArtifactType.isShipTitan;

// 0: "Unknown"
// 1: "Common"
// 2: "Rare"
// 3: "Epic"
// 4: "Legendary"
// 5: "Mythic"
export const isCommon = artifact =>artifact.rarity ===1;
export const isRare = artifact =>artifact.rarity ===2;
export const isEpic = artifact=>artifact.rarirt ===3;
export const isLegendary = artifact =>artifact.rarity ===4;
export const isMythic = artifact =>artifact.rarity ===5;

export const isBenifit = 
    artifact => artifact.artifactType >= 1 && artifact.artifactType <= 4;
export const isNormalArtifact = 
    artifact => artifact.artifactType >= 1 && artifact.artifactType <= 9;
export const isShipArtifact = 
    artifact => artifact.artifactType >= 10 && artifact.artifactType <= 14;

//==================================================================================================
export function getShipGear() {
    return df.getMyArtifacts().filter(isShipGear)[0];
}

// if gear is on voyage return undefine
// else return planet 
export function whereIsShipGear() {
    const g = getShipGear();
    const pid = (!!g.onVoyageId && df.getAllVoyages().filter(v => v.eventId == g.onVoyageId).length > 0) ? undefined : g.onPlanetId;
    if (pid !== undefined) {
        return df.getPlanetWithId(pid);
    }else return pid;
}
//====================================================================================================

let canUse = artifact => {
    if (artifact === undefined) return false;
    if (artifact.unconfirmedWithdrawArtifact) return false;
    if (artifact.unconfirmedMove) return false;
    if (artifact.unconfirmedDeactivateArtifact) return false;
    return true;
};

//0 is for others
//1 is for [now active]
//2 is for [can active]
//3 is for [cool down]
export let stateOfNormalArtifact = artifact => {
    if (canUse(artifact) === false) return 0;
    if(isNormalArtifact(artifact)===false) return 0;
    if(isNormalArtifact(artifact)===false) return 0;
    if (artifact.lastActivated > artifact.lastDeactivated) return 1;
    else if (artifact.lastActivated === artifact.lastDeactivated) {
        if (artifact.lastActivated === 0) return 2;
        // notice: this condition may not meet
        else return 3;
    } else if (artifact.lastActivated < artifact.lastDeactivated) {
        if (isWormhole(artifact)) {
            if (Date.now() > 1000 * (artifact.lastDeactivated + WORMHOLE_COOLDOWN_TIME)) return 2;
            else return 3;
        } else {
            if (Date.now() > 1000 * (artifact.lastDeactivated + ARTIFACT_COOLDOWN_TIME)) return 2;
            else return 3;
        }
    }
}

export let isActive = artifact => {
    let state = stateOfNormalArtifact(artifact);
    return state===1;
}

export let isNotActive = artifact => {
    let state = stateOfNormalArtifact(artifact);
    return state===2||state===3;
}

// judge if artifact can activate
export let canActivate = artifact => {
    let state = stateOfNormalArtifact(artifact);
    return state===2;
}

export let canPlanetActivateArtifact = (plt, artifact) => {
    if(canUse(artifact)===false) return false;
    if(isNormalArtifact(artifact)===false) return false;
    if (canActivate(artifact) === false) return false;

    if (isMonolith(artifact)) return true;
    if (isColossus(artifact)) return true;
    if (isSpaceship(artifact)) return true;
    if (isPyramid(artifact)) return true;
    if (isWormhole(artifact)) return true;
    if (isPhotoidCannon(artifact)) return true;
    // notice : the last return is for 
    // BlackDomain
    // PlanetaryShield
    // BloomFilter
    return plt.planetLevel <= 2 * artifact.rarity;
}

export let canPlanetWithdrawArtifact = (plt, artifact) => {
    if(isSpacetimeRip(plt)===false) return false;
    if(isNormalArtifact(artifact)===false) return false;
    if (isUnknown(artifact)) return false;
    if (isActive(artifact)) return false;
    if (isSpacetimeRip(plt) === false) return false;
    return plt.planetLevel >= artifact.rarity + 1;
}

export let hasArtifact = (planet) => planet.heldArtifactIds.length !== 0;

export let hasArtifactsCanActivate = plt => {
    let artifacts = df.getArtifactsWithIds(plt.heldArtifactIds);
    artifacts = artifacts.filter(canActivate);
    return artifacts.length !== 0;
}

export let hasArtifactsNotActivate = plt => {
    let artifacts = df.getArtifactsWithIds(plt.heldArtifactIds);
    artifacts = artifacts.filter(isNotActive);
    return artifacts.length !== 0;
};

export function getArtifactAndSpaceshipAmountsInFuture(plt) {
    // there are five artifacts at most on one planet
    let planetId = plt.locationId;
    var timestamp = Math.floor(0.001 * Date.now());
    let amountNow = plt.heldArtifactIds.length;

    const unconfirmed = getUnconfirmedMoves()
        .filter(move => move.to === planetId && move.artifact !== undefined);
    const arrivals = df.getAllVoyages()
        .filter(arrival => arrival.toPlanet === planetId && arrival.arrivalTime > timestamp)
        .filter(arrival => arrival.artifactId !== undefined);

    return amountNow + unconfirmed.length + arrivals.length;
}


// ===========================================================================

export function isPlanetActiveArtifact(planet, artifactId) {
    let artifact = df.getActiveArtifact(planet);
    if (artifact && artifact.id === artifactId) return true;
    else return false;
}


// include spaceship
export function getArtifactsInPlanet(planet) {
    let artifactIds = planet.heldArtifactIds;
    let artifacts = df.getArtifactsWithIds(artifactIds);
    return artifacts;
}



// include spaceship
export function getNotActiveArtifactsInPlanet(planet) {
    let artifactIds = planet.heldArtifactIds;
    let artifacts = df.getArtifactsWithIds(artifactIds);
    artifacts = artifacts.filter(it => stateOfArtifact(it) !== 1);
    return artifacts;
}


export function getCanActiveArtifactsInPlanet(planet){
    let artifactIds = planet.heldArtifactIds;
    let artifacts = df.getArtifactsWithIds(artifactIds);
    artifacts = artifacts.filter(canActivate);
    return artifacts;
}

export function getCanWithdrawArtifactsInPlanet(planet){
    let artifactIds = planet.heldArtifactIds;
    let artifacts = df.getArtifactsWithIds(artifactIds);
    artifacts = artifacts
        .filter(isNormalArtifact)
        .filter(isNotActive)
        .filter(artifact=>canPlanetWithdrawArtifact(planet,artifact));
    
    return artifacts;
}

export function getCanWithdrawArtifactsInPlanets(planets){
    let res = [];
    planets.forEach(p=>{
        let artifacts = getCanWithdrawArtifactsInPlanet(p);
        artifacts.forEach(it=>res.push(it));
    });
    return res;
}

export function planetsHaveGear(planet){
    let artifactIds = planet.heldArtifactIds;
    let artifacts = df.getArtifactsWithIds(artifactIds);
    artifacts = artifacts.filter(isShipGear);
    return artifacts.length!==0;
}

export function getArtifactName(artifact) {
    return artifact.id.slice(0, 6);
}

export function getArtifactType(artifact){
    return ArtifactTypeNames[artifact.artifactType];
}


export const PhotoidCannonCanFire = artifact => {
    if (artifact === undefined) return false;
    // console.log(artifact);
    // console.log(artifact.artifactType);
    // console.log(ArtifactType.PhotoidCannon);
    if (isPhotoidCannon(artifact) === false) return false;
    if(isActive(artifact)===false) return false;

    let activatedTime = artifact.lastActivated * 1000;
    //notice:  photoid cannon wait time may change during community round
    let waitingtime = PHOTOID_CANNON_WAIT_TIME * 1000;
    let timeStamp = Date.now();

    // console.log(activatedTime);
    // console.log(waitingtime);
    // console.log(timeStamp);

    if (activatedTime + waitingtime <= timeStamp) return true;
    return false;
};


export function planetWithActivePhotoidCannon(plt){
    let artifacts = df.getArtifactsWithIds(plt.heldArtifactIds);
    for (let i = 0; i < artifacts.length; i++) {
        let rhs = artifacts[i];
        if (isPhotoidCannon(rhs) &&  isActive(rhs)) return true;
    }
    return false;
}


export const planetWithOpenFire = (plt) => {
    let artifacts = df.getArtifactsWithIds(plt.heldArtifactIds);
    for (let i = 0; i < artifacts.length; i++) {
        let rhs = artifacts[i];
        if (PhotoidCannonCanFire(rhs) === true) return true;
    }
    return false;
};


//notice: now only have one filter judge, 
//       if planet have PhotoidCannon can fire now, judge ignore this planet
export function artifactFilter(planet) {
    if (planetWithOpenFire(planet) === true) return false;
    return true;
}