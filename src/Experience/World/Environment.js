import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        
        

        // this.setBackground()
        this.setAmbientLight()
        this.setDirectionalLight()
    }

    setBackground()
    {
        this.scene.background = new THREE.Color('#aaffff')
    }

    setAmbientLight()
    {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
        this.scene.add(this.ambientLight)
    }

    setDirectionalLight()
    {

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
        this.directionalLight.castShadow = true
        this.directionalLight.shadow.mapSize.set(1024, 1024)
        this.directionalLight.shadow.camera.far = 15
        this.directionalLight.shadow.camera.left = - 7
        this.directionalLight.shadow.camera.top = 7
        this.directionalLight.shadow.camera.right = 7
        this.directionalLight.shadow.camera.bottom = - 7
        this.directionalLight.position.set(5, 5, 5)
        this.scene.add(this.directionalLight)
    }

    setDebug()
    {
        this.debugFolder = this.debug.ui.addFolder({
            title: 'environment',
            expanded: false
        })

        this.debugFolder
        .addBinding(this.directionalLight, 'intensity', 
        { min: 0, max: 10, step: 0.001} )

        this.debugFolder
        .addBinding(this.directionalLight.position, 'x',
        { min: -5, max: 5, step: 0.001 })


        this.debugFolder
        .addBinding(this.directionalLight.position, 'y', 
        { min: -5, max: 5, step: 0.001 })

        this.debugFolder
        .addBinding(this.directionalLight.position, 'z', 
        { min: -5, max: 5, step: 0.001 })
    }

    setEnvironmentMap()
    {
        
    }
}
