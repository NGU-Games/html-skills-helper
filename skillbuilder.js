let buildSkills = []

// Function to calculate the total cost of a skill based on its type
function calculateSkillCost(level, type = 1) {
    if (type === 1) {
        return 30;
    } else if (type === 2) {
        let totalCost = 0;
        for (let i = 1; i <= level; i++) {
            totalCost += i;
        }
        return totalCost;
    }
}

// Skill point calculation
const calculateSkillPointsAvailable = (currentLevel) => Array.from({ length: currentLevel }, (_, i) => {
    const currentLevel = i + 1
    const levelBase = Math.floor(currentLevel / 10)
    return {
        lvl: currentLevel,
        points: levelBase + 1
    }
}).reduce((s, v) => s + v.points, 0)

// Event listener for the Level Up button
function levelUp() {
    const characterLevel = Number(document.getElementById('characterLevel').value);
    const skillPointsAvailable = calculateSkillPointsAvailable(characterLevel);

    document.getElementById('skillPointsAvailable').textContent = skillPointsAvailable;
};

// Populate character level options
function populateCharacterLevelOptions() {
    const selectLevel = document.getElementById('characterLevel');
    for (let i = 1; i <= 99; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        selectLevel.appendChild(option);
    }
}

window.onload = () => {
    populateCharacterLevelOptions()
}

function updateBuild() {
    buildSkills = [...document.querySelectorAll("#skillBuilder .skill-build-item")]
        .map(htmlNode => {
            id = htmlNode.getElementsByTagName("input")[0].value
            level = parseInt(htmlNode.getElementsByTagName("select")[0].value) || 1
            skill = skillsData.nodes.find(s => s.id == id)
            return {
                ...skill,
                requiredLevel: 0,
                selectedLevel: level,
                cost: calculateSkillCost(level, skill.skillType)
            }
        })
    buildSkills.forEach(s => addSkillAndDependencies(s.id))
}

function addSkillAndDependencies(skill) {
    if (skill === undefined || !document.getElementById("addSkills").checked) return;
    for (const newSkill of getAllSelectedSkillTree(skill)) {
        const existingSkill = buildSkills.find(s => s.id == newSkill.id)
        if (existingSkill !== undefined) {
            existingSkill.requiredLevel = Math.max(existingSkill.requiredLevel, newSkill.requiredLevel)
            existingSkill.selectedLevel = Math.max(existingSkill.selectedLevel, newSkill.requiredLevel)
            existingSkill.cost = calculateSkillCost(existingSkill.selectedLevel, existingSkill.skillType)
        }
        // else if (newSkill.id === undefined) continue;
        else {
            if (newSkill.selectedLevel === undefined) newSkill.selectedLevel = newSkill.requiredLevel || 1
            newSkill.cost = calculateSkillCost(newSkill.selectedLevel, newSkill.skillType)
            buildSkills.push(newSkill)
        }
    }
    refreshBuildListHTML()
}

function refreshBuildListHTML() {
    // [...document.getElementById("skillsToBuild").children].forEach(e => e.remove())
    let html = ''
    for (const skill of buildSkills) {
        html += buildListItemHTML(skill)
    }

    document.getElementById("skillsToBuild").innerHTML = html
    document.getElementById("pointsUsed").innerHTML = buildSkills.reduce((acc, s) => acc += s.cost, 0)
    document.getElementById('characterLevel').value = Math.max(
        parseInt(document.getElementById('characterLevel').value),
        calculateLevelFromSkillPoints(document.getElementById("pointsUsed").innerHTML))
}

function buildListItemHTML(skill) {
    return `
        <div class="flex-row margin-all skill-build-item">
            <input class="skill-id hide" value=${skill.id} />
            <label class="min-width-300">${skill.label}</label>
            <select class="min-width-100" id="skillToBuildLevel" name="skillToBuildLevel" onChange="updateBuild()">
                ${getSkillLevelOptionsHTML(skill)}
            </select>
            <label class="min-width-100">Cost: ${skill.cost}</label>
            <button class="small-btn" onclick="removeSkillFromBuild(this)" ${skill.requiredLevel > 0 ? "disabled" : ""}>x</button>
        </div>
    `;
}

function getSkillLevelOptionsHTML(skill) {
    let html = ''
    for (let i = skill.requiredLevel; i <= (skill.skillType == 1 ? 1 : 10); i++)
        html += getSkillLevelOptionHTML(i, skill.selectedLevel == i)
    return html
}

function getSkillLevelOptionHTML(level, checked = false) {
    return `<option value="${level}" ${checked ? "selected" : ""}>${level}</option>`
}

function removeSkillFromBuild(e) {
    e.parentElement.remove()
    updateBuild()
}

function log() {
    console.log(...arguments)
}

function clearSkills() {
    [...document.getElementById("skillsToBuild").children].forEach(e => e.remove())
    document.getElementById("pointsUsed").innerHTML = 0
    document.getElementById('characterLevel').value = 1
    updateBuild()
}

const calculateLevelFromSkillPoints = (skillPoints) => {
    let totalPoints = 0;
    for (let level = 1; level <= 99; level++) {
        totalPoints += Math.floor(level / 10) + 1;
        if (totalPoints >= skillPoints) {
            return level;
        }
    }
    // If skillPoints exceeds the maximum available points, return the maximum level
    return 99;
}