const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Gray background

    // Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;

    // Camera
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    // Lighting
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);
    const concreteMaterial = new BABYLON.StandardMaterial("concreteMaterial", scene);
    concreteMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/concretetile.jpg", scene);
    concreteMaterial.diffuseTexture.uScale = 100;
    concreteMaterial.diffuseTexture.vScale = 100;
    ground.material = concreteMaterial;
    ground.receiveShadows = true;

    // Construction Barrier
    const barrier = BABYLON.MeshBuilder.CreateBox("barrier", { width: 2, height: 1, depth: 0.1 }, scene);
    barrier.position.set(-4, 0.5, 4);
    const barrierMat = new BABYLON.StandardMaterial("barrierMat", scene);
    barrierMat.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/MWtxHjY.png", scene); // Orange/white striped
    barrier.material = barrierMat;

    // Traffic Cones
    const coneMat = new BABYLON.StandardMaterial("coneMat", scene);
    coneMat.diffuseColor = new BABYLON.Color3(1, 0.5, 0); // Orange color
    for (let i = 0; i < 3; i++) {
        const cone = BABYLON.MeshBuilder.CreateCylinder(`cone${i}`, {
            diameterTop: 0,
            diameterBottom: 0.3,
            height: 0.6,
            tessellation: 16
        }, scene);
        cone.position.set(-2 + i * 1, 0.3, -4);
        cone.material = coneMat;
    }

    // Table Material
    const tableMat = new BABYLON.StandardMaterial("tableMat", scene);
    tableMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/wood.jpg", scene);

    // Table Top
    const tableTop = BABYLON.MeshBuilder.CreateBox("tableTop", { width: 2, height: 0.2, depth: 1 }, scene);
    tableTop.position.y = 0.9;
    tableTop.material = tableMat;

    // Table Legs
    const legHeight = 0.9;
    const legSize = 0.2;
    const createLeg = (x, z) => {
        const leg = BABYLON.MeshBuilder.CreateBox("leg", { width: legSize, height: legHeight, depth: legSize }, scene);
        leg.position.set(x, legHeight / 2, z);
        leg.material = tableMat;
    };
    createLeg(-0.9, -0.4);
    createLeg(0.9, -0.4);
    createLeg(-0.9, 0.4);
    createLeg(0.9, 0.4);

    // Table Support
    const support = BABYLON.MeshBuilder.CreateBox("support", { width: 2, height: 0.05, depth: 0.1 }, scene);
    support.position.set(0, 0.3, -0.45);
    support.material = tableMat;

    // Saw
    const saw = BABYLON.MeshBuilder.CreateBox("saw", { width: 0.1, height: 0.05, depth: 0.5 }, scene);
    saw.material = new BABYLON.StandardMaterial("sawMaterial", scene);
    saw.material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    saw.position.set(0, 1.1, 1);

    // Wood Pile
    const plankMaterial = new BABYLON.StandardMaterial("plankMaterial", scene);
    plankMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);

    const woodPile = [];
    const pileStartX = -3;
    const pileStartZ = -2;

    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
            const index = row * 3 + col;
            const plank = BABYLON.MeshBuilder.CreateBox("plank" + index, { width: 1.5, height: 0.1, depth: 0.3 }, scene);
            plank.position.set(
                pileStartX + col * 1.6,
                0.05 + row * 0.12,
                pileStartZ
            );
            plank.material = plankMaterial;
            woodPile.push(plank);
        }
    }

    // XR Setup
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: { sessionMode: "immersive-vr" },
    });

    // Teleportation
    xrHelper.teleportation = await xrHelper.baseExperience.featuresManager.enableFeature(
        BABYLON.WebXRFeatureName.TELEPORTATION,
        "latest",
        {
            xrInput: xrHelper.input,
            floorMeshes: [ground],
        }
    );

    // Interaction — Grab wood or saw
    xrHelper.input.onControllerAddedObservable.add((controller) => {
        const motionController = controller.motionController;
        const grip = controller.grip;

        if (motionController && grip) {
            const trigger = motionController.getComponent("xr-standard-trigger");
            let heldMesh = null;

            trigger.onButtonStateChangedObservable.add(() => {
                if (trigger.pressed) {
                    if (!heldMesh) {
                        const checkGrabbable = [...woodPile, saw];
                        for (const mesh of checkGrabbable) {
                            if (BABYLON.Vector3.Distance(grip.position, mesh.position) < 0.5) {
                                mesh.setParent(grip);
                                heldMesh = mesh;
                                break;
                            }
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