const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    // Lighting
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Ground with grass
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    const grassMaterial = new BABYLON.StandardMaterial("grassMaterial", scene);
    grassMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/grass.png", scene);
    ground.material = grassMaterial;
    ground.receiveShadows = true;

    // Walls
    const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    const wall1 = BABYLON.MeshBuilder.CreateBox("wall1", { width: 0.1, height: 2, depth: 10 }, scene);
    wall1.position.set(-5, 1, 0);
    wall1.material = wallMaterial;

    const wall2 = wall1.clone("wall2");
    wall2.position.x = 5;

    const wall3 = BABYLON.MeshBuilder.CreateBox("wall3", { width: 10, height: 2, depth: 0.1 }, scene);
    wall3.position.set(0, 1, -5);
    wall3.material = wallMaterial;

    // Table
    const tableMat = new BABYLON.StandardMaterial("tableMat", scene);
    tableMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/wood.jpg", scene);

    const tableTop = BABYLON.MeshBuilder.CreateBox("tableTop", { width: 2, height: 0.1, depth: 1 }, scene);
    tableTop.position.y = 0.75;
    tableTop.material = tableMat;

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

    const support = BABYLON.MeshBuilder.CreateBox("support", { width: 2, height: 0.05, depth: 0.1 }, scene);
    support.position.set(0, 0.4, 0);
    support.material = tableMat;

    // Plank
    let plank = BABYLON.MeshBuilder.CreateBox("plank", { width: 1.5, height: 0.1, depth: 0.3 }, scene);
    plank.position.set(0, 0.8, 0);
    plank.material = new BABYLON.StandardMaterial("plankMaterial", scene);
    plank.material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);

    // Saw
    const saw = BABYLON.MeshBuilder.CreateBox("saw", { width: 0.1, height: 0.05, depth: 0.5 }, scene);
    saw.material = new BABYLON.StandardMaterial("sawMaterial", scene);
    saw.material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    saw.position.set(0, 1, 1);

    // XR Experience
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: { sessionMode: "immersive-vr" },
    });

    // Teleportation
    const featuresManager = xrHelper.baseExperience.featuresManager;
    featuresManager.enableFeature(BABYLON.WebXRFeatureName.TELEPORTATION, 'stable', {
        floorMeshes: [ground],
        xrInput: xrHelper.input,
    });

    // Laser Pointer
    featuresManager.enableFeature(BABYLON.WebXRFeatureName.POINTER_SELECTION, 'stable', {
        xrInput: xrHelper.input,
        enablePointerSelectionOnAllControllers: true,
    });

    // Grab logic
    xrHelper.input.onControllerAddedObservable.add((controller) => {
        const motionController = controller.motionController;
        if (motionController) {
            const selectComponent = motionController.getComponent("xr-standard-trigger");
            selectComponent.onButtonStateChangedObservable.add(() => {
                if (selectComponent.pressed) {
                    const distPlank = BABYLON.Vector3.Distance(controller.grip.position, plank.position);
                    const distSaw = BABYLON.Vector3.Distance(controller.grip.position, saw.position);

                    if (distPlank < 0.5) plank.setParent(controller.grip);
                    else if (distSaw < 0.5) saw.setParent(controller.grip);
                } else {
                    plank.setParent(null);
                    saw.setParent(null);
                }
            });
        }
    });

    // Simple cut mechanic
    let cutDone = false;
    scene.onBeforeRenderObservable.add(() => {
        if (cutDone) return;
        if (saw.parent && saw.parent.name.includes("controller")) {
            const sawBox = saw.getBoundingInfo().boundingBox;
            const plankBox = plank.getBoundingInfo().boundingBox;

            if (sawBox.intersectsBox(plankBox)) {
                // Cut the plank
                cutDone = true;
                plank.dispose();

                const cut1 = BABYLON.MeshBuilder.CreateBox("cut1", { width: 0.75, height: 0.1, depth: 0.3 }, scene);
                const cut2 = cut1.clone("cut2");

                cut1.position.set(-0.4, 0.8, 0);
                cut2.position.set(0.4, 0.8, 0);

                cut1.material = cut2.material = new BABYLON.StandardMaterial("cutPlank", scene);
                cut1.material.diffuseColor = cut2.material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);
            }
        }
    });

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => {
    scene.then(scene => scene.render());
});
window.addEventListener("resize", () => {
    engine.resize();
});