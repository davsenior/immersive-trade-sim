import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    MeshBuilder,
    Color3,
    StandardMaterial,
    WebXRDefaultExperience
} from "@babylonjs/core";
import "@babylonjs/loaders";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Camera / lighting
const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 10, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
light.intensity = 0.7;

// Skybox
const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
const skyboxMaterial = new StandardMaterial("skyBoxMaterial", scene);
skyboxMaterial.backFaceCulling = false;
skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
skyboxMaterial.specularColor = new Color3(0, 0, 0);
skyboxMaterial.emissiveColor = new Color3(0.1, 0.3, 0.1);
skybox.material = skyboxMaterial;

// Walls
const walls = [];
for (let i = 0; i < 3; i++) {
    const wall = MeshBuilder.CreateBox("wall" + i, { height: 3, width: 10, depth: 0.1 }, scene);
    wall.position.y = 1.5;
    wall.material = new StandardMaterial("wallMat", scene);
    wall.material.diffuseColor = new Color3(0.5, 0.8, 0.5); // green
    walls.push(wall);
}
walls[0].position.z = -5;
walls[1].position.x = -5;
walls[1].rotation.y = Math.PI / 2;
walls[2].position.x = 5;
walls[2].rotation.y = Math.PI / 2;

// Plank
const plank = MeshBuilder.CreateBox("plank", { height: 0.1, width: 1, depth: 2 }, scene);
plank.position = new Vector3(0, 1.55, 0);
plank.material = new StandardMaterial("plankMat", scene);
plank.material.diffuseColor = new Color3(0.76, 0.60, 0.42);

// Cutting table
const cuttingTable = MeshBuilder.CreateBox("cuttingTable", { height: 1, width: 2, depth: 2 }, scene);
cuttingTable.position = new Vector3(0, 0.5, 0);
cuttingTable.material = new StandardMaterial("tableMat", scene);
cuttingTable.material.diffuseColor = new Color3(0.4, 0.2, 0.1);

// Saw object for cutting
function createSaw() {
    const saw = MeshBuilder.CreateBox("saw", { height: 0.1, width: 0.3, depth: 0.8 }, scene);
    saw.position = new Vector3(0, 1.6, 0.5);
    const sawMat = new StandardMaterial("sawMat", scene);
    sawMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
    saw.material = sawMat;
    return saw;
}
const saw = createSaw();

// Other stations
function createStation(name, position, color) {
    const table = MeshBuilder.CreateBox(name + "Table", { height: 1, width: 2, depth: 2 }, scene);
    table.position = position;
    table.material = new StandardMaterial(name + "Mat", scene);
    table.material.diffuseColor = color;

    const label = MeshBuilder.CreatePlane(name + "Label", { width: 1.5, height: 0.5 }, scene);
    label.position = new Vector3(position.x, position.y + 1.2, position.z);
    label.rotation = new Vector3(0, 0, 0);
    const labelMat = new StandardMaterial(name + "LabelMat", scene);
    labelMat.diffuseColor = color;
    label.material = labelMat;
}
createStation("hammering", new Vector3(3, 0.5, 3), new Color3(0.6, 0.3, 0.1));
createStation("wiring", new Vector3(-3, 0.5, 3), new Color3(0.3, 0.3, 0.6));

// WebXR
WebXRDefaultExperience.CreateAsync(scene, {
    floorMeshes: [cuttingTable],
    disableTeleportation: false
}).then((xrHelper) => {
    const teleportation = xrHelper.teleportation;
    teleportation.addFloorMesh(cuttingTable);

    xrHelper.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
            controller.onMeshLoadedObservable.add(() => {
                const squeezeComponent = motionController.getComponent("grasp");
                if (squeezeComponent) {
                    squeezeComponent.onButtonStateChangedObservable.add(() => {
                        if (squeezeComponent.pressed) {
                            const controllerPosition = controller.grip ? controller.grip.position : controller.pointer.position;
                            const distance = Vector3.Distance(controllerPosition, saw.position);
                            if (distance < 0.5) {
                                // Simulate cutting the plank
                                plank.scaling.z *= 0.5;
                                plank.position.z -= 0.5;
                            }
                        }
                    });
                }
            });
        });
    });
});

engine.runRenderLoop(() => {
    scene.render();
});