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
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();
  // Change scene background
  scene.background = new THREE.Color(0xe0e0e0);
  //add fog to scene
  scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);
  //add gridhelper
  const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  // Setup a geometry
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  //install "comment tagged templates" and "shader languages support"
  //give sytax highlighting 
  //create vertexShader (verts)
  const vertexShader = /* glsl */`
  //varying type has to match exactly in vertex and fragment shaders
  varying vec2 vUv;
  void main () {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
  }
  `;


  //create fragmentShader (pixels)
  const fragmentShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(vec3(vUv.x), 1.0);
  }
  `;

  // Setup a material
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

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
