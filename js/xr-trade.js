const canvas = document.getElementById("renderCanvas");
 const engine = new BABYLON.Engine(canvas, true);
 
 // Create the scene
 const createScene = async function () {
     const scene = new BABYLON.Scene(engine);
     scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
 
     // Add camera
     const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 1.6, -3), scene);
     camera.attachControl(canvas, true);
 
     // Add lighting
     const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
     light.intensity = 1;
 
     // Create ground                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
     const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
     const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
     groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
     ground.material = groundMaterial;
 
     // Create Plank
     const plank = BABYLON.MeshBuilder.CreateBox("plank", { width: 1.5, height: 0.1, depth: 0.3 }, scene);
     plank.position.y = 0.05;
     plank.material = new BABYLON.StandardMaterial("plankMaterial", scene);
     plank.material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);
 
     // Enable WebXR (VR/AR mode)
     const xrHelper = await scene.createDefaultXRExperienceAsync({
         uiOptions: {
             sessionMode: "immersive-vr",
         },
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