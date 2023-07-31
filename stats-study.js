
const getStatusIncreaseCost = (statLevel) => Math.floor(statLevel / 10) + 1
const getTotalStatusCost = (statLevel) => {
    const baseLevel = Math.floor(statLevel / 10)
    return ((baseLevel - 1) / 2 + 1) * baseLevel * 10 + (statLevel + 1 - baseLevel * 10) * (baseLevel + 1) - 2
}

const totalStatusPointsAvailable = (currentLevel) => Array.from({ length: currentLevel - 1 }, (_, i) => {
    const currentLevel = i + 2
    const levelBase = Math.floor(currentLevel / 10)
    return {
        lvl: currentLevel,
        points: levelBase + 5 + (currentLevel % 10 == 0 ? (levelBase - 1) * 11 : 0)
    }
}).reduce((s, v) => s + v.points, 0)

const calculateStatBonus = (stat) => {
    const statTier = Math.floor((stat + 1) / 10)
    const ratio = 1 + statTier / 10
    const multiplier = ratio * ratio
    return Math.floor(multiplier * statTier / 2)
}

const primaryStatsBase = {
    strength: 1,
    constitution: 1,
    dexterity: 1,
    agility: 1,
    intelligence: 1,
    wisdom: 1
}

const primaryStats = {
    strength: primaryStatsBase.strength + calculateStatBonus(primaryStatsBase.strength),
    constitution: primaryStatsBase.constitution + calculateStatBonus(primaryStatsBase.constitution),
    dexterity: primaryStatsBase.dexterity + calculateStatBonus(primaryStatsBase.dexterity),
    agility: primaryStatsBase.agility + calculateStatBonus(primaryStatsBase.agility),
    intelligence: primaryStatsBase.intelligence + calculateStatBonus(primaryStatsBase.intelligence),
    wisdom: primaryStatsBase.wisdom + calculateStatBonus(primaryStatsBase.wisdom),
}
const secondaryAttributesBase = {
    hp: 10,
    mana: 10,
    stamina: 10,
}

const currentLevel = 1;

const equipamentAndSkillSummary = {
    primaryStats: {
        strength: 5,
        constitution: 0,
        dexterity: 2,
        agility: 10,
        intelligence: 1,
        wisdom: 0,
    },
    secondaryStatsRaw: {
        pools: {
            hp: 20,
            mana: 0,
            stamina: 500,
        },
        defensive: {
            physicalDefense: 20,
            magicalDefense: 5,
            block: 0,
            parry: 0,
            dodge: 10,
            deflect: 0,
            ailmentResistance: 0
        },
        offensive: {
            lightAttack: 60,
            mediumAttack: 0,
            heavyAttack: 0,
            rangedAttack: 0,
            magicalAttack: 0,
            accuracy: 10,
            critical: 20,
        },
        misc: {
            move: {
                range: 0,
                height: 0,
                jump: 0,
            },
            initiative: 0
        }
    },
    secondaryStatsPercent: {
        pools: {
            hp: 1,
            mana: 1,
            stamina: 1,
        },
        defensive: {
            physicalDefense: 1,
            magicalDefense: 1,
            block: 1,
            parry: 1,
            dodge: 1,
            deflect: 1,
            ailmentResistance: 1
        },
        offensive: {
            lightAttack: 1,
            mediumAttack: 1,
            heavyAttack: 1,
            rangedAttack: 1,
            magicalAttack: 1,
            accuracy: 1,
            critical: 1,
        },
        misc: {
            move: {
                range: 1,
                height: 1,
                jump: 1,
            },
            initiative: 1
        }
    },
}
const calculatedPrimaryStats = {
    strength: primaryStats.strength + equipamentAndSkillSummary.primaryStats.strength,
    constitution: primaryStats.constitution + equipamentAndSkillSummary.primaryStats.constitution,
    dexterity: primaryStats.dexterity + equipamentAndSkillSummary.primaryStats.dexterity,
    agility: primaryStats.agility + equipamentAndSkillSummary.primaryStats.agility,
    intelligence: primaryStats.intelligence + equipamentAndSkillSummary.primaryStats.intelligence,
    wisdom: primaryStats.wisdom + equipamentAndSkillSummary.primaryStats.wisdom,
}

const secondaryAttributes = {
    pools: {
        hp: currentLevel + secondaryAttributesBase.hp + calculatedPrimaryStats.strength / 3 + calculatedPrimaryStats.constitution,
        mana: currentLevel + secondaryAttributesBase.mana + calculatedPrimaryStats.intelligence / 3 + calculatedPrimaryStats.wisdom,
        stamina: currentLevel + secondaryAttributesBase.stamina + calculatedPrimaryStats.strength / 3 + calculatedPrimaryStats.constitution / 3 + calculatedPrimaryStats.agility / 3,
    },
    defensive: {
        physicalDefense: calculatedPrimaryStats.strength / 10 + calculatedPrimaryStats.constitution / 2,
        magicalDefense: calculatedPrimaryStats.intelligence / 10 + calculatedPrimaryStats.wisdom / 2,
        block: currentLevel / 5 + calculatedPrimaryStats.strength,
        parry: currentLevel / 5 + calculatedPrimaryStats.dexterity / 2 + calculatedPrimaryStats.agility / 3 + calculatedPrimaryStats.strength / 4,
        dodge: currentLevel / 5 + calculatedPrimaryStats.agility,
        deflect: currentLevel / 5 + calculatedPrimaryStats.intelligence,
        ailmentResistance: 0
    },
    offensive: {
        lightAttack: currentLevel / 5 + calculatedPrimaryStats.agility / 2.5 + calculatedPrimaryStats.dexterity / 4 + calculatedPrimaryStats.strength / 5,
        mediumAttack: currentLevel / 5 + calculatedPrimaryStats.agility / 3 + calculatedPrimaryStats.dexterity / 3 + calculatedPrimaryStats.strength / 3,
        heavyAttack: currentLevel / 5 + calculatedPrimaryStats.agility / 10 + calculatedPrimaryStats.dexterity / 10 + calculatedPrimaryStats.strength,
        rangedAttack: currentLevel / 5 + calculatedPrimaryStats.agility / 10 + calculatedPrimaryStats.dexterity,
        magicalAttack: currentLevel / 5 + 0,
        accuracy: currentLevel / 5 + calculatedPrimaryStats.dexterity,
        critical: 0,
    },
    misc: {
        move: {
            range: 0,
            height: 0,
            jump: 0,
        },
        initiative: (currentLevel / 10 + calculatedPrimaryStats.agility / 5) + 1
    }
}
// const calculatedSecondaryStats = (secondaryAttributes + equipamentAndSkillSummary.secondaryStatsRaw) * equipamentAndSkillSummary.secondaryStatsPercent
