import * as THREE from 'three'

import Experience from '../Experience.js'

export default class Sphere
{
    constructor(physics)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.physics = physics


        this.setGeometry()
        this.setMaterial()
        // this.setMesh()
        this.setDebug()
    }

    setGeometry()
    {
        this.geometry = new THREE.SphereGeometry(1, 10, 10)
    }

    setMaterial()
    {
        // this.material = new THREE.MeshStandardMaterial({
        //     metalness: 0.3,
        //     roughness: 0.4,
        //     envMapIntensity: 0.5
        // })

        this.material = new THREE.MeshMatcapMaterial()
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.castShadow = true
        this.mesh.scale.setScalar(0.5)
        this.mesh.position.set(
            (Math.random() - 0.5) * 10, 
            (Math.random() + 0.5) * 2, 
            (Math.random() - 0.5) * 10)
        this.scene.add(this.mesh)

        this.instance = { mesh: this.mesh }

        this.physics.setBodyFromThree(this.instance)
    }

    setColor(color)
    {
        this.material.color = color
        this.color = color
    }
    
    setDebug()
    {

        // const physicsFolder = this.debug.ui.addFolder({ title: 'physics object' })

        // physicsFolder
        //     .addButton({
        //         title: 'add sphere'
        //     })
        //     .on('click', () => {
        //         this.setMesh()
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

        
        const ballPitFolder = this.debug.ui.addFolder({ title: 'ball pit' })
        
        const addBallPitButton = ballPitFolder.addButton({
            title: 'add ball pit'
        })
        let clicked = false
        addBallPitButton.on('click', () => {
            if (!clicked) {
                this.physics.setWalls()
                clicked = true
                addBallPitButton.title = 'add more balls'
            }

            // add balls
            for (let i = 0; i < 20; i++) {
                this.setMesh()
            }
        })
    }
}
