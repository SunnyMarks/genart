// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("black", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(3, 3, -5);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 32, 16);


  const torus = new THREE.TorusGeometry(1, 0.5, 32, 64); //outer radius size, inner radius(donut thickness), segments


  //Create a Texture and load images
  const loader = new THREE.TextureLoader();
  const texture = loader.load("earth.jpg");
  const moonTexture = loader.load("moon.jpg");

  //Create a Texture for a torus geometry;
  //load in diffuse (color) map(image)
  const torusTexture = loader.load("brick-diffuse.jpg");
  //fix stretching
  //along the horizontal and vertical make sure it wraps seemlessly *
  torusTexture.wrapS = torusTexture.wrapT = THREE.RepeatWrapping;
  //repeat the texture to reduce stretching further along the two axis.
  torusTexture.repeat.set(2, 1).multiplyScalar(2); //scales the repeat vector(2,1)


  // Setup a material
  const material = new THREE.MeshStandardMaterial({
    roughness: 1,
    metalness: 0,
    map: texture
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  //Add mesh to scene
  scene.add(mesh);

  //Create a new Group to make an anchor for rotation 
  const moonGroup = new THREE.Group();
  const moonMaterial = new THREE.MeshStandardMaterial({
    roughness: 1,
    metalness: 0,
    map: moonTexture
  });
  const moonMesh = new THREE.Mesh(geometry, moonMaterial);
  moonMesh.position.set(1.5, 1, 0);
  moonMesh.scale.setScalar(0.25);

  //Create a torus material & mesh, and add it to moonGroup
  const torusMaterial = new THREE.MeshStandardMaterial({
    roughness: 1,
    metalness: 0,
    map: torusTexture
  });

  const torusMesh = new THREE.Mesh(torus, torusMaterial);
  torusMesh.position.set(2.5, 1, 0);
  torusMesh.scale.set(0.50);


  //Add mesh to group
  moonGroup.add(moonMesh);
  moonGroup.add(torusMesh);

  //Add group to scene
  scene.add(moonGroup);

  //Create a new light
  const light = new THREE.PointLight("white", 3);
  light.position.set(0, 2, 2);
  scene.add(light);

  //Create new Light Helper to see light position
  scene.add(new THREE.PointLightHelper(light, 0.15));  //target, size

  //Create new Grid Helper to see orgin
  scene.add(new THREE.GridHelper(5, 50));

  //Create new Axis Heler to see the axis
  var axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      mesh.rotation.y = time * 0.15;
      moonMesh.rotation.y = time * .085;
      moonGroup.rotation.y = time * 0.5;
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
