const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Ensure canvas resizes 
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Resize canvas when window resizes
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine.resize();
});

// Create scene
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // Camera (VR/AR)
    const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 1.6, -3), scene);
    camera.attachControl(canvas, true);

    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;

    // Construction ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
    ground.material = groundMaterial;

    // Plank (for cutting)
    let plank = BABYLON.MeshBuilder.CreateBox("plank", { width: 1.5, height: 0.1, depth: 0.3 }, scene);
    plank.position.y = 0.05;
    plank.material = new BABYLON.StandardMaterial("plankMaterial", scene);
    plank.material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);

    // Saw
    let saw = BABYLON.MeshBuilder.CreateBox("saw", { width: 0.3, height: 0.05, depth: 0.5 }, scene);
    saw.position.set(0, 0.2, 0);
    saw.material = new BABYLON.StandardMaterial("sawMaterial", scene);
    saw.material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);

    // Cutting
    scene.onBeforeRenderObservable.add(() => {
        // Simulate saw moving 
        if (saw.intersectsMesh(plank, false)) {
            plank.dispose(); // Remove original plank
            let plankLeft = BABYLON.MeshBuilder.CreateBox("plankLeft", { width: 0.7, height: 0.1, depth: 0.3 }, scene);
            plankLeft.position.set(-0.4, 0.05, 0);
            plankLeft.material = plank.material;

            let plankRight = BABYLON.MeshBuilder.CreateBox("plankRight", { width: 0.7, height: 0.1, depth: 0.3 }, scene);
            plankRight.position.set(0.4, 0.05, 0);
            plankRight.material = plank.material;
        }
    });

    // Enable WebXR (VR/AR mode)
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-vr",
        },
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