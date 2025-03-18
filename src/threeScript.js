import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane'
import * as CANNON from 'cannon-es'

/**
 * Debug
 */

const pane = new Pane()

pane.title = 'drag here to move'

const titleBar = pane.element.children[0]

pane.element.style.position = 'absolute'
pane.element.style.top = '20px'
pane.element.style.left = '20px'
titleBar.style.cursor = 'grab'

let isDragging = false
let offsetX, offsetY

titleBar.addEventListener('mousedown', (event) => {
    isDragging = true
    offsetX = event.clientX - pane.element.offsetLeft
    offsetY = event.clientY - pane.element.offsetTop
    titleBar.style.cursor = 'grabbing'
})

titleBar.addEventListener('mouseup', (event) => {
    pane.expanded = !pane.expanded
})

window.addEventListener('mousemove', (event) => {
    if (!isDragging) return
    pane.element.style.left = `${event.clientX - offsetX}px`
    pane.element.style.top = `${event.clientY - offsetY}px`
})

window.addEventListener('mouseup', () => {
    isDragging = false
    titleBar.style.cursor = 'grab'
})

const physicsFolder = pane.addFolder({ title: 'physics object' })

physicsFolder
    .addButton({
        title: 'add sphere'
    })
    .on('click', () => {
        createSphere(
            0.02,
            {
                x: 0,
                y: 0.5,
                z: -0.5
            },
            1
        )
    })

physicsFolder
    .addButton({
        title: 'remove objects'
    })
    .on('click', () => {
        for(const object of objectsToUpdate)
        {
            world.removeBody(object.body)
            scene.remove(object.mesh)
        }
        objectsToUpdate.splice(0, objectsToUpdate.length)
    })



/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.add(new THREE.GridHelper(10, 10))

/**
 * Physics
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, - 9.82, 0)

// Default material
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.5,
        restitution: 0.3
    }
)
world.defaultContactMaterial = defaultContactMaterial

// Floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 
world.addBody(floorBody)

/**
 * Utils
 */
const objectsToUpdate = []

// Create sphere
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMapIntensity: 0.5
})

const landmarks = []
let landmarkPositions

const createSphere = (radius, position, mass=1, color='#ffffff') =>
{
    // Three.js mesh

    const sphereMaterial = new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMapIntensity: 0.5
    })

    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.castShadow = true
    mesh.scale.set(radius, radius, radius)
    mesh.position.copy(position)
    mesh.material.color = new THREE.Color(color)
    
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Sphere(radius)

    const body = new CANNON.Body({
        mass: mass,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    // body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh, body })

    if (mass === 0.1) {
        landmarks.push({mesh, body})
    }

    return mesh
}
    
const fingerColors = [
    '#ffffff', // Wrist (0)
    '#ff0000', '#ff0000', '#ff0000', '#ff0000', // Thumb (1-4)
    '#00ff00', '#00ff00', '#00ff00', '#00ff00', // Index (5-8)
    '#0000ff', '#0000ff', '#0000ff', '#0000ff', // Middle (9-12)
    '#ffff00', '#ffff00', '#ffff00', '#ffff00', // Ring (13-16)
    '#ff00ff', '#ff00ff', '#ff00ff', '#ff00ff'  // Pinky (17-20)
]

for (let i = 0; i < 21; i++) {
    const landmark = createSphere(0.01, new THREE.Vector3(i, i, i), 0.1) 
    landmark.material.color = new THREE.Color(fingerColors[i])
}


let middleKnuckleX
let middleKnuckleY
let depthToCamera


window.saveLandmarks = (canvasLandmarks, worldLandmarks) => {
    landmarkPositions = worldLandmarks

    middleKnuckleX = canvasLandmarks[9].x
    middleKnuckleY = canvasLandmarks[9].y

    const canvasDistance = getDistance(canvasLandmarks[0], canvasLandmarks[1])
    const worldDistance = getDistance(worldLandmarks[0], worldLandmarks[1])

    depthToCamera =  worldDistance / canvasDistance
}

const getDistance = (pointA, pointB) => {
    return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2)
}



// Create box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMapIntensity: 0.5
})
const createBox = (width, height, depth, position) =>
{
    // Three.js mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    // body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh, body })
}

// createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 })

/**
* Particles
*/
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/particle.png')

const particlesGeometry = new THREE.BufferGeometry()
const count = 5000

const positions = new Float32Array(count * 3)
const velocities = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
   positions[i] = (i % 3 != 2 ? (Math.random() - 0.5) : -Math.random()) * 0.5
   colors[i] = Math.random()
   velocities[i] = 0
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

const particlesMaterial = new THREE.PointsMaterial({
   size: 0.05,
   sizeAttenuation: true,
   alphaMap: particleTexture,
   transparent: true,
   depthWrite: false,
   blending: THREE.AdditiveBlending,
   vertexColors: true
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)

const particlesPARAM = {
    attractionRadius: 0.1,
    repulsionStrength: 0.03,
    dampingFactor: 1.5
}

const particlesFolder = pane.addFolder({ title: 'particles' })

const addParticlesButton = particlesFolder.addButton({
    title: 'add particles'
})

addParticlesButton.add = true

addParticlesButton.on('click', () => {
    addParticlesButton.add = !addParticlesButton.add
    if (addParticlesButton.add) {
        scene.remove(particles)
        addParticlesButton.title = 'add particles'
    } else {
        scene.add(particles)
        addParticlesButton.title = 'remove particles'
    }
})

particlesFolder.addButton({
    title: 'reset particles'
}).on('click', () => {
    const positions = particlesGeometry.attributes.position.array
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (i % 3 != 2 ? (Math.random() - 0.5) : -Math.random()) * 0.5
     }
})

particlesFolder.addBinding(particlesPARAM, 'attractionRadius', {
    min: 0, 
    max: 1,
    step: 0.1
})

particlesFolder.addBinding(particlesPARAM, 'repulsionStrength', {
    min: 0, 
    max: 0.1,
    step: 0.01
})

particlesFolder.addBinding(particlesPARAM, 'dampingFactor', {
    min: 0, 
    max: 3,
    step: 0.1
})





/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const video = document.getElementById('webcam')

const sizes = {
    width: window.innerWidth * 0.5,
    height: window.innerHeight
}

// const sizes = {
//     width: video.videoWidth,
//     height: video.videoHeight
// }


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth * 0.5
    sizes.height = window.innerHeight
    // sizes.width = video.videoWidth
    // sizes.height = video.videoHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, -1)
// camera.lookAt(0, 10, 0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// controls.target = new THREE.Vector3(0, 0.1, 0)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // alpha: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const SMOOTHING_FACTOR = 0.1 // Adjust this to fine-tune stability
const previousPositions = new Map()

const smoothPosition = (index, newPos) => {
    if (!previousPositions.has(index)) {
        previousPositions.set(index, new THREE.Vector3().copy(newPos))
    }
    const smoothedPos = previousPositions.get(index).lerp(newPos, SMOOTHING_FACTOR)
    previousPositions.set(index, smoothedPos.clone())
    return smoothedPos
}


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physics
    world.step(1 / 60, deltaTime, 3)
    
    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    for (let i = 0; i < landmarks.length; i++) {
        if (landmarkPositions && middleKnuckleX) {
            const landmark = landmarks[i]
            const position = new THREE.Vector3(
                landmarkPositions[i].x + (middleKnuckleX - 0.5) * depthToCamera, 
                -landmarkPositions[i].y - (middleKnuckleY - 0.5) * depthToCamera,
                landmarkPositions[i].z + (-1 + depthToCamera * 1.7), // 1.7 = scale factor for accurate sizing to 2d canvas, -1 = initial camera.position.z
            )
    
            const smoothedPosition = smoothPosition(i, position)
            landmark.mesh.position.copy(smoothedPosition)
            landmark.body.position.copy(smoothedPosition)
        }
    }

    // Get particle positions
    const positionsArray = particlesGeometry.attributes.position.array
    const velocitiesArray = velocities

    if (landmarkPositions) {
        for (let i = 0; i < count; i++) {
            const px = positionsArray[i * 3]
            const py = positionsArray[i * 3 + 1]
            const pz = positionsArray[i * 3 + 2]

            for (let j = 0; j < landmarks.length; j++) {
                const landmark = landmarks[j]
                const lx = landmark.mesh.position.x
                const ly = landmark.mesh.position.y
                const lz = landmark.mesh.position.z

                const dx = px - lx
                const dy = py - ly
                const dz = pz - lz
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

                if (distance < particlesPARAM.attractionRadius) {
                    const factor = (particlesPARAM.attractionRadius - distance) * particlesPARAM.repulsionStrength

                    velocitiesArray[i * 3] += dx * factor
                    velocitiesArray[i * 3 + 1] += dy * factor
                    velocitiesArray[i * 3 + 2] += dz * factor
                }
            }

            // Apply velocity
            positionsArray[i * 3] += velocitiesArray[i * 3]
            positionsArray[i * 3 + 1] += velocitiesArray[i * 3 + 1]
            positionsArray[i * 3 + 2] += velocitiesArray[i * 3 + 2]

            // Damping to slow down particles
            velocitiesArray[i * 3] *= particlesPARAM.dampingFactor
            velocitiesArray[i * 3 + 1] *= particlesPARAM.dampingFactor
            velocitiesArray[i * 3 + 2] *= particlesPARAM.dampingFactor
        }
    }

    particlesGeometry.attributes.position.needsUpdate = true

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
