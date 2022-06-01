import {
    destroyedFilter,
    radiusFilter
} from "./logicForPlanetState";


import {
    artifactFilter
} from './logicForArtifactState';


import {
    isMine,
    isNoOwner,
    hasOwner,
    isMain,
    isFamily,
    isKnown
} from './logicForAccount';


/*

*/
export const judgeAbandonRange = (from, to) => {
    let fromId = from.locationId;
    let toId = to.locationId;
    let fromEnergy = Math.floor(from.energy);
    let arrivingEnergy = 3;
    let abandoning = true;
    let energyNeed = Math.ceil(df.getEnergyNeededForMove(fromId, toId, arrivingEnergy, abandoning));
    return energyNeed <= fromEnergy;
}


/*
mode = 1 only abandon to me 
mode = 2 can abandon to  me or family (isKnown)
mode = 3 can abandon to all planet(s)  (hasOwner)
*/
export function calEnergyCanAbandon(p, mode = 2) {
    let candidatePlanets = Array.from(df.getAllPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(artifactFilter)
        .filter(p => {
            if (mode === 1) return isMine(p);
            if (mode === 2) return isKnown(p);
            if (mode === 3) return hasOwner(p);
            return false;
        })
        .filter(to => judgeAbandonRange(p, to))
        .sort((a, b) => {
            let aDist = getDist(p.locationId, a.locationId);
            let bDist = getDist(p.locationId, b.locationId);
            return aDist - bDist;
        });

    if (candidatePlanets.length === 0) return -1;

    let from = p;
    let to = candidatePlanets[0];
    let fromId = from.locationId;
    let toId = to.locationId;
    let arrivingEenergy = 3;
    let abandoning = true;
    let resEnergy = Math.ceil(getEnergyNeededForMove(fromId, toId, arrivingEenergy, abandoning));
    return resEnergy;
}