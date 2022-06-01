export function getJunkEnabled() {
    return df.contractConstants.SPACE_JUNK_ENABLED;
}

function getPlanetLevelJunkList() {
    return df.contractConstants.PLANET_LEVEL_JUNK;
}

export function getPlanetJunk(p) {
    let junkList = getPlanetLevelJunkList();
    return junkList[p.planetLevel];
}

export function getJunkOfPlanets(plts) {
    let junk = 0;
    plts.forEach(p => {
        junk += p.spaceJunk;
    });
    return junk;
}

export function getMyJunk() {
    return df.getPlayerSpaceJunk(df.account);
}

export function getMyJunkLimit() {
    return df.getPlayerSpaceJunkLimit(df.account);
}


export function getMyJunkBudget() {
    return getMyJunkLimit() - getMyJunk();
}