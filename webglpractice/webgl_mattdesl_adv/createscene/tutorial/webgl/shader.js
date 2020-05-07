// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/loaders/GLTFLoader");

const canvasSketch = require("canvas-sketch");
const glsl = require("glslify");

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
  const geometry = new THREE.SphereGeometry(1, 32, 16);

  const baseGeom = new THREE.IcosahedronGeometry(1, 1);
  const points = baseGeom.vertices;



  //install "comment tagged templates" and "shader languages support"
  //give sytax highlighting 
  //create vertexShader (verts)
  const vertexShader = /* glsl */`
  //varying type has to match exactly in vertex and fragment shaders
  varying vec2 vUv;
  varying vec3 vPosition;
  void main () {
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
  }
  `;


  //create fragmentShader (pixels)
  //`uniform vec3 color` passes in the data we created in `material` below
  const fragmentShader = glsl(/* glsl */`
  #pragma glslify: noise = require('glsl-noise/simplex/3d');


  varying vec2 vUv;
  varying vec3 vPosition;
  uniform vec3 color;
  uniform float time;

  uniform vec3 points[POINT_COUNT];

  void main() {
    float dist = 10000.0;
    
    
    for (int i = 0; i < POINT_COUNT; i++) {
      vec3 p = points[i];
      float d =distance(vPosition, p);
      dist = min(d, dist);
    }

    float mask = step(0.2, dist);
    mask = 1.0 - mask;

    vec3 fragColor = mix(color, vec3(1.0), mask);

    gl_FragColor = vec4(vec3(fragColor), 1.0);

  }
  `);

  // Setup a material after defining fshader and vshader.
  const material = new THREE.ShaderMaterial({
    defines: {
      POINT_COUNT: points.length
    },
    //we use uniforms to pass in Data to Shaders.
    uniforms: {
      points: { value: points },
      //introduce animation using a uniform called `time` into the shader
      time: { value: 0 },
      color: { value: new THREE.Color("tomato") }
    },
    vertexShader,
    fragmentShader
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  //Create loader
  var loader = new THREE.GLTFLoader();

  //Load a glTF resource

  loader.load('soccerballanim.glb', handle_load,
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.log('An error happened');
      //'An error happened' is being returned. Cross-Origin Request Blocked. Http no supported. 
    }
  );

  //*An error happened* is being logged. ??? Problems-0????
  var sball;

  function handle_load(gltf) {

    sball = gltf.scene.children[0];
    scene.add(sball);
    sball.position.z = -5;

    gltf.scene;
    gltf.scenes;
    gltf.cameras;
    gltf.asset;

  };

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
      material.uniforms.time.value = time;
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
