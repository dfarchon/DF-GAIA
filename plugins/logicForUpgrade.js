import {
    inBlueSpace,
    inDarkblueSpace
} from './logicForPlanetState';

let getPlanetRank = (planet) => {
    if (!planet) return 0;
    return planet.upgradeState.reduce((a, b) => a + b);
};

function getPlanetMaxRank(planet) {
    if (!planet) return 0;
    if (inBlueSpace(planet)) return 3;
    if (inDarkblueSpace(planet)) return 4;
    return 5;
}

export let isPlanetAtMaxRank = (planet) => {
    let nowRank = getPlanetRank(planet);
    let maxRank = getPlanetMaxRank(planet);
    return nowRank === maxRank;
}

export const isPlanetNotAtMaxRank = (plt) => {
    return isPlanetAtMaxRank(plt) === false;
}

// need enough silver
export let canPlanetUpgrade = (planet) => {
    if (!planet) return false;
    return df.entityStore.constructor.planetCanUpgrade(planet);
};

export let canStateUpgrade = (planet, stat) => {
    if (!planet) return false;
    // [defenseCan, rangeCan, speedCan]
    let canUpgrade = planet.upgradeState.map((level) => {
        if (inBlueSpace(planet)) return level < 3;
        return level < 4;
    });
    return canUpgrade[stat];
}

export let getSilverNeededForUpgrade = (planet) => {
    if (!planet) return 0;
    let totalLevel = planet.upgradeState.reduce((a, b) => a + b);
    return Math.floor((totalLevel + 1) * 0.2 * planet.silverCap);
};

export let getPlanetUpgradeStateInString = (planet) => {
    // defense range speed 
    let state = planet.upgradeState;
    let res = '';
    res += state[0] + ' defense + ';
    res += state[1] + ' range + ';
    res += state[2] + ' speed';
    return res;
}

// import {
//     isPlanetAtMaxRank,
//     isPlanetNotAtMaxRank,
//     canPlanetUpgrade,
//     canStateUpgrade,
//     getSilverNeededForUpgrade,
//     getPlanetUpgradeStateInString
// } from './logicForUpgrade';