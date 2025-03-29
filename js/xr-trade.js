const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Create scene
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // Add camera
    const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 1.6, -3), scene);
    camera.attachControl(canvas, true);

    // Add lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;

    // Create ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
    ground.material = groundMaterial;

    // Create Plank
    const plank = BABYLON.MeshBuilder.CreateBox("plank", { width: 1.5, height: 0.1, depth: 0.3 }, scene);
    plank.position.y = 0.05;
    plank.material = new BABYLON.StandardMaterial("plankMaterial", scene);
    plank.material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);

    // Enable WebXR (VR mode)
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-vr",
        },
    });

    // Enable interaction features
    const featureManager = xrHelper.baseExperience.featuresManager;
    const teleportation = featureManager.enableFeature(BABYLON.WebXRMotionControllerTeleportation);
    const pointerSelection = featureManager.enableFeature(BABYLON.WebXRControllerPointerSelection);

    // Grab & Drop functionality
    let grabbedObject = null;
    pointerSelection.onSelectObservable.add((eventData) => {
        if (!grabbedObject) {
            grabbedObject = plank; // Grab plank
            grabbedObject.setParent(eventData.grabber);
        } else {
            grabbedObject.setParent(null); // Release plank
            grabbedObject = null;
        }
    });

    // Cutting
    pointerSelection.onSelectObservable.add((eventData) => {
        if (grabbedObject === plank) {
            const cutPosition = grabbedObject.position.x;

            // Create two halves
            const plank1 = BABYLON.MeshBuilder.CreateBox("plank1", { width: cutPosition, height: 0.1, depth: 0.3 }, scene);
            const plank2 = BABYLON.MeshBuilder.CreateBox("plank2", { width: 1.5 - cutPosition, height: 0.1, depth: 0.3 }, scene);

            plank1.material = plank.material;
            plank2.material = plank.material;

            plank1.position.set(plank.position.x - cutPosition / 2, plank.position.y, plank.position.z);
            plank2.position.set(plank.position.x + cutPosition / 2, plank.position.y, plank.position.z);

            plank.dispose();
        }
    });

    return scene;
};

// Create scene
const scene = createScene();

// Render loop
engine.runRenderLoop(() => {
    scene.then(scene => scene.render());
});

// Resize handling
window.addEventListener("resize", () => {
    engine.resize();
});