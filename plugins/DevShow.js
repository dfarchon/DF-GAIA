//
//  author: https://twitter.com/DfArchon
//
// df-gaia
//

import {
    html,
    render,
    useState,
    useLayoutEffect,
    useEffect
} from "https://unpkg.com/htm@3/preact/standalone.module.js";


import { PlanetLevel, PlanetType, SpaceType } from
    "https://cdn.skypack.dev/@darkforest_eth/types";


import {
    infoMsg,
    buttonStyle,
    longButtonStyle,
    divStyle,
    infoListStyle,
    selectStyle,
    checkbox,
    getInfoListStyle,
    getButtonStyle
} from './infoUtils';


import {
    sectionShowDraw
} from './sectionShow';
import { isMine, isNoOwner, isOther } from "./logicForAccount";

import {
    inBlackSpace,
    inBlueSpace,
    inDarkblueSpace,
    inGreenSpace,
    isAsteroidField,
    isPlanet,
    isSpacetimeRip,
    isFoundry,
    isQuasar,
    inViewport
} from './logicForPlanetState';


import {
    colorForShowEnergyGrowthBonusPlanets,
    switchShowEnergyGrowthBonus,
    colorForShowSpeedBonusPlanets,
    switchShowSpeedBonus,
    colorForShowRangeBonusPlanets,
    switchShowRangeBonus,

    colorForShowCanCapturePlanets,
    switchShowCanCapture,
    colorForShowNotCapturePlanets,
    switchShowNotCapture,
    colorForShowHaveCaptuedPlanets,
    switchShowHaveCaptured,
    colorForShowInvadeButNotCapturePlanets,
    switchShowInvadeButNotCapture,

    colorForShowHaveArtifactsPlanets,
    switchShowHaveArtifacts,
    colorForShowHaveActivatePhotoidCannonPlanets,
    switchShowHaveActivePhotoidCannon,
    colorForShowOpenFirePlanets,
    switchShowPlanetWithOpenFire,
    colorForShowAllPlanets,
    switchShowAllPlanets
} from './sectionShow';

import { drawCenter, drawClock } from "./display";

let pinkCircleSign = true;

function dfGaia() {
    const [info, setInfo] = useState(infoMsg);
    const [infoDownSign, setInfoDownSign] = useState(true);

    //=======================================================
    function pageDown() {
        let el = document.getElementById('devshow');
        el.scrollTop = el.scrollHeight;
    }
    useLayoutEffect(() => {
        let interval;
        if (infoDownSign) {
            interval = setInterval(() => { pageDown(); }, 2000);
        } else {
            clearInterval(interval);
        }
        return () => {
            clearInterval(interval);
        }
    }, [infoDownSign]);


    function changeInfoDownSign() {
        console.warn('XXX CHANGE_INFO_DOWN END XXX');
        if (infoDownSign === true) setInfoDownSign(false);
        else setInfoDownSign(true);

    }
    //====================================================================================

    useEffect(() => {
        return () => {
            // notice: to put all stop function here

            console.warn('XXX DF-GAIA END XXX');
        }
    }, []);

    const [leftLevel, setLeftLevel] = useState(3);
    const [rightLevel, setRightLevel] = useState(9);

    const PLANET_LEVELS = Object.values(PlanetLevel).map((level) => ({
        value: level,
        text: level.toString(),
    }));

    const leftLevelSelect = html`
    <select style=${selectStyle} value=${leftLevel} onChange=${(e) => setLeftLevel(e.target.value)}>
        ${PLANET_LEVELS.map(({ value, text }) => html`<option value=${value}>${text}</option>`)}
    </select>
    `;

    const rightLevelSelect = html`
    <select style=${selectStyle} value=${rightLevel} onChange=${(e) => setRightLevel(e.target.value)}>
        ${PLANET_LEVELS.map(({ value, text }) => html`<option value=${value}>${text}</option>`)}
    </select>
    `;

    let levelButton = (l, r) => html`<button 
        style=${getButtonStyle('60px', '25px')}
        onClick=${() => { setLeftLevel(l); setRightLevel(r); }}
        >${l + '-' + r}</button>`;

    let levelComponent = html`<div style=${{
        margin: "3px",
        padding: "2px",
        backgroundColor: 'rgb(40,40,40)'
    }}> 
      ${leftLevelSelect}
      ${' '}
      ${rightLevelSelect}
      <div>
      ${levelButton(2, 3)}
      ${levelButton(3, 9)}
      ${levelButton(4, 9)}
      ${levelButton(5, 9)}
      </div>
    </div>`;



    const [hasPlanet, setHasPlanet] = useState(true);
    const [hasAsteroidField, setHasAsteroidField] = useState(true);
    const [hasFoundry, setHasFoundry] = useState(true);
    const [hasSpacetimeRip, setHasSpacetimeRip] = useState(true);
    const [hasQuasar, setHasQuasar] = useState(false);

    let planetCheckbox = checkbox(hasPlanet, setHasPlanet, '1.Planet');
    let asteroidFieldCheckbox = checkbox(hasAsteroidField, setHasAsteroidField, '2.AsteroidField');
    let foundryCheckbox = checkbox(hasFoundry, setHasFoundry, '3.Foundry');
    let spacetimeRipCheckbox = checkbox(hasSpacetimeRip, setHasSpacetimeRip, '4.SpacetimeRip');
    let quasarCheckbox = checkbox(hasQuasar, setHasQuasar, '5.quasar');

    let planetTypeButton = (text, onClick) => html`<button 
        style=${getButtonStyle('50px', '25px')}
        onClick=${onClick}
        >${text}</button>`;
    let text1 = '3';
    let onClick1 = () => {
        setHasPlanet(false);
        setHasAsteroidField(false);
        setHasFoundry(true);
        setHasSpacetimeRip(false);
        setHasQuasar(false);
    };

    let text2 = '1-4';
    let onClick2 = () => {
        setHasPlanet(true);
        setHasAsteroidField(true);
        setHasFoundry(true);
        setHasSpacetimeRip(true);
        setHasQuasar(false);
    };

    let planetTypeComponent = html`
        <div style=${{
            margin: '3px',
            padding: '2px',
            height: '160px',
            width: '160px',
            textAlign: 'left',
            float: 'left',
            backgroundColor: 'rgb(40,40,40)'
        }}>
        ${planetCheckbox}
        ${asteroidFieldCheckbox}
        ${foundryCheckbox}
        ${spacetimeRipCheckbox}
        ${quasarCheckbox}
        <div style=${{ textAlign: 'center' }}>
        ${planetTypeButton(text1, onClick1)}
        ${planetTypeButton(text2, onClick2)}
        </div>
        </div>`;

    const [ohBlackSpace, setOhBlackSpace] = useState(true);
    const [ohGreenSpace, setOhGreenSpace] = useState(true);
    const [ohBlueSpace, setOhBlueSpace] = useState(true);
    const [ohDarkblueSpace, setOhDarkblueSpace] = useState(true);

    let blackSpaceCheckbox = checkbox(ohBlackSpace, setOhBlackSpace, 'BlackSpace');
    let greenSpaceCheckbox = checkbox(ohGreenSpace, setOhGreenSpace, 'GreenSpace');
    let blueSpaceCheckbox = checkbox(ohBlueSpace, setOhBlueSpace, 'BlueSpace');
    let darkblueSpaceCheckbox = checkbox(ohDarkblueSpace, setOhDarkblueSpace, 'DarkblueSpace');
    let sapceTypeComponent = html`
    <div style=${{
            marginRight: '3px',
            marginTop: '3px',
            marginBottom: '3px',
            padding: '2px',
            height: '110px',
            width: '148px',
            textAlign: 'left',
            float: 'right',
            backgroundColor: 'rgb(40,40,40)'
        }}>
        ${greenSpaceCheckbox}
        ${blackSpaceCheckbox}
        ${darkblueSpaceCheckbox}
        ${blueSpaceCheckbox}
    </div>`;

    const [pinkCircle, setPinkCircle] = useState(true);
    let pinkCircleCheckbox = checkbox(pinkCircle, setPinkCircle, 'pink circle');
    let pinkCircleComponent = html`
    <div style=${{
            margin: '3px',
            padding: '2px',
            height: '25px',
            width: '160px',
            textAlign: 'left',
            float: 'left',
            backgroundColor: 'rgb(40,40,40)'
        }}
        onClick=${() => {
            pinkCircleSign = !pinkCircleSign;
        }}
    >
        ${pinkCircleCheckbox}
    </div>`;

    const [onlyInViewport, setOnlyInViewport] = useState(true);
    let viewportCheckbox = checkbox(onlyInViewport, setOnlyInViewport, 'only in view');
    let viewportComponent = html`
    <div style=${{
            margin: '3px',
            padding: '2px',
            height: '25px',
            width: '160px',
            textAlign: 'left',
            float: 'left',
            backgroundColor: 'rgb(40,40,40)'
        }}>
        ${viewportCheckbox}
    </div>`;

    const [hasMe, setHasMe] = useState(true);
    const [hasNoOwner, setHasNoOwner] = useState(true);
    const [hasOther, setHasOther] = useState(true);

    let hasMeCheckbox = checkbox(hasMe, setHasMe, '1.has Me');
    let hasNoOwnerCheckbox = checkbox(hasNoOwner, setHasNoOwner, '2.has NoOwner');
    let hasOtherCheckbox = checkbox(hasOther, setHasOther, '3.has Other');

    let accountButton = (text, onClick, width = '40px', height = '25px') => html`<button 
    style=${getButtonStyle(width, height)}
    onClick=${onClick}
    >${text}</button>`;
    let accountText1 = '1-3';
    let accountOnClick1 = () => {
        setHasMe(true);
        setHasNoOwner(true);
        setHasOther(true);
    };


    let accountText2 = '1-2';
    let accountOnClick2 = () => {
        setHasMe(true);
        setHasNoOwner(true);
        setHasOther(false);
    };
    let accountText3 = '3';
    let accountOnClick3 = () => {
        setHasMe(false);
        setHasNoOwner(false);
        setHasOther(true);
    };


    let accountComponent = html`
    <div style=${{
            marginRight: '3px',
            marginTop: '3px',
            marginBottom: '3px',
            padding: '2px',
            height: '108px',
            width: '148px',
            textAlign: 'left',
            float: 'right',
            backgroundColor: 'rgb(40,40,40)'
        }}>
        ${hasMeCheckbox}
        ${hasNoOwnerCheckbox}
        ${hasOtherCheckbox}
        <div>
            ${accountButton(accountText1, accountOnClick1)}
            ${accountButton(accountText2, accountOnClick2)}
            ${accountButton(accountText3, accountOnClick3)}

        </div>
    </div>`;

    function judgeLevel(planet) {
        let minLevel = Math.min(leftLevel, rightLevel);
        let maxLevel = Math.max(leftLevel, rightLevel);
        return minLevel <= planet.planetLevel && planet.planetLevel <= maxLevel;
    }

    function judgePlanetType(planet) {
        if (hasPlanet && isPlanet(planet)) return true;
        if (hasAsteroidField && isAsteroidField(planet)) return true;
        if (hasFoundry && isFoundry(planet)) return true;
        if (hasSpacetimeRip && isSpacetimeRip(planet)) return true;
        if (hasQuasar && isQuasar(planet)) return true;
        return false;
    }

    function judgeSpaceType(plt) {
        if (ohBlackSpace && inBlackSpace(plt)) return true;
        if (ohGreenSpace && inGreenSpace(plt)) return true;
        if (ohBlueSpace && inBlueSpace(plt)) return true;
        if (ohDarkblueSpace && inDarkblueSpace(plt)) return true;
        return false;
    }

    function judgeAccount(planet) {
        if (hasMe && isMine(planet)) return true;
        if (hasNoOwner && isNoOwner(planet)) return true;
        if (hasOther && isOther(planet)) return true;
        return false;
    }

    function judgeViewport(planet) {
        if (onlyInViewport) return inViewport(planet);
        else return true;
    }

    function frontFilter(planet) {
        return judgeLevel(planet) &&
            judgePlanetType(planet) &&
            judgeSpaceType(planet) &&
            judgeAccount(planet) &&
            judgeViewport(planet);
    }

    //energy growth bonus
    const [energyGrowthBonus, setEnergyGrowthBonus] = useState(false);
    function showEnergyGrowthBonus() {
        setEnergyGrowthBonus(!energyGrowthBonus);
        switchShowEnergyGrowthBonus(frontFilter, setInfo);
    }
    let energyGrowthBonusButton = html`<button style=${energyGrowthBonus ?
        getButtonStyle('250px', '25px', 'black', colorForShowEnergyGrowthBonusPlanets) :
        getButtonStyle('250px', '25px')
        } onClick=${showEnergyGrowthBonus}>2 * energy growth</button>`;

    //speed bonus
    const [speedBonus, setSpeedBonus] = useState(false);
    function showSpeedBonus() {
        setSpeedBonus(!speedBonus);
        switchShowSpeedBonus(frontFilter, setInfo);
    }
    let speedBonusButton = html`<button style=${speedBonus ?
        getButtonStyle('100px', '25px', 'black', colorForShowSpeedBonusPlanets) :
        getButtonStyle('100px', '25px')
        } onClick=${showSpeedBonus}>2 * speed</button>`;

    //range bonus
    const [rangeBonus, setRangeBonus] = useState(false);
    function showRangeBonus() {
        setRangeBonus(!rangeBonus);
        switchShowRangeBonus(frontFilter, setInfo);
    }
    let rangeBonusButton = html`<button style=${rangeBonus ?
        getButtonStyle('100px', '25px', 'black', colorForShowRangeBonusPlanets) :
        getButtonStyle('100px', '25px')
        } onClick=${showRangeBonus}>2 * range</button>`;

    // can capture
    const [canCapture, setCanCapture] = useState(false);
    function showCanCapture() {
        setCanCapture(!canCapture);
        switchShowCanCapture(frontFilter, setInfo);
    }
    let canCaptureButton = html` <button style=${canCapture ?
        getButtonStyle('150px', '25px', 'black', colorForShowCanCapturePlanets) :
        getButtonStyle('150px', '25px')
        } onClick=${showCanCapture}>can capture </button>
    `;

    // not capture
    const [notCapture, setNotCapture] = useState(false);
    function showNotCapture() {
        setNotCapture(!notCapture);
        switchShowNotCapture(frontFilter, setInfo);
    }
    let notCaptureButton = html`<button style=${notCapture ?
        getButtonStyle('150px', '25px', 'black', colorForShowNotCapturePlanets) :
        getButtonStyle('150px', '25px')
        } onClick=${showNotCapture}>not capture</button>`;

    // have captured
    const [haveCaptured, setHaveCaptured] = useState(false);
    function showHaveCaptured() {
        setHaveCaptured(!haveCaptured);
        switchShowHaveCaptured(frontFilter, setInfo);
    }
    let haveCapturedButton = html`<button style=${haveCaptured ?
        getButtonStyle('150px', '25px', 'white', colorForShowHaveCaptuedPlanets) :
        getButtonStyle('150px', '25px')
        } onClick=${showHaveCaptured}>have captured</button>`;

    //invade but not capture
    const [invadeButNotCapture, setInvadeButNotCapture] = useState(false);
    function showInvadeButNotCapture() {
        setInvadeButNotCapture(!invadeButNotCapture);
        switchShowInvadeButNotCapture(frontFilter, setInfo);
    }
    let invadeButNotCaptureButton = html`<button style=${invadeButNotCapture ?
        getButtonStyle('150px', '25px', 'black', colorForShowInvadeButNotCapturePlanets) :
        getButtonStyle('150px', '25px')
        } onClick=${showInvadeButNotCapture}>i but not c</button>`;

    //have can activate artifact(s)
    const [haveArtifacts, setHaveArtifacts] = useState(false);
    function showHaveArtifacts() {
        setHaveArtifacts(!haveArtifacts);
        switchShowHaveArtifacts(frontFilter, setInfo);
    }
    let haveArtifactsButton = html`<button style=${haveArtifacts ?
        getButtonStyle('250px', '25px', 'black', colorForShowHaveArtifactsPlanets) :
        getButtonStyle('250px', '25px')
        } onClick=${showHaveArtifacts}>have can active artifact(s)</button>
    `;

    // have active photoid cannon
    const [haveActivePhotoidCannon, setHaveActivePhotoidCannon] = useState(false);
    function showHaveActivePhotoidCannon() {
        setHaveActivePhotoidCannon(!haveActivePhotoidCannon);
        switchShowHaveActivePhotoidCannon(frontFilter, setInfo);
    }
    let haveActivePhotoidCannonButton = html`<button style=${haveActivePhotoidCannon ?
        getButtonStyle('150px', '25px', 'black', colorForShowHaveActivatePhotoidCannonPlanets) :
        getButtonStyle('150px', '25px')
        } onClick=${showHaveActivePhotoidCannon}>${'active Cannon'}</button>`;

    // open fire
    const [openFire, setOpenFire] = useState(false);
    function showOpenFire() {
        setOpenFire(!openFire);
        switchShowPlanetWithOpenFire(frontFilter, setInfo);
    }
    let haveOpenFireButton = html`<button style=${openFire ?
        getButtonStyle('150px', '25px', 'white', colorForShowOpenFirePlanets) :
        getButtonStyle('150px', '25px')
        } onClick=${showOpenFire}>${'Fire Now Cannon'}</button>`;

    //all
    const [all, setAll] = useState(false);
    function showAll() {
        setAll(!all);
        switchShowAllPlanets(frontFilter, setInfo);
    }
    let allPlanetsButton = html`<button style=${all ?
        getButtonStyle('250px', '25px', 'black', colorForShowAllPlanets) :
        getButtonStyle('250px', '25px')
        } onClick=${showAll}>${'show all'}</button>`;


    return html`<div style=${divStyle}>
  
    <div>
    ${levelComponent}
    ${planetTypeComponent}
    ${sapceTypeComponent}
    ${accountComponent}
    ${pinkCircleComponent}
    ${viewportComponent} 
    </div>
   
    ${energyGrowthBonusButton}
    ${speedBonusButton}
    ${rangeBonusButton}
    
    ${canCaptureButton}
    ${notCaptureButton}
    ${haveCapturedButton}
    ${invadeButNotCaptureButton}

    ${haveArtifactsButton}
    ${haveActivePhotoidCannonButton}
    ${haveOpenFireButton}
    ${allPlanetsButton}

   
    <div id=devshow style=${getInfoListStyle('100px')}>${info}</div>
    </div>`;

}

class Plugin {
    constructor() {
        this.container = null;
    }

    async render(container) {
        this.container = container;
        container.style.width = "320px";
        container.style.height = "800px";
        render(html`<${dfGaia}/>`, container);
    }

    draw(ctx) {
        if (pinkCircleSign) {
            drawCenter(ctx, 0, 0, 'pink', 1, 1, 8000, df.worldRadius);
            drawClock(ctx);
        }

        sectionShowDraw(ctx);
    }

    destroy() {
        render(null, this.container);
    }
}

export default Plugin;