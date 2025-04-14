const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Create scene
const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;

    // Add camera
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    // Add lighting
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create ground with grass texture
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);
    const grassMaterial = new BABYLON.StandardMaterial("grassMaterial", scene);
    grassMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/grass.png", scene);
    grassMaterial.diffuseTexture.uScale = 100;
    grassMaterial.diffuseTexture.vScale = 100;
    ground.material = grassMaterial;
    ground.receiveShadows = true;

    // Cutting table
    const tableMat = new BABYLON.StandardMaterial("tableMat", scene);
    tableMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/wood.jpg", scene);

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

    xrHelper.teleportation = await xrHelper.baseExperience.featuresManager.enableFeature(
        BABYLON.WebXRFeatureName.TELEPORTATION,
        "latest",
        {
            xrInput: xrHelper.input,
            floorMeshes: [ground],
        }
    );

    // Grabbing plank and saw
    xrHelper.input.onControllerAddedObservable.add((controller) => {
        const motionController = controller.motionController;
        const grip = controller.grip;

        if (motionController && grip) {
            const trigger = motionController.getComponent("xr-standard-trigger");

            let heldMesh = null;

            trigger.onButtonStateChangedObservable.add(() => {
                if (trigger.pressed) {
                    if (!heldMesh) {
                        const distToPlank = BABYLON.Vector3.Distance(grip.position, plank.position);
                        const distToSaw = BABYLON.Vector3.Distance(grip.position, saw.position);

                        if (distToPlank < 0.5) {
                            plank.setParent(grip);
                            heldMesh = plank;
                        } else if (distToSaw < 0.5) {
                            saw.setParent(grip);
                            heldMesh = saw;
                        }
                    }
                } else {
                    if (heldMesh) {
                        heldMesh.setParent(null);
                        heldMesh = null;
                    }
                }
            });
        }
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