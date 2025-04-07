const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Create scene
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);

    // Add camera
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    // Add lighting
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
    ground.material = groundMaterial;
    ground.receiveShadows = true;

    // Create walls
    const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    const wall1 = BABYLON.MeshBuilder.CreateBox("wall1", { width: 0.1, height: 2, depth: 10 }, scene);
    wall1.position.x = -5;
    wall1.position.y = 1;
    wall1.position.z = 0;
    wall1.material = wallMaterial;

    // Create Plank
    const plank = BABYLON.MeshBuilder.CreateBox("plank", { width: 1.5, height: 0.1, depth: 0.3 }, scene);
    plank.position.y = 0.05;
    plank.material = new BABYLON.StandardMaterial("plankMaterial", scene);
    plank.material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);

    // Enable WebXR (VR)
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: { sessionMode: "immersive-vr" },
    });

    // WebXR Input for grabbing objects
    xrHelper.input.onControllerAddedObservable.add((controller) => {
        const motionController = controller.motionController;
        if (motionController) {
            const selectComponent = motionController.getComponent("xr-standard-trigger");

            // When trigger is pressed, attach the plank to the controller
            selectComponent.onButtonStateChangedObservable.add(() => {
                if (selectComponent.pressed) {
                    plank.setParent(controller.grip); // Attach plank to controller
                } else {
                    plank.setParent(null); // Release plank
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