const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5);

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

    // Camera and lighting
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
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

    // Table mat
    const tableMat = new BABYLON.StandardMaterial("tableMat", scene);
    tableMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/wood.jpg", scene);

    // Helper to create a station with a label
    function createStation(scene, name, position, titleText) {
        const station = new BABYLON.TransformNode(name, scene);
        station.position = position;
        const titlePlane = BABYLON.MeshBuilder.CreatePlane(`${name}_title`, { width: 2, height: 0.5 }, scene);
        titlePlane.position = new BABYLON.Vector3(0, 2.5, 0);
        titlePlane.parent = station;
        const titleMat = new BABYLON.StandardMaterial(`${name}_mat`, scene);
        const dynamicTexture = new BABYLON.DynamicTexture(`${name}_textTex`, { width: 512, height: 256 }, scene, true);
        dynamicTexture.drawText(titleText, 50, 150, "bold 60px Arial", "white", "transparent", true);
        titleMat.diffuseTexture = dynamicTexture;
        titlePlane.material = titleMat;
        return station;
    }

    const woodStation = createStation(scene, "woodStation", new BABYLON.Vector3(0, 0, 0), "Wood Cutting");
    const wiringStation = createStation(scene, "wiringStation", new BABYLON.Vector3(8, 0, 0), "Wiring Test");
    const hammerStation = createStation(scene, "hammerStation", new BABYLON.Vector3(-8, 0, 0), "Nail Hammering");

    // Table for wood station
    const tableTop = BABYLON.MeshBuilder.CreateBox("tableTop", { width: 2, height: 0.2, depth: 1 }, scene);
    tableTop.position.set(0, 0.9, 0);
    tableTop.material = tableMat;
    tableTop.parent = woodStation;

    // Table legs
    const legHeight = 0.9;
    const legSize = 0.2;
    const createLeg = (x, z) => {
        const leg = BABYLON.MeshBuilder.CreateBox("leg", { width: legSize, height: legHeight, depth: legSize }, scene);
        leg.position.set(x, legHeight / 2, z);
        leg.material = tableMat;
        leg.parent = woodStation;
    };
    createLeg(-0.9, -0.4);
    createLeg(0.9, -0.4);
    createLeg(-0.9, 0.4);
    createLeg(0.9, 0.4);

    // Table for wiring station
    const wiringTableTop = BABYLON.MeshBuilder.CreateBox("wiringTableTop", { width: 2, height: 0.2, depth: 1 }, scene);
    wiringTableTop.position.set(0, 0.9, 0);
    wiringTableTop.material = tableMat;
    wiringTableTop.parent = wiringStation;
    
    const createWiringLeg = (x, z) => {
        const leg = BABYLON.MeshBuilder.CreateBox("wiringLeg", { width: legSize, height: legHeight, depth: legSize }, scene);
        leg.position.set(x, legHeight / 2, z);
        leg.material = tableMat;
        leg.parent = wiringStation;
    };
    createWiringLeg(-0.9, -0.4);
    createWiringLeg(0.9, -0.4);
    createWiringLeg(-0.9, 0.4);
    createWiringLeg(0.9, 0.4);
    
    // Table for hammer station
    const hammerTableTop = BABYLON.MeshBuilder.CreateBox("hammerTableTop", { width: 2, height: 0.2, depth: 1 }, scene);
    hammerTableTop.position.set(0, 0.9, 0);
    hammerTableTop.material = tableMat;
    hammerTableTop.parent = hammerStation;
    
    const createHammerLeg = (x, z) => {
        const leg = BABYLON.MeshBuilder.CreateBox("hammerLeg", { width: legSize, height: legHeight, depth: legSize }, scene);
        leg.position.set(x, legHeight / 2, z);
        leg.material = tableMat;
        leg.parent = hammerStation;
    };
    createHammerLeg(-0.9, -0.4);
    createHammerLeg(0.9, -0.4);
    createHammerLeg(-0.9, 0.4);
    createHammerLeg(0.9, 0.4);

    // Saw blade/ handle
    const blade = BABYLON.MeshBuilder.CreateBox("blade", { width: 0.05, height: 0.05, depth: 0.5 }, scene);
    blade.material = new BABYLON.StandardMaterial("bladeMat", scene);
    blade.material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    blade.position.set(0, 1.1, 1);
    blade.parent = woodStation;
    const handle = BABYLON.MeshBuilder.CreateBox("handle", { width: 0.1, height: 0.1, depth: 0.2 }, scene);
    handle.material = new BABYLON.StandardMaterial("handleMat", scene);
    handle.material.diffuseColor = new BABYLON.Color3(0.2, 0.1, 0.05);
    handle.position.set(0, -0.05, -0.15);
    handle.parent = blade;

    // Wood pile
    const plankMaterial = new BABYLON.StandardMaterial("plankMaterial", scene);
    plankMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);
    const woodPile = [];
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
            const index = row * 3 + col;
            const plank = BABYLON.MeshBuilder.CreateBox("plank" + index, { width: 1.5, height: 0.1, depth: 0.3 }, scene);
            plank.position.set(-3 + col * 1.6, 0.05 + row * 0.12, -2);
            plank.material = plankMaterial;
            plank.parent = woodStation;
            woodPile.push(plank);
        }
    }

    // Wire
    const wire = BABYLON.MeshBuilder.CreateCylinder("wire", { height: 1, diameter: 0.05 }, scene);
    wire.material = new BABYLON.StandardMaterial("wireMat", scene);
    wire.material.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    wire.position.set(8, 1, 0);
    wire.parent = wiringStation;

    // Hammer
    const hammer = BABYLON.MeshBuilder.CreateBox("hammer", { width: 0.1, height: 0.1, depth: 0.4 }, scene);
    hammer.material = new BABYLON.StandardMaterial("hammerMat", scene);
    hammer.material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    hammer.position.set(-8, 1.1, 0);
    hammer.parent = hammerStation;

    // Nail
    const nail = BABYLON.MeshBuilder.CreateCylinder("nail", { height: 0.3, diameter: 0.05 }, scene);
    nail.material = new BABYLON.StandardMaterial("nailMat", scene);
    nail.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    nail.position.set(-8, 1.05, 0.3);
    nail.parent = hammerStation;

    // Enable WebXR
    const xrHelper = await scene.createDefaultXRExperienceAsync({ uiOptions: { sessionMode: "immersive-vr" } });

    // Teleportation
    xrHelper.teleportation = await xrHelper.baseExperience.featuresManager.enableFeature(
        BABYLON.WebXRFeatureName.TELEPORTATION,
        "latest",
        {
            xrInput: xrHelper.input,
            floorMeshes: [ground],
        }
    );

    // VR Controller Interaction
    xrHelper.input.onControllerAddedObservable.add((controller) => {
        const motionController = controller.motionController;
        const grip = controller.grip;

        if (motionController && grip) {
            const trigger = motionController.getComponent("xr-standard-trigger");
            let heldMesh = null;

            trigger.onButtonStateChangedObservable.add(() => {
                if (trigger.pressed) {
                    if (!heldMesh) {
                        const checkGrabbable = [...woodPile, blade, hammer, wire];
                        for (const mesh of checkGrabbable) {
                            if (BABYLON.Vector3.Distance(mesh.getAbsolutePosition(), grip.getAbsolutePosition()) < 0.3) {
                                mesh.setParent(grip);
                                heldMesh = mesh;
                                break;
                            }
                        }
                    } else {
                        if (heldMesh === hammer) {
                            const distToNail = BABYLON.Vector3.Distance(nail.getAbsolutePosition(), grip.getAbsolutePosition());
                            if (distToNail < 0.3 && nail.scaling.y > 0.1) {
                                nail.scaling.y -= 0.05;
                                nail.position.y -= 0.025;
                            }
                        }

                        // Wire interaction
                        if (heldMesh === wire) {
                            wire.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
                        }

                        // Cut plank in half
                        if (woodPile.includes(heldMesh)) {
                            const distToBlade = BABYLON.Vector3.Distance(heldMesh.getAbsolutePosition(), blade.getAbsolutePosition());
                            if (distToBlade < 0.3) {
                                const pos = heldMesh.getAbsolutePosition();
                                const left = BABYLON.MeshBuilder.CreateBox("plank_left", { width: 0.75, height: 0.1, depth: 0.3 }, scene);
                                const right = BABYLON.MeshBuilder.CreateBox("plank_right", { width: 0.75, height: 0.1, depth: 0.3 }, scene);
                                left.position = new BABYLON.Vector3(pos.x - 0.4, pos.y, pos.z);
                                right.position = new BABYLON.Vector3(pos.x + 0.4, pos.y, pos.z);
                                left.material = plankMaterial;
                                right.material = plankMaterial;
                                left.parent = woodStation;
                                right.parent = woodStation;
                                heldMesh.dispose();
                                woodPile.splice(woodPile.indexOf(heldMesh), 1);
                                heldMesh = null;
                            }
                        }
                    }
                } else {
                    if (heldMesh) {
                        heldMesh.setParent(null);

                        if (heldMesh === wire) {
                            wire.material.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                        }

                        if (woodPile.includes(heldMesh)) {
                            new BABYLON.PhysicsImpostor(heldMesh, BABYLON.PhysicsImpostor.BoxImpostor, {
                                mass: 1,
                                restitution: 0.3
                            }, scene);
                        }

                        heldMesh = null;
                    }
                }
            });
        }
    });

    return scene;
};

createScene().then((scene) => {
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
});