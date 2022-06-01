import {
    getUnconfirmedMoves
} from './logicForMove';


export function getArrivalsToPlanet(plt) {
    let planetId = plt.locationId;
    let timestamp = Math.floor(Date.now() * 0.001);
    const unconfirmed = getUnconfirmedMoves().filter(move => move.to === planetId);

    const arrivals = df.getAllVoyages()
        .filter(arrival => arrival.toPlanet === planetId && arrival.arrivalTime > timestamp);

    // console.log(arrivals);
    // console.log(unconfirmed);

    return arrivals.length + unconfirmed.length;
}

export function getAimPlanetsFromPlanet(plt) {
    let planetId = plt.locationId;
    let timestamp = Math.floor(Date.now() * 0.001);
    const unconfirmed = getUnconfirmedMoves().filter(move => move.to === planetId);
    const arrivals = df.getAllVoyages()
        .filter(arrival => arrival.toPlanet === planetId && arrival.arrivalTime > timestamp);

    let resPlanets = [];
    unconfirmed.forEach(tx => {
        if (tx.methodName === 'move') {
            let fromId = tx.from;
            let plt = df.getPlanetWithId(fromId);
            resPlanets.push(plt);
        }
    });
    arrivals.forEach(tx => {
        let fromId = tx.fromPlanet;
        let plt = df.getPlanetWithId(fromId);
        resPlanets.push(plt);
    });
    return resPlanets;
}


export function getSendingFromPlanet(plt) {
    let planetId = plt.locationId;
    let timestamp = Math.floor(Date.now() * 0.001);
    const unconfirmed = getUnconfirmedMoves().filter(move => move.to === planetId);
    const arrivals = Array.from(df.getAllVoyages())
        .filter(arrival => arrival.fromPlanet === planetId && arrival.arrivalTime > timestamp);
    return arrivals.length + unconfirmed.length;
}

export function getMyEnergyMoveToPlanet(plt) {
    let planetId = plt.locationId;
    let timestamp = Math.floor(Date.now() * 0.001);
    const unconfirmed = getUnconfirmedMoves().filter(move => move.to === planetId);
    const arrivals = Array.from(df.getAllVoyages())
        .filter(arrival => arrival.toPlanet === planetId && arrival.arrivalTime > timestamp && arrival.player === df.account);
    let energy = 0;
    unconfirmed.forEach(tx => {
        if (tx.methodName === 'move') {
            let fromId = tx.from;
            let toId = tx.to;
            let sentEnergy = tx.forces;
            let dis = df.getDist(fromId, toId);
            let arrivingEnergy = df.getEnergyArrivingForMove(fromId, toId, dis, sentEnergy);
            energy += arrivingEnergy;

        }
    });
    arrivals.forEach(tx => {
        energy += tx.energyArriving;
    });
    return Math.floor(energy);
}


// 计算正在发但是还没有发出去的能量
export function getMyEnergyWillMoveFromPlanet(plt) {
    let planetId = plt.locationId;
    let energy = 0;
    const unconfirmed = getUnconfirmedMoves().filter(move => move.from === planetId);

    unconfirmed.forEach(tx => {
        if (tx.methodName === 'move') {
            let sentEnergy = tx.forces;
            energy += sentEnergy;
        }
    });
    return energy;
}



// 得到别人会送到的能量
// todo: 未经过充分测试
export function getOtherEnergyMoveToPlanet(plt) {
    let planetId = plt.locationId;
    let timestamp = Math.floor(Date.now() * 0.001);
    const arrivals = df.getAllVoyages()
        .filter(arrival =>
            arrival.toPlanet === planetId &&
            arrival.arrivalTime > timestamp &&
            arrival.player !== df.account);

    let energy = 0;

    arrivals.forEach(tx => {
        energy += tx.energyArriving;
    });

    return energy;
}

// move judge the plaentLevel between from planet and to planet
// notice: There are no rules, judgments based on experience
export const judgeLevel = (from, to) => {
    let a = from.planetLevel;
    let b = to.planetLevel;
    if (b == 0) return a >= 0 && a <= 1;
    else if (b == 1) return a >= 0 && a <= 2;
    else if (b === 2) return a >= 1 && a <= 3;
    else if (b === 3) return a >= 1 && a <= 4;
    else if (b === 4) return a >= 3 && a <= 5;
    else if (b === 5) return a >= 4 && a <= 9;
    else if (b === 6) return a >= 4 && a <= 9;
    else if (b === 7) return a >= 4 && a <= 9;
    else if (b === 8) return a >= 5 && a <= 9;
    else if (b === 9) return a >= 6;
    return true;
}



export const getTrueDefenseEnergy = plt => Math.floor(plt.energy * (plt.defense * 0.01));


// 判断from星球是否能发送能量给到to
export const judgeRange = (from, to, fromEnergyPercent = 1.0) => {
    let fromId = from.locationId;
    let toId = to.locationId;
    let fromEnergy = getEnergyCanSend(from) * fromEnergyPercent;
    let arrivingEnergy = 5; //Math.floor(to.energyCap*0.2);
    let energyNeed = Math.ceil(df.getEnergyNeededForMove(fromId, toId, arrivingEnergy));
    return energyNeed < fromEnergy;
}

// 判断发送能量是可以发送能量的50%时能到达的范围
export const judgeHalfRange = (from, to) => {
    let fromId = from.locationId;
    let toId = to.locationId;
    let fromEnergy = getEnergyCanSend(from) * 0.5;
    let arrivingEnergy = 5; //Math.floor(to.energyCap*0.2);
    let energyNeed = getEnergyNeededForMove(fromId, toId, arrivingEnergy);
    return energyNeed < fromEnergy;
}




export const judgeAttack = (from, to, fromPercent=1,toPercent = 0.01) => {
    let fromId = from.locationId;
    let toId = to.locationId;
    let fromEnergy = getEnergyCanSend(from)*fromPercent;
    let arrivingEnergy = Math.ceil(getTrueDefenseEnergy(to) + toPercent * to.energyCap);
    let energyNeed = Math.ceil(df.getEnergyNeededForMove(fromId, toId, arrivingEnergy));

    return energyNeed < fromEnergy;
}


// 没有考虑别人攻击的情况
export function getTrueEnergyInFuture(plt) {
    let energy = plt.energy +
        getMyEnergyMoveToPlanet(plt) -
        getMyEnergyWillMoveFromPlanet(plt);

    energy = Math.floor(energy);
    return Math.max(energy, 0);
}

// 没有考虑别人攻击的情况
// 考虑在将来的能量百分比
export function getTrueEnergyPercent(plt) {
    plt = df.getPlanetWithId(plt.locationId);
    let energy = getTrueEnergyInFuture(plt);
    return Math.floor(100 * energy / plt.energyCap);
}

//有所保留
export const getEnergyCanSend = plt => {
    let planetId = plt.locationId;
    plt = df.getPlanetWithId(plt.locationId);

    let energy = Math.max(0, Math.floor(plt.energy - 0.2* plt.energyCap));
   

    const unconfirmed = getUnconfirmedMoves().filter(move => move.from === planetId);
    unconfirmed.forEach(tx => {
        if (tx.methodName === 'move') {
            let sentEnergy = tx.forces;
            energy -= sentEnergy;
        }
    });
    // notice: -1 to avoid error
    let res = Math.max(0, Math.floor(energy - 1));
    return res;
}

// 发出最多的能量
export const allEnergyCanSend = plt => {
    let planetId = plt.locationId;
    plt = df.getPlanetWithId(plt.locationId);
    let energy = plt.energy;
    const unconfirmed = getUnconfirmedMoves().filter(move => move.from === planetId);

    unconfirmed.forEach(tx => {
        if (tx.methodName === 'move') {

            let sentEnergy = tx.forces;
            energy -= sentEnergy;
        }
    });
    // notice: -1 to avoid error
    let value = Math.max(0, energy - 1);
    return Math.floor(value);
}


// import {
//     getArrivalsToPlanet,
//     getAimPlanetsFromPlanet,
//     getSendingFromPlanet,
//     getMyEnergyMoveToPlanet,
//     getMyEnergyWillMoveFromPlanet,
//     getOtherEnergyMoveToPlanet,
//     judgeLevel,
//     getTrueDefenseEnergy,
//     judgeRange,
//     judgeHalfRange,
//     judgeAttack,
//     getTrueEnergyInFuture,
//     getTrueEnergyPercent,
//     getEnergyCanSend,
//     allEnergyCanSend
// } from './logicForMoveEnergy';