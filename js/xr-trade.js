const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function() {
    const scene = new BABYLON.Scene(engine);
    
    // Camera setup
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 10, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);

    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Create ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

    // Create plank
    let plank = BABYLON.MeshBuilder.CreateBox("plank", { width: 2, height: 0.1, depth: 0.5 }, scene);
    plank.position.y = 1;
    plank.material = new BABYLON.StandardMaterial("plankMat", scene);
    plankMat.diffuseColor = new BABYLON.Color3(0.76, 0.60, 0.42);

    // Enable WebXR VR
    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-vr"
        },
        optionalFeatures: true
    });

    // XR input handling
    const xrInput = xr.input;

    // Cutting mechanic
    xrInput.onControllerAddedObservable.add(controller => {
        const laser = controller.motionController?.getComponent("xr-standard-trigger");
        
        if (laser) {
            laser.onButtonStateChangedObservable.add((state) => {
                if (state.pressed) {
                    attemptCut(plank, controller.grip.position);
                }
            });
        }
    });

    // Function to cut plank
    function attemptCut(plank, cutPosition) {
        const localCutX = cutPosition.x - plank.position.x;
        
        if (Math.abs(localCutX) > plank.scaling.x / 2) return;

        // Create plank
        const leftPlank = plank.clone("leftPlank");
        leftPlank.scaling.x = Math.abs(localCutX);
        leftPlank.position.x = plank.position.x - (plank.scaling.x - leftPlank.scaling.x) / 2;

        const rightPlank = plank.clone("rightPlank");
        rightPlank.scaling.x = plank.scaling.x - leftPlank.scaling.x;
        rightPlank.position.x = plank.position.x + (rightPlank.scaling.x / 2);

        // Remove plank
        plank.dispose();
    }

    return scene;
};

// Render loop
createScene().then(scene => {
    engine.runRenderLoop(() => scene.render());
});

// Resize event
window.addEventListener("resize", () => {
    engine.resize();
});