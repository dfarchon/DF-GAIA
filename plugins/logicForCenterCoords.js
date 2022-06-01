import {
    destroyedFilter,
    radiusFilter
} from './logicForPlanetState';

export function getCenterCoords(planets) {
    
    let molecularX = 0;
    let denominatorX = 0;
    let molecularY = 0;
    let denominatorY = 0;

    for (const p of planets) {
        if (destroyedFilter(p) === false) continue;
        if (radiusFilter(p) === false) continue;
        let coords = p.location.coords;
        molecularX += coords.x * (1+p.planetLevel);
        denominatorX += p.planetLevel+1;
        molecularY += coords.y * (1+p.planetLevel);
        denominatorY +=(1+p.planetLevel);
    }

    let x = 1.0 * molecularX / denominatorX;
    let y = 1.0 * molecularY / denominatorY;
    return { x: x, y: y };
}