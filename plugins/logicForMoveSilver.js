import {
    getUnconfirmedMoves
} from './logicForMove';


export function getSilverMoveToPlanet(plt) {
    let planetId = plt.locationId;
    plt = df.getPlanetWithId(plt.locationId);

    let timestamp = Math.floor(Date.now() * 0.001);
    const unconfirmed = getUnconfirmedMoves().filter(move => move.to === planetId);
    const arrivals = df.getAllVoyages()
        .filter(arrival => arrival.toPlanet === planetId && arrival.arrivalTime > timestamp);
    //  console.log(arrivals);

    let silver = 0;
    unconfirmed.forEach(tx => {
        if (tx.methodName === 'move') {
            silver += tx.silver;
            // console.log(tx.silver);
        }
    });
    // console.log('silver after + unconfirmed:' + silver);
    arrivals.forEach(tx => {
        silver += tx.silverMoved;

    });
    return silver;
}

// 计算正在发但是还没有发出去的silver
export function getMySilverWillMoveFromPlanet(plt) {
    let planetId = plt.locationId;
    plt = df.getPlanetWithId(plt.locationId);
    let silver = 0;
    const unconfirmed = getUnconfirmedMoves().filter(move => move.from === planetId);

    unconfirmed.forEach(tx => {
        if (tx.methodName === 'move') {
            //tx.forces 要发出的能量
            silver += tx.silver;

        }
    });
    return silver;
}

export function getTrueSilverInTheFuture(plt) {
    plt = df.getPlanetWithId(plt.locationId);
    // console.log('now silver:' + plt.silver);
    // console.log('move to silver:' + getSilverMoveToPlanet(plt));
    // console.log('move out silver:' + getMySilverWillMoveFromPlanet(plt));
    let silver = plt.silver + getSilverMoveToPlanet(plt) - getMySilverWillMoveFromPlanet(plt);
    silver = Math.min(plt.silverCap, silver);
    silver = Math.floor(silver);
    return silver;
}

export function getNeedSilver(plt) {
    plt = df.getPlanetWithId(plt.locationId);
    let haveSilver = getTrueSilverInTheFuture(plt);
    // console.log(plt.silverCap);
    // console.log('have' + haveSilver);
    // console.log(plt.silverCap - haveSilver);
    let needSilver = Math.ceil(plt.silverCap - haveSilver);
    return needSilver;
}

export function getSilverCanSend(plt) {
    plt = df.getPlanetWithId(plt.locationId);
    let silver = plt.silver - getMySilverWillMoveFromPlanet(plt);
    silver = Math.floor(silver);
    silver = Math.max(0, silver);
    return silver;
}

// import {
//     getSilverMoveToPlanet,
//     getMySilverWillMoveFromPlanet,
//     getTrueSilverInTheFuture,
//     getNeedSilver,
//     getSilverCanSend
// } from './logicForMoveSilver';