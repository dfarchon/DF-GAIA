import {
    MAX_WAIT_TIME_FOR_MOVE_SUBMIT,
    MAX_WAIT_TIME_FOR_MOVE_CONFIRM
} from './cfgForBasic';

import {
    colorForInfo,
    colorForWarn,
    colorForError
} from './cfgForColor';

import {
    greenInfo,
    normalInfo,
    pinkInfo,
    colorInfo,
    addToLog,
    refreshLast
} from './infoUtils';

import {
    sleep
} from './logicForBasic';


// notice: 2022.4.8 test  result:
// state ==='Confirm' but the transcation don't upload to blockchain
// but when transaction 
export function getUnconfirmedMoves() {
    let unconfirmed = Array.from(df.getUnconfirmedMoves())
        .filter(tx => {
            if (tx.state === 'Fail') return false;
            if (tx.state === 'Confirm') return false;
            return true;
        })
        .map(tx => tx.intent);
    // notice: it need to make some judges to different tx states. 
    //all tx states: Fail Init Submit Confirm
    return unconfirmed;
}


function getUnconfirmedMovesWithMaxWaitTime() {
    let timeStamp = Date.now();
    let maxWaitTimeForMoveSubmit = MAX_WAIT_TIME_FOR_MOVE_SUBMIT * 1000;
    let maxWaitTimeForMoveConfirm = MAX_WAIT_TIME_FOR_MOVE_CONFIRM * 1000;
    let unconfirmed = Array.from(df.getUnconfirmedMoves())
        .filter(tx => tx.state != 'Fail')
        .filter(tx => {
            if (tx.state === 'Submit') {
                return tx.lastUpdatedAt + maxWaitTimeForMoveSubmit >= timeStamp;
            } else if (tx.state === 'Confirm') {
                return tx.lastUpdatedAt + maxWaitTimeForMoveConfirm >= timeStamp;
            } else return true;
        })
        .map(it => it.intent);
    return unconfirmed;
}


export const waitForMoveOnchain = async (setInfo, prefix = '') => {

    let content, onClick, itemInfo;
    let unconfirmed = getUnconfirmedMovesWithMaxWaitTime();
    let cnt = 0;
    let MaxCnt = unconfirmed.length * MAX_WAIT_TIME_FOR_MOVE_CONFIRM;
    content = prefix + unconfirmed.length + ' unconfirmed move(s)';
    itemInfo = pinkInfo(content);
    addToLog(itemInfo, setInfo);

    while (true) {
        if (cnt >= MaxCnt) break; 
        unconfirmed = getUnconfirmedMovesWithMaxWaitTime();
        content = prefix+unconfirmed.length + ' unconfirmed move(s); ' + cnt + 's';
        itemInfo = normalInfo(content);
        if (cnt === 0) addToLog(itemInfo, setInfo);
        else refreshLast(itemInfo, setInfo);
        if (unconfirmed.length === 0) break;
        await sleep(4000);
        cnt+=4;
    }
}



export function getTimeForMoveInString(fromId, toId, abandoning) {
    let time = Math.ceil(df.getTimeForMove(fromId, toId, abandoning));
    let oneMinute = 60;
    let oneHour = 60 * oneMinute;
    let hours = Math.floor(time / oneHour);
    let minutes = Math.floor(time % oneHour / 60);
    let seconds = Math.ceil(time % oneHour % oneMinute);
    let res = hours + ' hour(s) ' + minutes + ' minute(s) ' + seconds + ' second(s)';
    return res;
}

export function changeSecondsToString(time) {
    let oneMinute = 60;
    let oneHour = 60 * oneMinute;
    let hours = Math.floor(time / oneHour);
    let minutes = Math.floor(time % oneHour / 60);
    let seconds = Math.ceil(time % oneHour % oneMinute);
    let res = hours + ' hour(s) ' + minutes + ' minute(s) ' + seconds + ' second(s)';
    return res;
}
// import {
//     getUnconfirmedMoves,
//     getUnconfirmedMovesWithMaxWaitTime,
//     waitForMoveOnchain,

//     getTimeForMoveInString
// } from './logicForMove';