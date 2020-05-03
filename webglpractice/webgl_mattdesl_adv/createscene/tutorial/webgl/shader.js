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
  const geometry = new THREE.SphereGeometry(1, 32, 16);

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
  //`uniform vec3 color` passes in the data we created in `material` below
  const fragmentShader = /* glsl */`
  varying vec2 vUv;
  uniform vec3 color;
  uniform float time;
  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 q = vUv;
    q.x *= 2.0;
    vec2 pos = mod(q * 5.0, 1.0);

    float d = distance(pos, center);

    float mask = step(0.25 + sin(time + vUv.x * 2.0) * 0.25, d);

    mask = 1.0 - mask;
    
    vec3 fragColor = mix(color, vec3(1.0), mask);

    gl_FragColor = vec4(vec3(fragColor), 1.0);



  }
  `;

  // Setup a material
  const material = new THREE.ShaderMaterial({
    //we use uniforms to pass in Data to Shaders.
    uniforms: {
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
