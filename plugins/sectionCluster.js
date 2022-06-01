import {
    CLUSTER_COLORS,
} from "./cfgForColor";

import {
    DEFAULT_CLUSTER_NUM,
    MAX_CLUSTER_NUM,
} from "./cfgForBasic";

import {
    drawRound,
} from "./display";

import {
    addToLog,
    normalInfo,
} from "./infoUtils";

import {
    sleep,
    beginSection,
    endSection,
} from "./logicForBasic";

import {
    destroyedFilter,
    radiusFilter
} from './logicForPlanetState';


import {
    clusterPlanet,
} from "./logicForCluster.js";


let showClusterPlanets = [];
let planetsAssignments = [];
let drawSign = false;

// for debug only
export async function showClusterMs(setInfo, show_time_ms = 2000) {
    drawSign = !drawSign;//click twice to disable
    await sectionCluster(setInfo, DEFAULT_CLUSTER_NUM, 1, 1500, 1000, true);
}

// draw cicles on clusters
export function sectionClusterDraw(ctx) {
    if (drawSign === false) return;
    showClusterPlanets.forEach((p, idx) => drawRound(ctx, p, CLUSTER_COLORS[planetsAssignments[idx] % MAX_CLUSTER_NUM], 2.5, 0.7));
}

/**
 * sectionCluster
 * @desc Clustering assignments, with K-means
 * @param {Object} setInfo - setInfo
 * @param {number} cluster_num - num of clusters
 * @param {number} min_level - minimal planet level to operate on
 * @param {number} show_time_ms - showing time duration for circles
 * @param {number} max_iters - max iterations for K-means
 * @param {boolean} always_show - whether to keep showing the circles
 */
export async function sectionCluster(setInfo, cluster_num = DEFAULT_CLUSTER_NUM, min_level = 1, show_time_ms = 1500, max_iters = 1000, always_show = false) {

    beginSection("[CLUSTER] === cluster begin ===", setInfo);

    showClusterPlanets = [];
    planetsAssignments = [];
    if (!always_show) {
        drawSign = true;
    }
    showClusterPlanets = Array.from(df.getMyPlanets())
        .filter(destroyedFilter)
        .filter(radiusFilter)
        .filter(p => p.planetLevel >= min_level);
    planetsAssignments = clusterPlanet(showClusterPlanets, cluster_num, 100, max_iters, null);
    for (let i = 0; i < cluster_num; i++) {
        let ni = planetsAssignments.filter(it => it === i).length;
        let itemInfo = normalInfo("[CLUSTER] cluster" + i + ": " + ni + " planet(s)");
        addToLog(itemInfo, setInfo);
    }
    await sleep(show_time_ms);
    if (!always_show) {
        drawSign = false;
    }
    endSection("[CLUSTER] === cluster finish ===", setInfo,"[CLUSTER] ");
}