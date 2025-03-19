import Experience from "./Experience/Experience.js"

const experience = new Experience(document.querySelector('canvas.webgl'))

// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { Pane } from 'tweakpane'
// import * as CANNON from 'cannon-es'
// import RAPIER from '@dimforge/rapier3d-compat'

// console.log(RAPIER)

// /**
//  * Debug
//  */

// const pane = new Pane()


// const physicsFolder = pane.addFolder({ title: 'physics object' })

// physicsFolder
//     .addButton({
//         title: 'add sphere'
//     })
//     .on('click', () => {
//         createSphere(
//             0.02,
//             {
//                 x: 0,
//                 y: 0.5,
//                 z: -0.5
//             },
//             1
//         )
//     })

// physicsFolder
//     .addButton({
//         title: 'remove objects'
//     })
//     .on('click', () => {
//         for(const object of objectsToUpdate)
//         {
//             world.removeBody(object.body)
//             scene.remove(object.mesh)
//         }
//         objectsToUpdate.splice(0, objectsToUpdate.length)
//     })

// const ballPitFolder = pane.addFolder({ title: 'ball pit' })

// ballPitFolder.addButton({
//     title: 'add ball pit'
// }).on('click', () => {
//     console.log('add ball pit')

//     // add walls
//     for (let i = 0; i < 4; i++) {
//         const floorShape = new CANNON.Plane()
//         const floorBody = new CANNON.Body()
//         floorBody.mass = 0
//         floorBody.addShape(floorShape)
//         floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), Math.PI * 0.5) 

//         floorBody.position.z = -1
//         world.addBody(floorBody)
//     }
    
//     // add balls
//     for (let i = 0; i < 20; i++) {
//         createSphere(
//             0.02, 
//             {
//                 x: (Math.random() - 0.5) * 0.5,
//                 y: (Math.random() - 0.5) * 0.5,
//                 z: -Math.random() * 0.5
//             },
//             1
//         )
//     }
// })

// /**
//  * Physics
//  */
// const world = new CANNON.World()
// world.broadphase = new CANNON.SAPBroadphase(world)
// world.allowSleep = true
// world.gravity.set(0, - 9.82, 0)

// // Default material
// const defaultMaterial = new CANNON.Material('default')
// const defaultContactMaterial = new CANNON.ContactMaterial(
//     defaultMaterial,
//     defaultMaterial,
//     {
//         friction: 0.5,
//         restitution: 0.3
//     }
// )
// world.defaultContactMaterial = defaultContactMaterial


// // Floor
// const floorShape = new CANNON.Plane()
// const floorBody = new CANNON.Body()
// floorBody.mass = 0
// floorBody.addShape(floorShape)
// floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 
// floorBody.position.z = -0.5
// world.addBody(floorBody)

// /**
//  * Utils
//  */
// const objectsToUpdate = []

// // Create sphere

// const landmarks = []
// let landmarkPositions

// const createSphere = (radius, position, mass=1, color='#ffffff') =>
// {
//     // Three.js mesh

//     // Cannon.js body
//     const shape = new CANNON.Sphere(radius)

//     const body = new CANNON.Body({
//         mass: mass,
//         position: new CANNON.Vec3(0, 3, 0),
//         shape: shape,
//         material: defaultMaterial
//     })
//     body.position.copy(position)
//     // body.addEventListener('collide', playHitSound)
//     world.addBody(body)

//     // Save in objects
//     objectsToUpdate.push({ mesh, body })

//     if (mass === 0.1) {
//         landmarks.push({mesh, body})
//     }

//     return mesh
// }



// // Create box
// const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
// const boxMaterial = new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//     envMapIntensity: 0.5
// })
// const createBox = (width, height, depth, position) =>
// {
//     // Three.js mesh
//     const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
//     mesh.scale.set(width, height, depth)
//     mesh.castShadow = true
//     mesh.position.copy(position)
//     scene.add(mesh)

//     // Cannon.js body
//     const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

//     const body = new CANNON.Body({
//         mass: 1,
//         position: new CANNON.Vec3(0, 3, 0),
//         shape: shape,
//         material: defaultMaterial
//     })
//     body.position.copy(position)
//     // body.addEventListener('collide', playHitSound)
//     world.addBody(body)

//     // Save in objects
//     objectsToUpdate.push({ mesh, body })
// }

// // createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 })


// /**
//  * Animate
//  */
// const clock = new THREE.Clock()
// let oldElapsedTime = 0

// const SMOOTHING_FACTOR = 0.1
// const previousPositions = new Map()

// const smoothPosition = (index, newPos) => {
//     if (!previousPositions.has(index)) {
//         previousPositions.set(index, new THREE.Vector3().copy(newPos))
//     }
//     const smoothedPos = previousPositions.get(index).lerp(newPos, SMOOTHING_FACTOR)
//     previousPositions.set(index, smoothedPos.clone())
//     return smoothedPos
// }


// const tick = () =>
// {
//     const elapsedTime = clock.getElapsedTime()
//     const deltaTime = elapsedTime - oldElapsedTime
//     oldElapsedTime = elapsedTime

//     // Update physics
//     world.step(1 / 60, deltaTime, 3)
    
//     for(const object of objectsToUpdate)
//     {
//         object.mesh.position.copy(object.body.position)
//         object.mesh.quaternion.copy(object.body.quaternion)
//     }

//     controls.update()
//     renderer.render(scene, camera)
//     window.requestAnimationFrame(tick)
// }

// tick()
