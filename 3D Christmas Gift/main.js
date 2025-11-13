// --- The 3D "Jaw-Drop" Engine ---
// This is the "skill" file. It's clean, professional, and powerful.

import * as THREE from 'three';

// --- GLOBAL VARS ---
let scene, camera, renderer, car, road, stars, snow, christmasStar;
let ambientLight, dirLight;
let loaderElement = document.getElementById('loader');

// Arrays to hold objects for the journey
const journeyObjects = new THREE.Group();
const wheels = [];

// Character references for animation
let joeChar, jedChar, hikerChar;

// Scroll progress (0.0 to 1.0)
let scrollT = 0;
let isDriving = false;

// --- KEYPOSITIONS for the journey ---
const journeyLength = 100;
const carStartPosition = new THREE.Vector3(0, 0.4, 0);
const carEndPosition = new THREE.Vector3(0, 0.4, -journeyLength);

const cameraFollowOffset = new THREE.Vector3(0, 3, 7);

// --- INIT FUNCTION ---
// This is the main function that starts everything.
async function init() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 50); // Cinematic fog

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 10); // Start zoomed out
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lights
    ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft ambient
    dirLight = new THREE.DirectionalLight(0xffffff, 3); // Main sun
    dirLight.position.set(10, 20, 5);
    dirLight.castShadow = true;
    scene.add(ambientLight, dirLight);

    // --- BUILD THE WORLD ---
    createCar(); // This car is now "premium"
    createRoad();
    createWorldObjects(); // This now adds characters
    createStars();
    createSnow(); // Add the "magic"
    createChristmasStar(); // Add the final star
    
    scene.add(journeyObjects, stars, snow, christmasStar);
    
    // Initial state of christmas star
    christmasStar.visible = false; 

    // Hide loader and show scene 1
    loaderElement.style.display = 'none';
    document.getElementById('scene-1').classList.add('visible');

    // Start the animation loop
    animate();
}

// --- CREATE 3D OBJECTS ---

function createCar() {
    car = new THREE.Group();
    
    // "Premium" Paint Material
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0xef4444, // The original red
        roughness: 0.1,  // Shiny
        metalness: 0.8,  // Very metallic
    });
    
    // Add a "clear coat" for that "£1000" look
    bodyMat.clearcoat = 1.0;
    bodyMat.clearcoatRoughness = 0.1;

    const glassMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.1, metalness: 0.5 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    
    // --- Car Lights (The "Premium" touch) ---
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 2 });
    const brakelightMat = new THREE.MeshBasicMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2 });

    const headlightGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
    const hl1 = new THREE.Mesh(headlightGeo, headlightMat);
    hl1.position.set(0.7, 0.2, -1.75);
    const hl2 = new THREE.Mesh(headlightGeo, headlightMat);
    hl2.position.set(-0.7, 0.2, -1.75);

    const bl1 = new THREE.Mesh(headlightGeo, brakelightMat); // Re-use geo
    bl1.position.set(0.7, 0.2, 1.75);
    const bl2 = new THREE.Mesh(headlightGeo, brakelightMat);
    bl2.position.set(-0.7, 0.2, 1.75);
    
    // Body
    const bodyGeo = new THREE.BoxGeometry(2, 0.8, 3.5);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    
    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.6, 0.7, 1.5);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.75, -0.2);
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    wheelGeo.rotateZ(Math.PI / 2); // Orient them
    
    const wheelFL = new THREE.Mesh(wheelGeo, wheelMat);
    wheelFL.position.set(1.1, -0.1, 1);
    const wheelFR = new THREE.Mesh(wheelGeo, wheelMat);
    wheelFR.position.set(-1.1, -0.1, 1);
    const wheelRL = new THREE.Mesh(wheelGeo, wheelMat);
    wheelRL.position.set(1.1, -0.1, -1);
    const wheelRR = new THREE.Mesh(wheelGeo, wheelMat);
    wheelRR.position.set(-1.1, -0.1, -1);
    
    wheels.push(wheelFL, wheelFR, wheelRL, wheelRR);
    
    car.add(body, cabin, wheelFL, wheelFR, wheelRL, wheelRR, hl1, hl2, bl1, bl2);
    car.position.copy(carStartPosition);
    scene.add(car);
}

function createRoad() {
    const roadGeo = new THREE.PlaneGeometry(8, journeyLength + 20);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.8 });
    road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -journeyLength / 2 + 10;
    road.receiveShadow = true;
    scene.add(road);
    
    const lineMat = new THREE.LineDashedMaterial({ color: 0xaaaaaa, dashSize: 0.5, gapSize: 0.5 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.01, 10),
        new THREE.Vector3(0, 0.01, -journeyLength - 10)
    ]);
    const roadLine = new THREE.Line(lineGeo, lineMat);
    roadLine.computeLineDistances();
    scene.add(roadLine);
}

// --- NEW "Character" Function ---
function createCharacter(color) {
    const char = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
    
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat);
    head.position.y = 1.25;
    
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.4), mat);
    body.position.y = 0.5;
    
    char.add(head, body);
    char.castShadow = true;
    return char;
}

// --- NEW Text Label Function (for mountains) ---
function createTextLabel(text, position, color = 0xffffff, size = 1) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${30 * size}px 'Inter'`;
    context.fillStyle = `#${new THREE.Color(color).getHexString()}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const metrics = context.measureText(text);
    canvas.width = metrics.width + 20; // Add padding
    canvas.height = 30 * size + 20;
    context.font = `${30 * size}px 'Inter'`; // Re-set font after canvas resize
    context.fillStyle = `#${new THREE.Color(color).getHexString()}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // For crisp text
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Scale sprite based on text size and desired 3D size
    const aspectRatio = canvas.width / canvas.height;
    sprite.scale.set(5 * aspectRatio * size, 5 * size, 1); 
    sprite.position.copy(position);
    return sprite;
}


function createWorldObjects() {
    // --- BK Sign (with Joe Character) ---
    const bkSign = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2;
    
    const signGeo = new THREE.BoxGeometry(2, 1, 0.2);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.y = 2.5;

    const logoGeo = new THREE.BoxGeometry(1.5, 0.8, 0.1);
    const logoMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.position.z = 0.11; 
    
    const signLight = new THREE.PointLight(0xfde047, 5, 5);
    signLight.position.y = 0.5;
    
    sign.add(logo, signLight);
    bkSign.add(pole, sign);
    bkSign.position.set(5, 0, -5);
    journeyObjects.add(bkSign);

    // Removed 'BK' text label

    // Add Joe Character (blue)
    joeChar = createCharacter(0x0091ff); // Blue
    joeChar.position.set(4.5, 0, -4);
    journeyObjects.add(joeChar);

    // --- Snacks (with Jed Character) ---
    const snacks = new THREE.Group();
    const burgerMat = new THREE.MeshStandardMaterial({ color: 0x966919 });
    const bunGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    const bunTop = new THREE.Mesh(bunGeo, burgerMat);
    bunTop.position.y = 0.3;
    const bunBottom = new THREE.Mesh(bunGeo, burgerMat);
    snacks.add(bunTop, bunBottom);
    
    const friesMat = new THREE.MeshStandardMaterial({ color: 0xfde047 });
    const fryGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    for(let i=0; i<10; i++) {
        const fry = new THREE.Mesh(fryGeo, friesMat);
        fry.position.set(
            THREE.MathUtils.randFloat(-0.2, 0.2),
            THREE.MathUtils.randFloat(0, 0.25),
            THREE.MathUtils.randFloat(-0.2, 0.2)
        );
        fry.position.y += 0.25;
        snacks.add(fry);
    }
    snacks.position.set(-5, 0.5, -30);
    journeyObjects.add(snacks);
    
    // Add Jed Character (green)
    jedChar = createCharacter(0x4ade80); // Green
    jedChar.position.set(-4.5, 0, -29);
    journeyObjects.add(jedChar);


    // --- Mountains (with Hiker Character and labels) ---
    const mountainGeo = new THREE.ConeGeometry(8, 15, 6);
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 1 });
    const m1 = new THREE.Mesh(mountainGeo, mountainMat);
    m1.position.set(-10, 7.5, -60);
    const m2 = new THREE.Mesh(mountainGeo, mountainMat);
    m2.scale.set(0.8, 0.8, 0.8);
    m2.position.set(12, 6, -65);
    journeyObjects.add(m1, m2);

    // Add Hiker Character (orange)
    hikerChar = createCharacter(0xfb923c); // Orange
    hikerChar.position.set(-9, 7.5, -58); // On the mountain
    hikerChar.rotation.y = 0.5;
    journeyObjects.add(hikerChar);

    // Add Mountain Text Labels
    const helvellynLabel = createTextLabel('HELVELLYN', new THREE.Vector3(-10, 15, -60), 0xffffff, 0.7);
    const langdaleLabel = createTextLabel('LANGDALE', new THREE.Vector3(12, 10, -65), 0xffffff, 0.7);
    journeyObjects.add(helvellynLabel, langdaleLabel);
    
    // --- Home ---
    const home = new THREE.Group();
    const houseGeo = new THREE.BoxGeometry(2, 2, 2);
    const houseMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const house = new THREE.Mesh(houseGeo, houseMat);
    house.position.y = 1;
    
    const roofGeo = new THREE.ConeGeometry(1.7, 1, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x800000 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.5;
    roof.rotation.y = Math.PI / 4;
    
    home.add(house, roof);
    home.position.set(0, 0, -journeyLength);
    journeyObjects.add(home);
}

function createStars() {
    const starGeo = new THREE.BufferGeometry();
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starVertices = [];
    for(let i=0; i<10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(200);
        const y = THREE.MathUtils.randFloatSpread(200);
        const z = THREE.MathUtils.randFloatSpread(200);
        starVertices.push(x, y, z);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    stars = new THREE.Points(starGeo, starMat);
    stars.position.z = -100; // Place them far back
}

// --- NEW Snow Function ---
function createSnow() {
    const snowGeo = new THREE.BufferGeometry();
    const snowMat = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.1, 
        transparent: true, 
        opacity: 0.8,
        depthWrite: false // Prevents weird artifacts
    });
    
    const snowVertices = [];
    const snowCount = 5000;
    
    for (let i = 0; i < snowCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(100);
        const y = THREE.MathUtils.randFloat(0, 100);
        const z = THREE.MathUtils.randFloatSpread(100);
        snowVertices.push(x, y, z);
    }
    
    snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(snowVertices, 3));
    snow = new THREE.Points(snowGeo, snowMat);
    snow.position.z = -50; // Center the snowfield
}

// --- NEW Christmas Star Function ---
function createChristmasStar() {
    const starShape = new THREE.Shape();
    starShape.moveTo(0, 1);
    starShape.lineTo(0.2, 0.2);
    starShape.lineTo(1, 0.2);
    starShape.lineTo(0.4, -0.2);
    starShape.lineTo(0.6, -1);
    starShape.lineTo(0, -0.6);
    starShape.lineTo(-0.6, -1);
    starShape.lineTo(-0.4, -0.2);
    starShape.lineTo(-1, 0.2);
    starShape.lineTo(-0.2, 0.2);

    const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
    };

    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfde047, emissive: 0xfde047, emissiveIntensity: 2 });
    christmasStar = new THREE.Mesh(starGeo, starMat);
    christmasStar.scale.set(1.5, 1.5, 1.5);
    christmasStar.position.set(0, 5, -journeyLength); // Above the home
    christmasStar.rotation.y = Math.PI / 4;
}

// --- ANIMATION & SCROLL ---

function onScroll() {
    // Calculate scroll percentage
    const scrollTop = document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollT = scrollTop / docHeight;
    
    // Check if driving
    isDriving = scrollT > 0.01 && scrollT < 0.9;

    // --- Update HTML Text Scenes ---
    const scenes = document.querySelectorAll('.scene-text');
    scenes.forEach(s => s.classList.remove('visible'));
    
    if (scrollT < 0.08) {
        document.getElementById('scene-1').classList.add('visible');
    } else if (scrollT < 0.25) {
        document.getElementById('scene-2').classList.add('visible');
    } else if (scrollT < 0.45) {
        document.getElementById('scene-3').classList.add('visible');
    } else if (scrollT < 0.65) {
        document.getElementById('scene-4').classList.add('visible');
        // Removed photo overlay logic
    } else if (scrollT < 0.85) {
        document.getElementById('scene-5').classList.add('visible');
    } else {
        document.getElementById('scene-6').classList.add('visible');
    }
}

// The animation loop
function animate() {
    requestAnimationFrame(animate);

    // --- SMOOTH LERPING (The "Apple" magic) ---
    
    // 1. Car Position
    const carTargetZ = THREE.MathUtils.lerp(carStartPosition.z, carEndPosition.z, scrollT);
    car.position.z = THREE.MathUtils.lerp(car.position.z, carTargetZ, 0.05);

    // 2. Camera Position
    let cameraTarget = new THREE.Vector3();
    if (scrollT < 0.9) {
        cameraTarget.copy(car.position).add(cameraFollowOffset);
    } else {
        // Finale: Camera detaches and pans up
        cameraTarget.copy(car.position).add(new THREE.Vector3(0, 10, -5));
    }
    
    camera.position.lerp(cameraTarget, 0.05);
    camera.lookAt(car.position);
    
    // 3. Wheel Spinning
    if (isDriving) {
        wheels.forEach(w => w.rotation.x -= 0.2);
    }
    
    // 4. --- Animate Snow ---
    const positions = snow.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        // Fall down
        positions[i + 1] -= 0.05; 
        
        // Reset to top
        if (positions[i + 1] < -20) {
            positions[i + 1] = 50;
        }
    }
    snow.geometry.attributes.position.needsUpdate = true;
    snow.position.z = camera.position.z - 50; // Keep snow centered on camera

    // 5. --- Character Animations (Interactive & Fun) ---
    // Make them subtly bounce or wave
    const waveTime = performance.now() * 0.005;

    // Joe at BK (appears when car is near BK sign)
    if (scrollT > 0.05 && scrollT < 0.15) {
        joeChar.position.y = 0 + Math.sin(waveTime) * 0.1;
        joeChar.rotation.y = Math.sin(waveTime * 2) * 0.1;
    } else {
        joeChar.position.y = 0;
        joeChar.rotation.y = 0;
    }

    // Jed at Snacks (appears when car is near snacks)
    if (scrollT > 0.25 && scrollT < 0.35) {
        jedChar.position.y = 0 + Math.sin(waveTime + Math.PI / 2) * 0.1;
        jedChar.rotation.y = Math.cos(waveTime * 2) * 0.1;
    } else {
        jedChar.position.y = 0;
        jedChar.rotation.y = 0;
    }
    
    // Hiker at Mountains (appears when car is near mountains)
    if (scrollT > 0.48 && scrollT < 0.58) {
        hikerChar.position.y = 7.5 + Math.sin(waveTime * 1.5) * 0.2;
        hikerChar.rotation.y = 0.5 + Math.sin(waveTime * 3) * 0.05;
    } else {
        hikerChar.position.y = 7.5;
        hikerChar.rotation.y = 0.5;
    }

    // 6. --- Christmas Star Visibility ---
    if (scrollT > 0.95) { // Show star only at the very end
        christmasStar.visible = true;
        christmasStar.rotation.y += 0.01; // Make it spin
    } else {
        christmasStar.visible = false;
    }

    // Render the scene
    renderer.render(scene, camera);
}

// --- RESIZE HANDLER ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- EVENT LISTENERS ---
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onWindowResize);

// --- START ---
init();
onScroll(); // Call once on load to set initial text