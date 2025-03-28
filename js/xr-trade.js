const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Create scene
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // Enable WebXR (VR Mode)
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-vr",
        },
    });

    const xrCamera = xrHelper.baseExperience.camera; // Use XR Camera for movement

    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;

    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
    ground.material = groundMaterial;

    // Plank
    let plank = BABYLON.MeshBuilder.CreateBox("plank", { width: 1.5, height: 0.1, depth: 0.3 }, scene);
    plank.position.y = 0.05;
    plank.material = new BABYLON.StandardMaterial("plankMaterial", scene);
    plank.material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);

    // Saw
    let saw = BABYLON.MeshBuilder.CreateBox("saw", { width: 0.3, height: 0.05, depth: 0.5 }, scene);
    saw.position.set(0, 1.5, -1);
    saw.material = new BABYLON.StandardMaterial("sawMaterial", scene);
    saw.material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);

    // Detect Controllers
    xrHelper.input.onControllerAddedObservable.add(controller => {
        if (controller.inputSource.handedness === "right") {
            // Attach saw to right controller
            controller.onMotionControllerInitObservable.add(motionController => {
                saw.parent = controller.grip; // Saw moves with VR
            });

            // Cutting Interaction:
            controller.onTriggerStateChangedObservable.add(state => {
                if (state.pressed && saw.intersectsMesh(plank, false)) {
                    // Simulate cutting
                    plank.dispose();
                    let plankLeft = BABYLON.MeshBuilder.CreateBox("plankLeft", { width: 0.7, height: 0.1, depth: 0.3 }, scene);
                    plankLeft.position.set(-0.4, 0.05, 0);
                    plankLeft.material = new BABYLON.StandardMaterial("plankMaterial", scene);
                    plankLeft.material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);

                    let plankRight = BABYLON.MeshBuilder.CreateBox("plankRight", { width: 0.7, height: 0.1, depth: 0.3 }, scene);
                    plankRight.position.set(0.4, 0.05, 0);
                    plankRight.material = new BABYLON.StandardMaterial("plankMaterial", scene);
                    plankRight.material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);
                }
            });
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