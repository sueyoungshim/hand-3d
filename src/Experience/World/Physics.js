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

        const mass = 1
        
        colliderDesc.setMass(mass)

        const collider = this.world.createCollider(colliderDesc, rigidBody)
        threeInstance.collider = collider

        if (isLandmark) return
        this.meshBodyPairs.push({ mesh, rigidBody })
    }

    handleCollisions() {
        this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
            
            if (started) {
                console.log(`Collision detected between ${handle1} and ${handle2}`)
            }
        })
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
