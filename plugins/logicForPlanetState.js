import {
    PlanetType,
    SpaceType,
} from "https://cdn.skypack.dev/@darkforest_eth/types";


export let getEnergyPercent = (planet) => {
    if (!planet) return 0;
    return Math.floor(planet.energy / planet.energyCap * 100);
}

export let getSilver = (planet) => {
    if (!planet) return 0;
    return Math.floor(planet.silver);
}

export const destroyedFilter = plt => {
    return plt.location !== undefined && plt.destroyed === false;
}

const inRange = (x, y, x1, y1, x2, y2) => {
    let xMin = Math.min(x1, x2);
    let xMax = Math.max(x1, x2);
    let yMin = Math.min(y1, y2);
    let yMax = Math.max(y1, y2);
    if (xMin <= x && x <= xMax && yMin <= y && y <= yMax) return true;
    else return false;
};

export const rangeFilter = (planet, x1, y1, x2, y2) => {
    if (destroyedFilter(planet) === false) return false;
    let x = planet.location.coords.x;
    let y = planet.location.coords.y;
    return inRange(x, y, x1, y1, x2, y2);
};

// this main for dfdao round
export const radiusFilter = plt => {
    let radius = df.worldRadius;
    let centerCoords = { x: 0, y: 0 };
    let dist = df.getDistCoords(plt.location.coords, centerCoords);
    return dist < radius;
}

// 4 spaceType
export const inBlackSpace = planet => planet.spaceType === SpaceType.DEEP_SPACE;
export const inGreenSpace = planet => planet.spaceType === SpaceType.DEAD_SPACE;
export const inBlueSpace = planet => planet.spaceType === SpaceType.NEBULA;
export const inDarkblueSpace = planet => planet.spaceType === SpaceType.SPACE;



export const inLevel = (p, fi, se) => {
    let rhs = p.plaentLevel;
    let minLevel = Math.min(fi, se);
    let maxLevel = Math.max(fi, se);
    return minLevel <= rhs && rhs <= maxLevel;
}

export const levelFilter = (plt, l, r) => inLevel(plt, l, r);

// 5 planet type
export const isPlanet = planet => planet.planetType === PlanetType.PLANET;
export const isAsteroidField = planet => planet.planetType === PlanetType.SILVER_MINE;
export const isNotAsteroidField = planet => planet.planetType !== PlanetType.SILVER_MINE;
export const isFoundry = planet => planet.planetType === PlanetType.RUINS;
export const isSpacetimeRip = planet => planet.planetType === PlanetType.TRADING_POST;
export const isQuasar = planet => planet.planetType === PlanetType.SILVER_BANK;
export const isNotQuasar = p => isQuasar(p) === false;

//PlanetBonus
//[energyCap, energyGrowth, range, speed, defense]
export const isNoBonus = planet => {
    return planet.bonus[0] === false &&
        planet.bonus[1] === false &&
        planet.bonus[2] === false &&
        planet.bonus[3] === false &&
        planet.bonus[4] === false;
}

export const isEnergyCapBonus = planet => planet.bonus[0];
export const isEnergyGrowthBonus = planet => planet.bonus[1];
export const isRangeBonus = planet => planet.bonus[2];
export const isSpeedBonus = planet => planet.bonus[3];
export const isDefenseBonus = planet => planet.bonus[4];


export const inViewport = planet => {
    if (destroyedFilter(planet) === false) return false;
    const viewport = ui.getViewport();
    let left = viewport.getLeftBound();
    let right = viewport.getRightBound();
    let top = viewport.getTopBound();
    let bottom = viewport.getBottomBound();
    let { x, y } = planet.location.coords;
    return x >= left && x <= right && y >= bottom && y <= top;
}



// can cal the true range of one planet in map

// ## MoveShipsDecay   
// ====== popCap = fromPlanet's energyCap ======
// - inputs: fromPlanet, maxDist, shipsSent. output: ships arriving
// - calculate effective range
//     - if planet is movement buffed, return range * 4
//     - else return range
// - decay = 0.5 ^ (maxDist / effectiveRange)
// - ships arriving = decay * shipsSent - 0.05 * popCap
// - if ships arriving < 0, revert 

//[boolean, boolean, boolean, boolean, boolean, boolean]
//[energyCap, energyGrowth, range, speed, defense]

export function calRange(p) {
    let popCap = p.energyCap;
    let effectiveRange = p.range;
    let shipsSent = p.energyCap;
    let b = 0.05 * popCap / shipsSent;

    let maxDist = -effectiveRange * Math.log2(b);
    return maxDist;
}



// import {
//     getEnergyPercent,
//     getSilver,
//     destroyedFilter,
//     rangeFilter,
//     radiusFilter,
//     inBlackSpace,
//     inGreenSpace,
//     inBlueSpace,
//     inDarkblueSpace,
//     levelFilter,
//     isPlanet,
//     isAsteroidField,
//     isNotAsteroidField,
//     isFoundry,
//     isSpacetimeRip,
//     isQuasar,
//     isNotQuasar,
//     isNoBonus,
//     isEnergyCapBonus,
//     isEnergyGrowthBonus,
//     isRangeBonus,
//     isSpeedBonus,
//     isDefenseBonus,
//     inViewport,
//     calRange
// } from './logicForPlanetState';