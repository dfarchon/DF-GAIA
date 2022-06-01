import {
    notOwnerAddress,
    mainAddress,
    familyAddresses
} from './cfgForBasic';


export function isMine(p) {
    return p.owner === df.account;
}


export function isNoOwner(p) {
    return p.owner === notOwnerAddress;
}

export function hasOwner(p) {
    return p.owner !== notOwnerAddress;
}


export function isOther(p){
    return isMine(p)===false && hasOwner(p);
}


export function isMain(p) {
    return p.owner === mainAddress;
}

export function isFamily(p) {
    return familyAddresses.includes(p.owner);
}

export function isKnown(p) {
    return isMain(p) || isFamily(p);
}


// import {
//     isMine,
//     isNoOwner,
//     hasOwner,
//     isMain,
//      isOther,
//     isFamily,
//     isKnown
// } from './logicForAccount';