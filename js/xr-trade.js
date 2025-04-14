const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Create scene
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    // Add lighting
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
    const grassMaterial = new BABYLON.StandardMaterial("grassMaterial", scene);
    grassMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/grass.png", scene);
    ground.material = grassMaterial;
    ground.receiveShadows = true;

    // Wall 1 (left)
    const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    const wall1 = BABYLON.MeshBuilder.CreateBox("wall1", { width: 0.1, height: 2, depth: 10 }, scene);
    wall1.position.x = -5;
    wall1.position.y = 1;
    wall1.material = wallMaterial;

    // Wall 2 (right)
    const wall2 = wall1.clone("wall2");
    wall2.position.x = 5;

    // Wall 3 (back)
    const wall3 = BABYLON.MeshBuilder.CreateBox("wall3", { width: 10, height: 2, depth: 0.1 }, scene);
    wall3.position.z = -5;
    wall3.position.y = 1;
    wall3.material = wallMaterial;

    // Cutting table
    const tableMat = new BABYLON.StandardMaterial("tableMat", scene);
    tableMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/wood.jpg", scene);

    const tableTop = BABYLON.MeshBuilder.CreateBox("tableTop", { width: 2, height: 0.1, depth: 1 }, scene);
    tableTop.position.y = 0.75;
    tableTop.material = tableMat;

    // Table legs
    const legHeight = 0.75;
    const legSize = 0.1;

    const leg1 = BABYLON.MeshBuilder.CreateBox("leg1", { width: legSize, height: legHeight, depth: legSize }, scene);
    leg1.position.set(-0.9, legHeight / 2, -0.4);
    leg1.material = tableMat;

    const leg2 = leg1.clone("leg2");
    leg2.position.x = 0.9;

    const leg3 = leg1.clone("leg3");
    leg3.position.z = 0.4;

    const leg4 = leg2.clone("leg4");
    leg4.position.z = 0.4;

    // Table support beam
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

    // Enable WebXR
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-vr",
        },
    });

    const featuresManager = xrHelper.baseExperience.featuresManager;

    // Enable teleportation
    featuresManager.enableFeature(BABYLON.WebXRFeatureName.TELEPORTATION, "latest", {
        xrInput: xrHelper.input,
        floorMeshes: [ground],
    });

    let cutPlank = false;

    // Add interaction
    xrHelper.input.onControllerAddedObservable.add((controller) => {
        const motionController = controller.motionController;
        if (!motionController) return;

        const trigger = motionController.getComponent("xr-standard-trigger");

        trigger.onButtonStateChangedObservable.add(() => {
            if (trigger.pressed) {
                const gripPos = controller.grip.position;

                const distPlank = BABYLON.Vector3.Distance(gripPos, plank.position);
                const distSaw = BABYLON.Vector3.Distance(gripPos, saw.position);

                if (distPlank < 0.5) plank.setParent(controller.grip);
                else if (distSaw < 0.5) saw.setParent(controller.grip);

                if (distPlank < 0.3 && distSaw < 0.3 && !cutPlank) {
                    cutPlank = true;

                    const cutAnim = new BABYLON.Animation("cut", "scaling.x", 30,
                        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

                    cutAnim.setKeys([
                        { frame: 0, value: plank.scaling.x },
                        { frame: 15, value: plank.scaling.x / 2 }
                    ]);

                    plank.animations.push(cutAnim);
                    scene.beginAnimation(plank, 0, 15, false);
                }
            } else {
                plank.setParent(null);
                saw.setParent(null);
            }
        });
    });

    return scene;
};

// Create scene
createScene().then((scene) => {
    engine.runRenderLoop(() => {
        scene.render();
    });
});

window.addEventListener("resize", () => {
    engine.resize();
});