import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import gsap from 'gsap';

// const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 81,
    heightSegments: 81,
  },
};
// gui.add(world.plane, 'width', 1, 500).onChange(generatePlane);
// gui.add(world.plane, 'height', 1, 500).onChange(generatePlane);
// gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane);
// gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane);

function generatePlane() {
  const positionAttribute = planeMesh.geometry.attributes.position;
  const { array } = positionAttribute;
  const randomValues = [];

  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      array[i] = x + (Math.random() - 0.5) * 3;
      array[i + 1] = y + (Math.random() - 0.5) * 3;
      array[i + 2] = z + (Math.random() - 0.5) * 3;
    }

    randomValues.push(Math.random() * Math.PI * 2);
  }

  positionAttribute.randomValues = randomValues;
  positionAttribute.originalPosition = array;

  const colors = [];

  for (let i = 0; i < positionAttribute.count; i++) {
    colors.push(0.16, 0.18, 0.45);
  }

  planeMesh.geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);
camera.position.z = 50;

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
);
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: true,
  vertexColors: true,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
generatePlane();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, -1, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

const getRandomLightColor = () => {
  const min = 200;
  const color = `rgb(${min + Math.floor(Math.random() * (255 - min))}, ${
    min + Math.floor(Math.random() * (255 - min))
  }, ${min + Math.floor(Math.random() * (255 - min))})`;
  return color;
};

const randomLightColor = getRandomLightColor();

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: randomLightColor });
// const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

const starVerticies = [];
for (let i = 0; i < 25000; i++) {
  const x = (Math.random() - 0.5) * 2500;
  const y = (Math.random() - 0.5) * 2500;
  const z = (Math.random() - 0.5) * 2500;
  starVerticies.push(x, y, z);
}
console.log(starVerticies);

starGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starVerticies, 3)
);

console.log(starGeometry);
console.log(starMaterial);

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Moon

const moonTexture = new THREE.TextureLoader().load(
  'https://i.postimg.cc/ZYCjm73B/moon.jpg'
);
const normalTexture = new THREE.TextureLoader().load(
  'https://i.postimg.cc/K8wx9snP/normal.jpg'
);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(35, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);

scene.add(moon);

moon.position.z = 100;
moon.position.y = 550;
moon.position.setX(100);

const mouse = {
  x: undefined,
  y: undefined,
};

let frame = 0;
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera);
  frame += 0.01;

  const { array, originalPosition, randomValues } =
    planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    // x
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01;

    // y
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.001;
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;

  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes;

    // vertice 1
    color.setX(intersects[0].face.a, 0.1);
    color.setY(intersects[0].face.a, 0.5);
    color.setZ(intersects[0].face.a, 1);

    // vertice 2
    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);

    // vertice 3
    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);

    intersects[0].object.geometry.attributes.color.needsUpdate = true;

    const initialColor = {
      r: 0.16,
      g: 0.18,
      b: 0.45,
    };

    const hoverColor = {
      r: 0.87,
      g: 0.19,
      b: 0.52,
    };

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        // vertice 1
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        // vertice 2
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        // vertice 3
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);
        color.needsUpdate = true;
      },
    });
  }
  stars.rotation.x += 0.0006;
  stars.rotation.z += 0.0005;
  stars.rotation.y += 0.0005;
  moon.rotation.z += 0.0005;
  moon.rotation.x += 0.0006;
}

animate();

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});

gsap.to('#georgekwan', {
  opacity: 1,
  duration: 1.5,
  y: 0,
  ease: 'expo',
});
gsap.to('#aboutMe', {
  opacity: 1,
  duration: 1.5,
  delay: 0.3,
  y: 0,
  ease: 'expo',
});
gsap.to('#viewWorkBtn', {
  opacity: 1,
  duration: 1.5,
  delay: 0.6,
  y: 0,
  ease: 'expo',
});

document.querySelector('#viewWorkBtn').addEventListener('click', (e) => {
  e.preventDefault();
  gsap.to('#container', {
    opacity: 0,
  });

  gsap.to(camera.position, {
    z: 25,
    ease: 'power3.inOut',
    duration: 2,
  });
  gsap.to(camera.rotation, {
    x: 1.57,
    ease: 'power3.inOut',
    duration: 2,
  });
  gsap.to(camera.position, {
    y: 1000,
    ease: 'expo.in',
    duration: 1.5,
    delay: 2,
    onComplete: () => {
      window.location = 'https://github.com/georgekwan';
    },
  });
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
