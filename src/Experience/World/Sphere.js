import * as THREE from 'three'

import Experience from '../Experience.js'

export default class Sphere
{
    /**
     * @typedef {Object} SphereParams
     * @property {THREE.Geometry} [geometry] - Custom geometry for the sphere (optional).
     * @property {THREE.Material} [material] - Custom material for the sphere (optional).
     * @property {number} radius - The radius of the sphere.
     * @property {THREE.Vector3} position - The initial position of the sphere.
     * @property {THREE.Vector3} [color] - The initial position of the sphere.
     */

    /**
     * @param {SphereParams} param - Configuration options for the sphere.
     */

    constructor(param)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.param = param

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
        // this.setPhysics()
    }

    setGeometry()
    {
        if (this.param.geometry) {
            this.geometry = geometry
            return
        } 

        this.geometry = new THREE.SphereGeometry(1, 10, 10)
    }

    setMaterial()
    {
        if (this.param.material) {
            this.material = material
            return
        }

        this.material = new THREE.MeshStandardMaterial({
            metalness: 0.3,
            roughness: 0.4,
            envMapIntensity: 0.5
        })
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.castShadow = true
        this.mesh.scale.setScalar(this.param.radius)
        this.mesh.position.copy(this.param.position)
        this.scene.add(this.mesh)
    }

    setColor(color)
    {
        this.material.color = color
        this.color = color
    }

    setPhysics() {
        // this.physics.setBodyFromThree(this, this.angle)
    }

    setDebug()
    {
    }
}
