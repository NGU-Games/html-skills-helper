
const calculateSkillPointsAvailable = (currentLevel) => Array.from({ length: currentLevel }, (_, i) => {
    const currentLevel = i + 1
    const levelBase = Math.floor(currentLevel / 10)
    return {
        lvl: currentLevel,
        points: levelBase + 1
    }
}).reduce((s, v) => s + v.points, 0)

const calculateSkillPointCost = (skillLevel, skillType = 10) => {
    return skillType == 1 ? 30 : skillLevel
}

const calculateAccumulatedSkillPointCost = (skillLevel) => Array.from({ length: skillLevel }, (_, i) => {
    const skillLevel = i + 1
    return calculateSkillPointCost(skillLevel)
}).reduce((s, v) => s + v, 0)

const baseClass = {
    name: "Abyssal Stormguard",
    id: "xxxxx",
    type: "MAIN",
    equipGroupsIds: [], // list of equip items groups that this class can equip. 
    primaryStatsBonus: { // sum of 30
        strength: 6,
        constitution: 4,
        dexterity: 12,
        agility: 8,
        intelligence: 1,
        wisdom: 1
    },
    secondaryStatsBase: { // sum of 20
        hp: 6,
        mana: 2,
        stamina: 7,
        initiative: 5,
    },
    movement: {
        range: 4,
        jump: {
            height: 2,
            distance: 1
        }
    },
    skills: [skillStruct],
    resistances: {
        wind: 0,
        water: 0,
        fire: 0,
        nature: 0,
        light: 0,
        dark: 0,
        pHeavy: 0,
        pMedium: 0,
        pLight: 0,
        ranged: 0,
        magic: 0
    }
}

const skillStruct = {
    name: "skill name",
    id: 123, // unique skill id
    animationId: 321, // unique skill animation id
    type: "active|passive|conditional",
    isAvailable: true | false, // if the skill is available to be used (already purchased)
    requirements: [
        {
            type: "stat|skill|event",
            id: 1,// id of the stat/skill 
            level: 0, // level of the stat, char level or skill level
        }
    ],
    cost: {
        staminaCalculation: "stamina cost calculation",
        staminaCalculated: 0,
        manaCalculation: "mana cost calculation",
        manaCalculated: 0
    },
    /* defines where the center of the skill is. 
        character: on a specific unit
        tile: any tile within range, regardless if there's a unit or not
    */
    target: "character|tile",
    range: { // always required
        distance: 1, // leave 1 for self skills
        height: 1, // leave 1 for self skills
        aoe: null || { // only required when target is aoe
            width: 1,
            height: 1,
            /*
                Pre defined shapes:
                normal: spreads equally to all side
                line: spreads in a straight line
                cone: spreads in a line pattern, but with every distance from the central poin grows 2 sideways
                square: spreads equally to the sides, but in a square shape
                custom: defined by the customShape array
            */
            shape: "normal|line|cone|square|custom",
            /* design custom shape of the aoe. use 2 for the center of the effect, 1 for the affected tiles and 0 for unnaffected tiles. 
                array of arrays. all the internal arrays must have the same size.
                example for a custom X shape in front of the character
            */
            customShape: [
                [1, 0, 1],
                [0, 1, 0],
                [1, 0, 1],
                [0, 2, 0]
            ]
        }, //for in line aoe, use decimal for width, like 3.2, 4.3, 4.4, etc. even width leave the line directly in front of the character empty
    },
    effects: [
        {
            affectedType: "stat|skill", //if affected stat is skill or stat
            affectedId: 1, // id of the affected stat or skill
            effectType: "absolute|percentual", // absolute is a number that will be applied directly as a sum, percentual will be use to multiply the affected stat
            /* function that receives character stats (primary and secondary) and returns the amount
                baseStats: stats before equipment and skill bonuses
                calculatedStats: final stats, including equipment and skills (including active buffs and debuffs)
            */
            amount: (baseStats, calculatedStats) => charStats.strength,
            chance: 1, //chance of this effect be applied, from 0 to 1
            falloff: 0 //only applicable to AOE skills and is applied for each tile distance from the center of the effect. 0.5 for example reduces the damage by half each tile distant from the center
        }
    ]
}