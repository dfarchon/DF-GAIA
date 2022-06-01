
import{getCurrentBlockNumber} from './logicForInvadeAndCapture';


export function blocksLeftToProspectExpiration(
    currentBlockNumber,
    prospectedBlockNumber
) {
    return (prospectedBlockNumber || 0) + 255 - currentBlockNumber;
}

export function prospectExpired(currentBlockNumber, prospectedBlockNumber) {
    return blocksLeftToProspectExpiration(currentBlockNumber, prospectedBlockNumber) <= 0;
}

export function isFindable(planet) {
    let currentBlockNumber = getCurrentBlockNumber();
    // console.log('------------------------------------');
    // console.log(currentBlockNumber !== undefined );
    // console.log(df.isPlanetMineable(planet));
    // console.log(planet.prospectedBlockNumber !== undefined);
    // console.log(!planet.hasTriedFindingArtifact);
    // console.log(!planet.unconfirmedFindArtifact);
    // console.log( !prospectExpired(currentBlockNumber, planet.prospectedBlockNumber));
    return (
        currentBlockNumber !== undefined &&
        df.isPlanetMineable(planet) && 
        planet.prospectedBlockNumber !== undefined &&
        !planet.hasTriedFindingArtifact &&
        !planet.unconfirmedFindArtifact &&
        !prospectExpired(currentBlockNumber, planet.prospectedBlockNumber)
    );
}

export function isProspectable(planet) {
    return df.isPlanetMineable(planet) &&
        planet.prospectedBlockNumber === undefined &&
        planet.hasTriedFindingArtifact === false;
}


