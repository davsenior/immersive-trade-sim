const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5); // grey background
    // XR setup
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

    // Controller
    xrHelper.input.onControllerAddedObservable.add((controller) => {
        const motionController = controller.motionController;
        const grip = controller.grip;

        if (motionController && grip) {
            const trigger = motionController.getComponent("xr-standard-trigger");
            let heldMesh = null;

            trigger.onButtonStateChangedObservable.add(() => {
                if (trigger.pressed) {
                    // Grab
                    if (!heldMesh) {
                        const checkGrabbable = [...woodPile, blade, hammer, wire];
                        for (const mesh of checkGrabbable) {
                            const gripPos = grip.getAbsolutePosition();
                            const meshPos = mesh.getAbsolutePosition();
                            if (BABYLON.Vector3.Distance(gripPos, meshPos) < 0.3) {
                                mesh.setParent(grip);
                                heldMesh = mesh;
                                break;
                            }
                        }
                    } else {
                        // Nail
                        if (heldMesh === hammer) {
                            const distToNail = BABYLON.Vector3.Distance(nail.getAbsolutePosition(), grip.getAbsolutePosition());
                            if (distToNail < 0.3 && nail.scaling.y > 0.1) {
                                nail.scaling.y -= 0.05;
                                nail.position.y -= 0.025;
                            }
                        }

                        // Wire
                        if (heldMesh === wire) {
                            wire.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
                        }

                        // Cutting wood
                        if (woodPile.includes(heldMesh)) {
                            const distToBlade = BABYLON.Vector3.Distance(heldMesh.getAbsolutePosition(), blade.getAbsolutePosition());
                            if (distToBlade < 0.3) {
                                const pos = heldMesh.getAbsolutePosition();
                                const newWidth = heldMesh.scaling.x * 0.5;

                                const left = BABYLON.MeshBuilder.CreateBox("plank_left", { width: newWidth * 1.5, height: 0.1, depth: 0.3 }, scene);
                                left.material = plankMaterial;
                                left.position = new BABYLON.Vector3(pos.x - 0.4, pos.y, pos.z);
                                left.parent = woodStation;

                                const right = BABYLON.MeshBuilder.CreateBox("plank_right", { width: newWidth * 1.5, height: 0.1, depth: 0.3 }, scene);
                                right.material = plankMaterial;
                                right.position = new BABYLON.Vector3(pos.x + 0.4, pos.y, pos.z);
                                right.parent = woodStation;

                                heldMesh.dispose();
                                heldMesh = null;
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

createScene().then((scene) => {
    engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());