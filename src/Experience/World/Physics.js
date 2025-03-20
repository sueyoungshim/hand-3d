import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'

import Experience from '../Experience'

export default class Physics 
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.meshBodyPairs = []

        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()

        this.audio = new Audio('/collision.mp3')
    }

    // called from World.js
    setWorld() {
        return new Promise(async (resolve, reject) => {
            try {
                // Wait for RAPIER to initialize
                await RAPIER.init()
                this.gravity = new RAPIER.Vector3(0, -9.82, 0)
                this.world = new RAPIER.World(this.gravity)

                this.eventQueue = new RAPIER.EventQueue(true)

                this.setFloor()  
                // this.setWalls()
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }

    setFloor()
    {
        const floorBody = this.world.createRigidBody(
            new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed)
        )
        const floorShape = RAPIER.ColliderDesc.cuboid(100, 0, 100)
        this.world.createCollider(floorShape, floorBody)
    }

    // setWalls()
    // {
    //     const floorBody = this.world.createRigidBody(
    //         new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed)
    //     )
    //     const floorShape = RAPIER.ColliderDesc.cuboid(10, 0, 10)
    //     this.world.createCollider(floorShape, floorBody)
    // }

    setWalls() {
        const wallHeight = 5 
        const roomSize = 5
    
        // Wall positions (x, y, z)
        const wallPositions = [
            { x: 0, y: wallHeight / 2, z: -roomSize, rotation: 0 }, // Back wall
            { x: 0, y: wallHeight / 2, z: roomSize, rotation: 0 },  // Front wall
            { x: -roomSize, y: wallHeight / 2, z: 0, rotation: Math.PI * 0.5 }, // Left wall
            { x: roomSize, y: wallHeight / 2, z: 0, rotation: Math.PI * 0.5 }   // Right wall
        ]
    
        wallPositions.forEach(pos => {
            const wallBody = this.world.createRigidBody(
                new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed)
            )
            const wallShape = RAPIER.ColliderDesc.cuboid(roomSize, wallHeight / 2, 0)
            wallShape.setTranslation(pos.x, pos.y, pos.z) // Positioning the wall
            // wallBody.setRotation(RAPIER.Rotation(pos.rotation))
            wallShape.setRotation({ x: 0, y: Math.sin(pos.rotation / 2), z: 0, w: Math.cos(pos.rotation / 2) })
            this.world.createCollider(wallShape, wallBody)
        })
    }

    setBodyFromThree(threeInstance, isLandmark=false) {
        const mesh = threeInstance.mesh

        const rigidBodyType = isLandmark ? RAPIER.RigidBodyType.KinematicPositionBased : RAPIER.RigidBodyType.Dynamic
        
        const rigidBodyDesc = new RAPIER.RigidBodyDesc(rigidBodyType)
        rigidBodyDesc.setTranslation(
            mesh.position.x, 
            mesh.position.y,
            mesh.position.z
        )

        const rigidBody = this.world.createRigidBody(rigidBodyDesc)
        threeInstance.rigidBody = rigidBody

        const colliderDesc = RAPIER.ColliderDesc.ball(mesh.scale.x)

        colliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
        // colliderDesc.setRestitution(1)

        const mass = 0.01
        
        colliderDesc.setMass(mass)

        const collider = this.world.createCollider(colliderDesc, rigidBody)
        threeInstance.collider = collider

        if (isLandmark) return
        this.meshBodyPairs.push({ mesh, rigidBody })
    }

    handleCollisions() {
        this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
            
            if (started) {
                // this.playCollisionSound()
            }
        })
    }

    playCollisionSound() {
        console.log('play sound')
        
        // this.audio.volume = 2
        // this.audio.currentTime = 0
        // this.audio.play()
        // const audio = new Audio('/collision.mp3')
        // audio.play()
    }

    update()
    {
        if (!this.world) return 

        this.world.step(this.eventQueue)


        this.meshBodyPairs.forEach(({ mesh, rigidBody }) => {
            const position = rigidBody.translation()
            const rotation = rigidBody.rotation()

            mesh.position.set(position.x, position.y, position.z)
            mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
        })

        this.handleCollisions()
        
    }
}
