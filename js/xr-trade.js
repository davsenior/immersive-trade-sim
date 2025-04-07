const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Create scene
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    // Add camera
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    // Add lighting
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create ground with grass texture
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    const grassMaterial = new BABYLON.StandardMaterial("grassMaterial", scene);
    grassMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/grass.jpg", scene);
    ground.material = grassMaterial;
    ground.receiveShadows = true;

    // Wall material
    const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    // Wall 1 (left)
    const wall1 = BABYLON.MeshBuilder.CreateBox("wall1", { width: 0.1, height: 2, depth: 10 }, scene);
    wall1.position.set(-5, 1, 0);
    wall1.material = wallMaterial;

    // Wall 2 (right)
    const wall2 = wall1.clone("wall2");
    wall2.position.x = 5;

    // Wall 3 (back)
    const wall3 = BABYLON.MeshBuilder.CreateBox("wall3", { width: 10, height: 2, depth: 0.1 }, scene);
    wall3.position.set(0, 1, -5);
    wall3.material = wallMaterial;

    // Cutting table
    const tableMat = new BABYLON.StandardMaterial("tableMat", scene);
    tableMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/wood.jpg", scene);

    const tableTop = BABYLON.MeshBuilder.CreateBox("tableTop", { width: 2, height: 0.1, depth: 1 }, scene);
    tableTop.position.y = 0.75;
    tableTop.material = tableMat;

    // Table legs
    const legHeight = 0.75;
    const legSize = 0.1;
    const createLeg = (x, z) => {
        const leg = BABYLON.MeshBuilder.CreateBox("leg", { width: legSize, height: legHeight, depth: legSize }, scene);
        leg.position.set(x, legHeight / 2, z);
        leg.material = tableMat;
    };
    createLeg(-0.9, -0.4);
    createLeg(0.9, -0.4);
    createLeg(-0.9, 0.4);
    createLeg(0.9, 0.4);

    // Support
    const support = BABYLON.MeshBuilder.CreateBox("support", { width: 2, height: 0.05, depth: 0.1 }, scene);
    support.position.set(0, 0.4, 0);
    support.material = tableMat;

    // Plank on table
    const plank = BABYLON.MeshBuilder.CreateBox("plank", { width: 1.5, height: 0.1, depth: 0.3 }, scene);
    plank.position.set(0, 0.8, 0);
    plank.material = new BABYLON.StandardMaterial("plankMaterial", scene);
    plank.material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);

    // Cutting tool (saw)
    const saw = BABYLON.MeshBuilder.CreateBox("saw", { width: 0.1, height: 0.05, depth: 0.5 }, scene);
    saw.material = new BABYLON.StandardMaterial("sawMaterial", scene);
    saw.material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    saw.position.set(0, 1, 1);

    // Enable WebXR (VR)
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: { sessionMode: "immersive-vr" },
    });

    // Input for grabbing plank and saw
    xrHelper.input.onControllerAddedObservable.add((controller) => {
        const motionController = controller.motionController;
        if (motionController) {
            const selectComponent = motionController.getComponent("xr-standard-trigger");

            selectComponent.onButtonStateChangedObservable.add(() => {
                if (selectComponent.pressed) {
                    const distanceToPlank = BABYLON.Vector3.Distance(controller.grip.position, plank.position);
                    const distanceToSaw = BABYLON.Vector3.Distance(controller.grip.position, saw.position);

                    if (distanceToPlank < 0.5) {
                        plank.setParent(controller.grip);
                    } else if (distanceToSaw < 0.5) {
                        saw.setParent(controller.grip);
                    }
                } else {
                    plank.setParent(null);
                    saw.setParent(null);
                }
            });
        }
    });

    return scene;
};

// Create scene
const scene = createScene();
engine.runRenderLoop(() => {
    scene.then(scene => scene.render());
});
window.addEventListener("resize", () => {
    engine.resize();
});