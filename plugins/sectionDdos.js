import { addToLog, colorInfo, colorInfoWithFunc } from './infoUtils';
import { artifactFilter } from './logicForArtifactState';
import { center, sleep, beginSection, endSection, getPlanetName } from './logicForBasic';
import { destroyedFilter, radiusFilter } from './logicForPlanetState';
import { getArrivalsToPlanet, getAimPlanetsFromPlanet, judgeRange, getEnergyCanSend, getOtherEnergyMoveToPlanet } from './logicForMoveEnergy';
import { waitForMoveOnchain, getTimeForMoveInString, changeSecondsToString } from './logicForMove';
import { drawRound } from './display';
import { sectionAbandon } from './sectionAbandon';
import { colorForWarn, colorForInfo, colorForError } from './cfgForColor';
import { getSilverMoveToPlanet } from './logicForMoveSilver';
import { getJunkEnabled } from './logicForJunk';
import { isNoOwner } from './logicForAccount';
import { isOther } from './logicForAccount';
import { canCapture } from './logicForInvadeAndCapture';

let colorForAimPlanets = 'red';
let colorForAroundPlanets = 'pink';
let colorForSixPlanets = 'yellow';


let ddosDrawSign = true;
let showAimPlanets = [];
let showAroundPlanets = [];
let showSixPlanets = [];

export function sectionDdosDraw(ctx) {
    if (ddosDrawSign === false) return;

    showAimPlanets.forEach(p => drawRound(ctx, p, colorForAimPlanets, 5, 1));
    showAroundPlanets.forEach(p => drawRound(ctx, p, colorForAroundPlanets, 2, 0.7));
    showSixPlanets.forEach(p => drawRound(ctx, p, colorForSixPlanets, 3, 1));
}

export function changeDdosSign() {
    ddosDrawSign = !ddosDrawSign;
}

let aimPlanets = [];

export function clearOne() {
    let plt = ui.getSelectedPlanet();
    if (plt === undefined) return;
    let rhs = aimPlanets;
    rhs = rhs.filter(p => p.locationId !== plt.locationId);
    rhs = Array.from(new Set(rhs));
    aimPlanets = rhs;
    showAimPlanets = aimPlanets;
}

export function addOne() {
    let plt = ui.getSelectedPlanet();
    if (plt === undefined) return;
    aimPlanets.push(plt);
    aimPlanets = Array.from(new Set(aimPlanets));
    showAimPlanets = aimPlanets;
}

export function clearAll() {
    aimPlanets = [];
    showAimPlanets = [];
}


export async function sectionDdos(setInfo) {

    beginSection('[DDOS] === ddos begin ===', setInfo);
    ddosDrawSign = true;
    let content, onClick, itemInfo;

    aimPlanets = Array.from(new Set(aimPlanets));
    showAimPlanets = aimPlanets;

    if (aimPlanets.length === 0) {
        content = '[DDOS] [INFO] no aim planet(s)';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
        endSection('[DDOS] === ddos end ===', setInfo);
        await sleep(1000);
        ddosDrawSign = false;
        return;
    }

    content = '[DDOS] [WARN] wait for move on chain before';
    itemInfo = colorInfo(content, colorForWarn);
    addToLog(itemInfo, setInfo);
    await waitForMoveOnchain(setInfo,'[DDOS] ');
    await sleep(1000);

    showAroundPlanets = [];
    showSixPlanets = [];

    for (let i = 0; i < aimPlanets.length; i++) {
        let aimPlanet = aimPlanets[i];
        content = '[DDOS] [' + getPlanetName(aimPlanet) + '] aim planet ' + i;
        onClick = () => center(aimPlanet);
        itemInfo = colorInfoWithFunc(content, colorForAimPlanets, onClick);
        addToLog(itemInfo, setInfo);

        if (getArrivalsToPlanet(aimPlanet) === 6) {
            content = '[DDOS] arrivals = 6';
            itemInfo = colorInfo(content, colorForInfo);
            addToLog(itemInfo, setInfo);

            let timestamp = new Date().getTime();
            timestamp = Math.floor(timestamp * 0.001);

            const arrivals = df.getAllVoyages()
                .filter(arrival => arrival.toPlanet === aimPlanet.locationId && arrival.arrivalTime > timestamp && arrival.player === df.account);
            //   console.log(arrivals);
            for (const tx of arrivals) {
                //  console.log(tx.arrivalTime-timestamp);
                content = '[DDOS] '+changeSecondsToString(tx.arrivalTime - timestamp);
                //  console.log(content);

                itemInfo = colorInfo(content, colorForInfo);
                addToLog(itemInfo, setInfo);
            }
            // to refresh info
            await sleep(1000);
            continue;
        }

        let junkEnabled = getJunkEnabled();
        let needJunk = aimPlanet.spaceJunk;
        let myJunk = df.getPlayerSpaceJunk(df.account);
        let junkLimit = df.contractConstants.SPACE_JUNK_LIMIT;
        if (junkEnabled && isNoOwner(aimPlanet) && needJunk + myJunk > junkLimit) {
            content = '[DDOS] [WARN] junk is not enough :-c';
            itemInfo = colorInfo(content, colorForWarn);
            addToLog(itemInfo, setInfo);
            await sectionAbandon(setInfo, needJunk, 5,0.6, [], []);
        }

        let myPlanets = Array.from(df.getMyPlanets())
            .filter(destroyedFilter)
            .filter(radiusFilter)
            .filter(artifactFilter)
            .filter(p => p.planetLevel >= 1 && p.planetLevel <= aimPlanet.planetLevel)
            .filter(p => aimPlanets.includes(p) === false)
            .filter(p => getOtherEnergyMoveToPlanet(p) === 0)
            .filter(p => judgeRange(p, aimPlanet))
            .filter(p=>canCapture(p,false)===false)
            .sort((a, b) => {
                let aTime = df.getTimeForMove(a.locationId, aimPlanet.locationId);
                let bTime = df.getTimeForMove(b.locationId, aimPlanet.locationId);
                return bTime - aTime;
            });

        showAroundPlanets = myPlanets;
        showSixPlanets = [];
        showSixPlanets = getAimPlanetsFromPlanet(aimPlanet);



        let arrivalsBefore = getArrivalsToPlanet(aimPlanet);
        content = '[DDOS] ' + arrivalsBefore + ' arrival(s) before';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);

        let needMovesAmount = 6 - arrivalsBefore;
        // because

        needMovesAmount = Math.max(0, needMovesAmount);

        let movesAddCnt = 0;
        content = '[DDOS] ' + needMovesAmount + ' move(s) need';
        itemInfo = colorInfo(content, colorForInfo);
        addToLog(itemInfo, setInfo);
        console.log(myPlanets);



        for (let j = 0; j < myPlanets.length; j++) {
            if (movesAddCnt >= needMovesAmount) break;

            let fromPlanet = myPlanets[j];
            let toPlanet = aimPlanet;
            fromPlanet = df.getPlanetWithId(fromPlanet.locationId);
            toPlanet = df.getPlanetWithId(toPlanet.locationId);


            let energyBudget = getEnergyCanSend(fromPlanet);
            let energySpent = 0;

            let silverBudget = Math.floor(fromPlanet.silver);
            let silverSpent = 0;

            while (true) {
                if (movesAddCnt >= needMovesAmount) break;
                const energyArriving = 5;
                const energyNeeded = Math.ceil(df.getEnergyNeededForMove(fromPlanet.locationId, toPlanet.locationId, energyArriving));
                let energyLeft = Math.floor(energyBudget - energySpent);
                console.warn(energyLeft);
                if (energyLeft < energyNeeded) break;
                movesAddCnt++;
                energySpent += energyNeeded;

                let silverLeft = Math.floor(silverBudget - silverSpent);
                let toPlanetSilver = Math.floor(getSilverMoveToPlanet(toPlanet) + toPlanet.silver);
                toPlanetSilver = Math.min(toPlanetSilver, toPlanet.silverCap);
                let silverNeeded = Math.floor(toPlanet.silverCap - toPlanetSilver);

                silverNeeded = Math.min(silverNeeded, silverLeft);

                silverNeeded = Math.max(silverNeeded, 0);
                silverSpent += silverNeeded;

                // console.warn('silverLeft:' + silverLeft);
                // console.warn('silverNeeded:' + silverNeeded);


                content = '[DDOS] [' + getPlanetName(fromPlanet) + '] from planet ' + j + ' send ' + movesAddCnt + ' move(s)';
                onClick = () => center(fromPlanet);

                itemInfo = colorInfoWithFunc(content, colorForSixPlanets, onClick);
                addToLog(itemInfo, setInfo);
                content = '[DDOS] from planet carry ' + silverNeeded + ' silver';
                itemInfo = colorInfo(content, colorForInfo);
                addToLog(itemInfo, setInfo);
                content = '[DDOS] '+getTimeForMoveInString(fromPlanet.locationId, toPlanet.locationId);
                itemInfo = colorInfo(content, colorForInfo);
                addToLog(itemInfo, setInfo);

                showSixPlanets.push(fromPlanet);
                showSixPlanets = Array.from(new Set(showSixPlanets));

                try {

                    await df.move(fromPlanet.locationId, toPlanet.locationId, energyNeeded, silverNeeded);
                    if(movesAddCnt%3==1) await waitForMoveOnchain(setInfo,'[DDOS] ');

                } catch (e) {
                    content = '[DDOS] [ERROR] move revert';
                    itemInfo = colorInfoWithFunc(content, colorForError);
                    addToLog(itemInfo, setInfo);
                    await sleep(1000);
                }
            }
        }

        // to refresh info 
        await sleep(2000);
        let arrivalsAfter = getArrivalsToPlanet(aimPlanet);

        if (arrivalsAfter === 6) {
            content = '[DDOS] this planet arrivals == 6';
            itemInfo = colorInfo(content, colorForInfo);
            addToLog(itemInfo, setInfo);
        } else {
            content = '[DDOS] [WARN] '+arrivalsAfter + ' arrival(s)';
            itemInfo = colorInfo(content, colorForWarn);
            addToLog(itemInfo, setInfo);
        }
    }
    endSection('[DDOS] === ddos finish ===', setInfo,'[DDOS] ');
    await sleep(1000);
    ddosDrawSign = false;
}