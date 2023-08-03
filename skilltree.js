let dependencyFieldCounter = 0;
let skillIdPrefix = "SKILL_"
let selectedSkill = ""
let skillsHighlighted = []
let skillsData = {
    nodes: [
        { id: getSkillId("Skill 1"), label: "Skill 1", skillLevel: 1, isUlt: false },
    ],
    edges: [],
};

let network;

// Function to add a new skill to the data
function addNewSkill() {
    const newNodeLabel = "New Skill " + parseInt(skillsData.nodes.length + 1)
    const newNodeId = getSkillId(newNodeLabel)
    const newSkill = {
        id: newNodeId,
        label: newNodeLabel,
        skillLevel: 1,
        isUlt: false
    }
    skillsData.nodes.push(newSkill);
    refreshDiagram();
    populateSkillList(); // Add this line to update the skill list
    setSelectedNode(newSkill.id)
    // openForm(newSkill.id)
}

// Function to populate the skill list
function populateSkillList() {
    const skillList = document.getElementById("skillList");
    skillList.innerHTML = "";

    for (const node of skillsData.nodes) {
        const skillName = getNodeName(node.label);
        const listItem = document.createElement("li");
        listItem.textContent = skillName;
        listItem.onclick = function () {
            setSelectedNode(node.id);
        };
        skillList.appendChild(listItem);
    }
}

// Function to open the edit form when a skill node is selected
function openForm(nodeId) {
    const node = skillsData.nodes.find((node) => node.id === nodeId);
    const skillForm = `
        <form id="editForm">
            <div class="flex-row">
                <div class="flex-column">
                    <div class="flex-row margin-all">
                        <input type="text" id="skillName" value="${getNodeName(node.label)}" required>
                        <select id="skillType">
                            <option value="1" ${node.skillType === 1 ? "selected" : ""}>1</option>
                            <option value="2" ${node.skillType === 2 ? "selected" : ""}>10</option>
                        </select>                    
                    </div>
                    <div class="flex-row margin-all">
                        <label for="dependency">Dependencies (Cost ${skillsHighlighted.reduce((sum, skill) => sum + skill.cost, 0)})</label>
                        <button type="button" class="small-btn" onclick="addDependencyField()">+</button>
                    </div>
                </div>
                <div class="dependencies">
                    <div class="form-group margin-all">
                        <div id="dependencyLevels">
                            <!-- Dynamically add dependency levels -->
                        </div>
                    </div>
                </div>
            </div>
            <input type="checkbox" id="isUlt" ${node.isUlt ? "checked" : ""} />
            <label for="isUlt">Is Ult?</label>
            <button class="btn cancel" onclick="closeForm()">Cancel</button>
            <button class="btn" type="submit">Save Changes</button>

        </form>
      `;

    document.getElementById("skillForm").innerHTML = skillForm;

    const dependencyLevelsDiv = document.getElementById("dependencyLevels");
    dependencyLevelsDiv.innerHTML = "";

    const edges = skillsData.edges.filter((edge) => edge.to === nodeId);
    if (edges.length > 0) {
        for (const i in edges) {
            const edge = edges[i]
            dependencyLevelsDiv.innerHTML += `
            <div class="form-group flex-row margin-all">
              <select id="dependencyName-${edge.from}-${edge.to}">
                <!-- Dynamically add skill options -->
                ${getSkillOptions(edge.from, nodeId)}
              </select>
                <select id="dependencyLevel-${edge.from}-${edge.to}">
                <option value="1" ${edge.requiredLevel === 1 ? "selected" : ""}>1</option>
                <option value="5" ${edge.requiredLevel === 5 ? "selected" : ""}>5</option>
                <option value="10" ${edge.requiredLevel === 10 ? "selected" : ""}>10</option>
            </select>
                <button type="button" class="small-btn" onclick="removeDependency(this)">X</button>
            </div>
          `;
        }
    }

    document.getElementById("editForm").onsubmit = function (event) {
        event.preventDefault();
        updateSkill(nodeId);
        closeForm();
    };

    // Highlight all dependencies of the selected skill node
    const dependencies = skillsData.edges.filter((edge) => edge.to === nodeId);

}

function removeDependency(e) {
    e.parentElement.remove()
}

// Function to add a new dependency field
function addDependencyField() {
    const newFieldId = `new-${Date.now()}`; // Use the counter for uniqueness
    const newField = `
            <div class="form-group flex-row margin-all">
                <select id="dependencyName-${newFieldId}">
                    <!-- Dynamically add skill options -->
                    ${getSkillOptions()}
                </select>
                <select id="dependencyLevel-${newFieldId}">
                    <option value="1">1</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                </select>
                <button type="button" class="small-btn" onclick="removeDependency(this)">X</button>
            </div>
        `;
    document.getElementById("dependencyLevels").innerHTML += newField;
}

// Function to generate skill options for the dropdown
function getSkillOptions(selectedSkillId, excludeSkillLabel = "") {
    return skillsData.nodes
        .map((node) => {
            const skillLabel = getNodeName(node.label);
            if (skillLabel !== excludeSkillLabel) {
                return `<option value="${node.id}" ${node.id === selectedSkillId ? "selected" : ""}>${skillLabel}</option>`;
            }
        })
        .join("");
}

// Function to update the skill when the form is submitted
function updateSkill(nodeId) {
    const skillName = document.getElementById("skillName").value.trim();
    const skillType = parseInt(document.getElementById("skillType").value, 10);
    const isUlt = document.getElementById("isUlt").checked;

    if (!skillName) {
        alert("Please enter valid skill name and level.");
        return;
    }

    const nodeIndex = skillsData.nodes.findIndex((node) => node.id === nodeId);
    const newNodeId = getSkillId(skillName)
    skillsData.nodes[nodeIndex].label = `${skillName}`;
    skillsData.nodes[nodeIndex].skillType = skillType;
    skillsData.nodes[nodeIndex].id = newNodeId
    skillsData.nodes[nodeIndex].isUlt = isUlt

    // Remove existing edges for this skill
    skillsData.edges = skillsData.edges.filter((edge) => edge.to !== nodeId);

    // Add new edges based on entered dependencies and their levels
    const dependencyLevelsDiv = document.querySelectorAll("#dependencyLevels > .form-group");
    const newDependencies = [];

    for (const dependencySkill of dependencyLevelsDiv) {
        const dependencyInputs = dependencySkill.getElementsByTagName("select");
        const fromNodeId = dependencyInputs[0].value
        const dependencyLevel = parseInt(dependencyInputs[1].value, 10);

        if (!isNaN(dependencyLevel)) {
            const existingEdge = skillsData.edges.find((edge) => edge.from === fromNodeId && edge.to === nodeId);
            if (existingEdge) {
                existingEdge.from = fromNodeId
                existingEdge.to = newNodeId
                existingEdge.requiredLevel = dependencyLevel;
            } else {
                newDependencies.push({
                    from: fromNodeId,
                    to: newNodeId,
                    requiredLevel: dependencyLevel,
                    cost: getRequirementCost(dependencyLevel),
                });
            }
        }
    }

    for (const existingEdgesFrom of skillsData.edges.filter((edge) => edge.from === nodeId)) {
        if (existingEdgesFrom) {
            existingEdgesFrom.from = newNodeId
        }
    }

    skillsData.edges.push(...newDependencies);
    // setSelectedNode(selectedSkill || skillsData.nodes[-1].id)
    refreshDiagram();
    populateSkillList();
}

function getRequirementCost(level) {
    if (level == 1)
        return 30
    else if (level == 5)
        return 15
    return 55
}

// Function to close the edit form
function closeForm() {
    document.getElementById("editForm").reset();
}

// Function to extract skill name from the node label
function getNodeName(label) {
    return label.split("\n")[0];
}

function refreshDiagram() {
    const container = document.getElementById("skillTree");
    const nodes = [];
    const edges = [];

    // Calculate y positions for each skill level
    const levels = {}; // Object to group nodes by level
    for (const node of skillsData.nodes) {
        if (!levels[node.skillLevel]) {
            levels[node.skillLevel] = [];
        }
        levels[node.skillLevel].push(node);
    }

    let y = 0;
    for (const level of Object.values(levels)) {
        const levelSize = level.length;
        const yOffset = -(levelSize - 1) / 2;

        for (let i = 0; i < levelSize; i++) {
            const node = level[i];
            nodes.push({ id: node.id, label: node.label, y: y + yOffset + i });
        }

        y += levelSize + 1; // Increase the y position for the next level
    }

    const options = {
        autoResize: false,
        layout: {
            improvedLayout: true,
            // hierarchical: {
            //     blockShift: false,
            //     sortMethod: "hubsize",
            //     shakeTowards: "roots",
            //     direction: "DU"
            // }
        },
        edges: {
            smooth: {
                type: "cubicBezier",
                forceDirection: "vertical",
                roundness: 0.4,
            },
            arrows: "to",
            length: 200
        },
        nodes: {
            shape: "box",
            borderWidth: 2,
            size: 30,
        },
        physics: {
            enabled: false,
            hierarchicalRepulsion: {
                avoidOverlap: 1,
                nodeDistance: 150
            },
            repulsion: {
                nodeDistance: 500,
                springLength: 5
            },
            solver: "forceAtlas2Based"
        },
    };

    // Collect edges from the skillsData and add their labels
    const edgesWithLabels = skillsData.edges.map((edge) => {
        const fromNode = skillsData.nodes.findIndex((node) => node.id === edge.from);
        const toNode = skillsData.nodes.findIndex((node) => node.id === edge.to);
        let color = "rgb(20,20,200)"; // Default color for arrows with no specific level requirement
        if (edge.requiredLevel === 1) {
            color = "green";
        } else if (edge.requiredLevel === 5) {
            color = "blue";
        } else if (edge.requiredLevel === 10) {
            color = "red";
        }

        return {
            from: edge.from,
            to: edge.to,
            label: `Level ${edge.requiredLevel}`,
            font: { align: "horizontal" },
            color: color,
            width: skillsHighlighted.find(s => s.id == edge.to) === undefined ? 1 : 4
        };
    });

    // Add custom colors for nodes representing dependencies
    // const nodeIdsWithDependencies = skillsData.edges.map((edge) => edge.from);
    // const dependencyNodeIds = [...new Set(nodeIdsWithDependencies)]; // Remove duplicates

    const nodesWithLabels = skillsData.nodes.map((node) => getNodeInfo(node))
    const data = { nodes: nodesWithLabels, edges: edgesWithLabels };
    network = new vis.Network(container, data, options);
    network.on("selectNode", (ev) => setSelectedNode(ev.nodes[0]))
    network.on("oncontext", (ev) => addSkillAndDependencies(network.getNodeAt(ev.pointer.DOM)))

    network.on("afterDrawing", () => {
        skillsData.nodes
            .forEach((s, i) => skillsData.nodes[i] = { ...s, ...network.getPosition(s.id) })
    })
}

function getNodeInfo(node) {
    let nodeInfo = {
        id: node.id,
        label: `${node.label}\n`,
        color: {
            background: "rgb(200,220,255)",
            border: "rgb(200, 200, 200)"
        },
        font: {
            color: "#000000",
            bold: false
        },
        borderWidth: 1,
        x: node.x,
        y: node.y
    }

    if (skillsData.edges.find(e => e.to == node.id) === undefined) {
        nodeInfo.color.background = "rgb(255,220,200)"
    }

    if (skillsData.edges.find(e => e.from == node.id) === undefined) {
        nodeInfo.color.background = "rgb(220,255,200)"
    }

    if (node.id == selectedSkill) {
        nodeInfo.borderWidth = 4
        nodeInfo.color.background = "rgb(0,0,255)"
        nodeInfo.color.border = "rgb(0,200,255)"
        nodeInfo.font.color = "#ffffff"
        nodeInfo.font.bold = true
        nodeInfo.label = `${node.label}\n(${skillsHighlighted.reduce((sum, skill) => sum + skill.cost, 0)})`
    }
    else if (skillsHighlighted.find(n => n.id == node.id) !== undefined) {
        nodeInfo.borderWidth = 2
        nodeInfo.color.background = "rgb(50,50,255)"
        nodeInfo.font.color = "#ffffff"
        nodeInfo.color.border = "rgb(0,200,255)"
    }

    return nodeInfo

}

function setSelectedNode(nodeId) {
    selectedSkill = nodeId
    skillsHighlighted = getAllSelectedSkillTree(nodeId)
        .sort((skillA, skillB) =>
            (skillA.id === skillB.id) ?
                ((skillA.cost > skillB.cost) ? -1 : 1) :
                ((skillA.id > skillB.id) ? 1 : -1))
        .filter((skill, i, skills) => i == 0 || skills[i - 1].id !== skill.id)
    openForm(nodeId)
    refreshDiagram()
}

function getAllSelectedSkillTree(nodeId, dep = { cost: 1, requiredLevel: 0 }) {
    const currentSkill = {
        ...skillsData.nodes.find(node => node.id == nodeId),
        cost: dep.cost,
        requiredLevel: dep.requiredLevel
    }
    return [currentSkill, ...skillsData.edges.filter((edge) => edge.to == nodeId).flatMap(edge => getAllSelectedSkillTree(edge.from, edge))]
}

function clearInputs() {
    document.getElementById("skillName").value = "";
    document.getElementById("skillLevel").value = 1;
    document.getElementById("dependency").value = "";
    document.getElementById("requiredLevel").value = 1;
}
// Initial diagram rendering

// Function to export skill settings as a YAML file
function exportSkillsAsYAML() {
    const dataToExport = { idPrefix: skillIdPrefix, skills: skillsData.nodes, dependencies: skillsData.edges };
    const yamlData = jsyaml.dump(dataToExport);
    downloadFile("skill_settings.yaml", yamlData);
}

// Function to import skill settings from a YAML file
function importSkillsFromYAML(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const yamlData = event.target.result;
        const importedData = jsyaml.load(yamlData);
        if (importedData && Array.isArray(importedData.skills)) {
            skillsData = {
                nodes: importedData.skills,
                edges: Array.isArray(importedData.dependencies) ? importedData.dependencies : []
            };
            skillIdPrefix = importedData.idPrefix
            refreshDiagram();
            populateSkillList();
        } else {
            alert("Invalid YAML file format. Please make sure the file contains valid skill settings.");
        }
    };
    reader.readAsText(file);
}

// Function to trigger download of a file
function downloadFile(filename, content) {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/yaml;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Function to handle the selected file for import
function handleImportFile(event) {
    const file = event.target.files[0];
    if (file) {
        importSkillsFromYAML(file);
    }
}

// Function to export the diagram as a PNG image
function exportDiagramAsPNG() {
    const canvas = network.canvas.frame.canvas;

    // Create a temporary link to download the PNG image
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "skill_diagram.png";

    // Trigger the click event of the link to initiate the download
    link.click();

    // Remove the temporary link
    link.remove();
}

function updateSkillIdPrefix() {
    skillIdPrefix = document.getElementById("skillIdPrefix").value
    const newNodes = []
    const newEdges = []
    for (const node of skillsData.nodes) {
        const newNodeId = getSkillId(node)
        const newNode = {
            id: getSkillId(node.label),
            label: node.label,
            skillLevel: node.skillLevel
        }
        newNodes.push(newNode)
        const existingEdges = skillsData.edges.find((edge) => edge.from === node.id || edge.to === node.id);
        if (Array.isArray(existingEdges)) {

            newEdges.push(existingEdges.map((edge) => ({
                from: edge.from == node.id ? newNodeId : edge.from,
                to: edge.to == node.id ? newNodeId : edge.to,
                requiredLevel: edge.dependencyLevel,
            })))
        }
    }
    skillsData = {
        nodes: newNodes,
        edges: newEdges
    }
}

function getSkillId(name) {
    return `${skillIdPrefix}${name.replace(/[^a-z0-9]/gi, '')}`;
}

function maximizeDiagram() {
    var canvas = document.getElementById('skillTree');
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) { /* Firefox */
        canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { /* IE/Edge */
        canvas.msRequestFullscreen();
    }
}

function toggleVisible(id) {
    document.getElementById(id).classList.toggle("hide");
}

window.onload = (event) => {
    refreshDiagram();
    populateSkillList();
}

