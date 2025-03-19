import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'

import Experience from '../Experience'

export default class PhysicsDebug {
    constructor(physics) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.physics = physics
        this.world = this.physics.world

        this.setDebugMesh()
    }

    setDebugMesh() {
        this.debugMesh = new THREE.LineSegments(
            new THREE.BufferGeometry(),
            new THREE.LineBasicMaterial({ color: 0xff0000 })
        )
        this.debugMesh.frustumCulled = false
        this.scene.add(this.debugMesh)
    }

    update() {
        const debugData = this.world.debugRender() 
        const vertices = new Float32Array(debugData.vertices)
        const colors = new Float32Array(debugData.colors)

        this.debugMesh.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
        this.debugMesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))

        this.debugMesh.geometry.attributes.position.needsUpdate = true
        this.debugMesh.geometry.attributes.color.needsUpdate = true
    }
}
