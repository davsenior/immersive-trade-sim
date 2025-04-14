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
    const grassMaterial = new BABYLON.StandardMaterial("grassMaterial", scene);
    grassMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/grass.png", scene);
    grassMaterial.diffuseTexture.uScale = 100;
    grassMaterial.diffuseTexture.vScale = 100;
    ground.material = grassMaterial;
    ground.receiveShadows = true;

    // Workbench Material
    const workbenchMaterial = new BABYLON.StandardMaterial("workbenchMaterial", scene);
    workbenchMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/wood.jpg", scene);

    // Workbench Top
    const workbenchTop = BABYLON.MeshBuilder.CreateBox("workbenchTop", { width: 3, height: 0.3, depth: 1.5 }, scene);
    workbenchTop.position.y = 1.2;
    workbenchTop.material = workbenchMaterial;

    // Workbench Legs
    const legHeight = 1.2;
    const legSize = 0.2;
    const createLeg = (x, z) => {
        const leg = BABYLON.MeshBuilder.CreateBox("leg", { width: legSize, height: legHeight, depth: legSize }, scene);
        leg.position.set(x, legHeight / 2, z);
        leg.material = new BABYLON.StandardMaterial("metalMat", scene);
        leg.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    };
    createLeg(-1.4, -0.65);
    createLeg(1.4, -0.65);
    createLeg(-1.4, 0.65);
    createLeg(1.4, 0.65);

    // Back Support for the Workbench
    const backSupport = BABYLON.MeshBuilder.CreateBox("backSupport", { width: 3, height: 0.05, depth: 0.2 }, scene);
    backSupport.position.set(0, 1.6, -0.75);
    backSupport.material = workbenchMaterial;

    // Metal Vise
    const viseBody = BABYLON.MeshBuilder.CreateBox("viseBody", {
        width: 0.2,
        height: 0.1,
        depth: 0.4
    }, scene);
    viseBody.position.set(1.2, 1.1, 0);
    const metalMat = new BABYLON.StandardMaterial("metalMat", scene);
    metalMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    viseBody.material = metalMat;

    // Vise Jaw
    const viseJaw = BABYLON.MeshBuilder.CreateBox("viseJaw", {
        width: 0.05,
        height: 0.1,
        depth: 0.4
    }, scene);
    viseJaw.position.set(1.28, 1.1, 0);
    viseJaw.material = metalMat;

    // Vise Handle 
    const viseHandle = BABYLON.MeshBuilder.CreateCylinder("viseHandle", {
        diameter: 0.02,
        height: 0.4
    }, scene);
    viseHandle.rotation.z = Math.PI / 2;
    viseHandle.position.set(1.25, 1.05, 0);
    viseHandle.material = metalMat;

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